import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { errorResponse, parseRegistration } from "@/lib/register";
import { normalizeNic } from "@/lib/nic";
import { cleanText, clubRegisterSchema, normalizePhone } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * Registers a club, school, university or institution. It starts as
 * "pending": athletes can only pick it from the list once SLA staff verify it.
 */
export async function POST(req: Request) {
  const parsed = await parseRegistration(req, clubRegisterSchema);
  if ("response" in parsed) return parsed.response;
  const { form, lang } = parsed.data;

  // stored in the 12-digit form, like member.nic
  const nic = (v: string) => (v.trim() === "" ? null : normalizeNic(v));

  try {
    const clubId = await sql.begin(async (tx) => {
      const [row] = await tx<{ club_id: string }[]>`
        INSERT INTO club (club_id, name, category, affiliation_number, district,
                          president_name, president_nic, president_phone,
                          secretary_name, secretary_nic, secretary_phone, email, language_pref)
        VALUES (new_club_id(${form.district}), ${cleanText(form.name)}, ${form.category},
                ${cleanText(form.affiliationNumber).toUpperCase() || null}, ${form.district},
                ${cleanText(form.presidentName)}, ${nic(form.presidentNic)}, ${normalizePhone(form.presidentPhone)},
                ${cleanText(form.secretaryName)}, ${nic(form.secretaryNic)}, ${normalizePhone(form.secretaryPhone)},
                ${form.email.trim().toLowerCase()}, ${lang})
        RETURNING club_id`;
      await tx`
        INSERT INTO audit_log (actor, action, slaa_id, details)
        VALUES ('public', 'register_club', ${row.club_id}, ${tx.json({
          category: form.category,
          ip_hash: parsed.ipHash,
          language: lang,
        })})`;
      return row.club_id;
    });
    return NextResponse.json({ clubId }, { status: 201 });
  } catch (e) {
    return errorResponse(e, "register club");
  }
}
