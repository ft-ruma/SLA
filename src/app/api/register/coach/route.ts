import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { DECLARATIONS, DECLARATION_VERSION } from "@/lib/declarations";
import { passKey } from "@/lib/guard";
import { CONSENT_VERSION, errorResponse, parseRegistration, personFromIdentity } from "@/lib/register";
import {
  ageOn,
  cleanText,
  coachRegisterSchema,
  normalizeIdentity,
  normalizePhone,
  signatureMatches,
} from "@/lib/validation";

// Coach portal submission. Accepts only the coach schema: athlete fields
// (guardian, events with personal bests, coach links) are not read here, and
// the athlete route never writes coach data.
//
// mode "new":     a person with no SLA ID; a member and a coach are created.
// mode "addRole": a person who already has an SLA ID (as an athlete) adds the
//                 coach role to that same ID. Their personal details stay as
//                 they are; the signature must match the name on record.

class Rejected extends Error {
  constructor(readonly status: number, readonly error: string, readonly field: string) {
    super(error);
  }
  response() {
    return NextResponse.json({ error: this.error, fields: { [this.field]: this.error } }, { status: this.status });
  }
}

const year = (y: number | "") => (y === "" ? null : y);

export async function POST(req: Request) {
  const parsed = await parseRegistration(req, coachRegisterSchema);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;
  const { identity, form, lang } = body;
  if (identity.type !== "nic") return new Rejected(400, "Coaches register with their NIC.", "identity").response();
  const id = normalizeIdentity(identity);

  if (body.mode === "new") {
    const person = personFromIdentity(identity, body.form);
    // The schema checked the posted copies; re-check with the NIC's date of birth.
    if (ageOn(person.dateOfBirth) < 18) {
      return new Rejected(400, "Coaches must be 18 or older.", "dateOfBirth").response();
    }
    if (!signatureMatches(form.signature, person.fullName)) {
      return new Rejected(400, "The signature must match your full name exactly.", "signature").response();
    }
  }

  const uploadKey = passKey(req);
  const certIds = form.qualifications.map((q) => q.documentId).filter((d) => d !== "");
  const docIds = form.photoId ? [...certIds, form.photoId] : certIds;
  if (docIds.length && !uploadKey) {
    return NextResponse.json(
      { error: "Your session has expired. Please start the registration again." },
      { status: 401 },
    );
  }

  const ip = isIP(parsed.ip) ? parsed.ip : null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;
  const signedName = cleanText(form.signature);

  try {
    const result = await sql.begin(async (tx) => {
      // The declarations shown must be the ones currently in force.
      const active = await tx<{ code: string }[]>`
        SELECT code FROM declaration_text WHERE version = ${DECLARATION_VERSION} AND active AND required`;
      const shown = new Set(DECLARATIONS.map((d) => d.code));
      if (active.some((a) => !shown.has(a.code))) {
        throw new Rejected(409, "Please answer every declaration.", "declarations");
      }

      if (docIds.length) {
        const docs = await tx<{ id: string; kind: string }[]>`
          SELECT id, kind FROM coach_document
          WHERE id IN ${tx(docIds)} AND upload_key = ${uploadKey} AND coach_id IS NULL
          FOR UPDATE`;
        const kindOf = new Map(docs.map((d) => [d.id, d.kind]));
        if (certIds.some((d) => kindOf.get(d) !== "certificate")) {
          throw new Rejected(400, "A certificate file could not be found. Please attach it again.", "qualifications");
        }
        if (form.photoId && kindOf.get(form.photoId) !== "photo") {
          throw new Rejected(400, "Your photo could not be found. Please add it again.", "photoId");
        }
      }

      let coachId: string;
      let phone: string | null;
      if (body.mode === "new") {
        const person = personFromIdentity(identity, body.form);
        phone = normalizePhone(body.form.phone);
        const [m] = await tx<{ slaa_id: string }[]>`
          INSERT INTO member (slaa_id, nic_as_entered, postal_id,
                              full_name, name_with_initials, date_of_birth, gender, district, phone, email,
                              consent_version, consent_at, language_pref)
          VALUES (new_slaa_id('C'), ${id.nic}, ${id.postalId},
                  ${person.fullName}, ${person.nameWithInitials}, ${person.dateOfBirth}, ${person.gender},
                  ${body.form.district}, ${phone}, ${form.email.toLowerCase() || null},
                  ${CONSENT_VERSION}, now(), ${lang})
          RETURNING slaa_id`;
        coachId = m.slaa_id;
      } else {
        // The ID must belong to the identity that passed the check.
        const [m] = await tx<{ slaa_id: string; full_name: string; dob: string; phone: string | null; is_coach: boolean }[]>`
          SELECT m.slaa_id, m.full_name, m.date_of_birth::text AS dob, m.phone,
                 EXISTS (SELECT 1 FROM coach c WHERE c.slaa_id = m.slaa_id) AS is_coach
          FROM member m
          WHERE m.slaa_id = ${body.slaaId} AND m.status IN ('pending', 'verified')
            AND m.slaa_id IN (SELECT f.slaa_id FROM find_existing_member(${id.nic}, ${id.postalId}) f)
          FOR UPDATE`;
        if (!m) throw new Rejected(409, "This ID is not registered. Please start again.", "identity");
        if (m.is_coach) throw new Rejected(409, "This ID is already registered as a coach.", "identity");
        if (ageOn(m.dob) < 18) throw new Rejected(400, "Coaches must be 18 or older.", "identity");
        if (!signatureMatches(form.signature, m.full_name)) {
          throw new Rejected(400, "The signature must match the full name on your SLA record.", "signature");
        }
        coachId = m.slaa_id;
        phone = m.phone;
        if (form.email) {
          await tx`UPDATE member SET email = coalesce(email, ${form.email.toLowerCase()}) WHERE slaa_id = ${coachId}`;
        }
      }

      await tx`
        INSERT INTO coach (slaa_id, slaa_license_no, license_level, disciplines, registered_via)
        VALUES (${coachId}, ${cleanText(form.licenseNo).toUpperCase() || null}, ${cleanText(form.licenseLevel) || null},
                ${[...new Set(form.disciplines)]}, 'public')`;

      for (const q of form.qualifications) {
        await tx`
          INSERT INTO coach_qualification (coach_id, level, level_other_text, event_group, issuing_body,
                                           certificate_serial, year_awarded, document_path)
          VALUES (${coachId}, ${q.level}, ${q.level === "OTHER" ? cleanText(q.levelOther) : null},
                  ${q.eventGroup || null}, ${cleanText(q.issuingBody)}, ${cleanText(q.serial) || null},
                  ${year(q.year)}, ${q.documentId ? `coach_document:${q.documentId}` : null})`;
      }
      if (docIds.length) {
        await tx`UPDATE coach_document SET coach_id = ${coachId}, attached_at = now() WHERE id IN ${tx(docIds)}`;
      }

      let disclosures = 0;
      for (const d of DECLARATIONS) {
        const a = form.declarations[d.code];
        const disclose = a.answer === "disclose";
        if (disclose) disclosures++;
        await tx`
          INSERT INTO coach_declaration (coach_id, code, version, answer, disclosure_details, signed_name,
                                         ip_address, user_agent, review_status)
          VALUES (${coachId}, ${d.code}, ${DECLARATION_VERSION}, ${disclose ? "disclose" : "confirm"},
                  ${disclose ? cleanText(a.details) : null}, ${signedName}, ${ip}, ${userAgent},
                  ${disclose ? "pending" : "not_needed"})`;
      }

      // Athletes who named this coach before the coach registered (matched by
      // mobile number). The coach has not confirmed these yet. An athlete
      // adding the coach role can never become their own coach.
      const matched = phone
        ? await tx<
            { requested_by: string; relationship_type: "CURRENT" | "PAST"; start_year: number | null; end_year: number | null }[]
          >`
            UPDATE coach_request SET status = 'registered', resolved_coach = ${coachId}
            WHERE status IN ('pending', 'invited') AND coach_phone = ${phone} AND requested_by <> ${coachId}
            RETURNING requested_by, relationship_type, start_year, end_year`
        : [];
      for (const r of matched) {
        if (r.relationship_type === "CURRENT") {
          await tx`
            INSERT INTO athlete_coach (athlete_id, coach_id, relationship_type, is_primary, start_year, end_year,
                                       is_approved_by_coach, listed_by, is_confirmed_by_athlete)
            VALUES (${r.requested_by}, ${coachId}, 'CURRENT', false, ${r.start_year}, NULL, false, 'athlete', true)
            ON CONFLICT (athlete_id, coach_id) WHERE relationship_type = 'CURRENT' DO NOTHING`;
        } else {
          await tx`
            INSERT INTO athlete_coach (athlete_id, coach_id, relationship_type, is_primary, start_year, end_year,
                                       is_approved_by_coach, listed_by, is_confirmed_by_athlete)
            VALUES (${r.requested_by}, ${coachId}, 'PAST', false, ${r.start_year}, ${r.end_year}, false, 'athlete', true)`;
        }
      }

      await tx`
        INSERT INTO audit_log (actor, action, slaa_id, details)
        VALUES ('public', ${body.mode === "new" ? "register_coach" : "add_coach_role"}, ${coachId}, ${tx.json({
          identity_type: identity.type,
          ip_hash: parsed.ipHash,
          language: lang,
          qualifications: form.qualifications.length,
          documents: certIds.length,
          photo: form.photoId !== "",
          disclosures,
          athlete_requests_matched: matched.length,
        })})`;
      return coachId;
    });

    return NextResponse.json({ slaaId: result }, { status: 201 });
  } catch (e) {
    if (e instanceof Rejected) return e.response();
    return errorResponse(e, "register coach");
  }
}
