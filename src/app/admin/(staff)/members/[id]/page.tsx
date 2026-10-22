import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";
import { EVENTS, FORCE_CLUB_NAMES, PROVINCE_OF, type District } from "@/lib/reference";
import { roleBadge } from "@/lib/slaa-id";
import { deleteMember, suspendMember, verifyMember } from "../../actions";
import { StatusBadge } from "../../StatusBadge";
import { EditProfile } from "@/components/admin/EditProfile";
import { LinkEditor } from "@/components/admin/LinkEditor";

export const metadata = { title: "Member · SLA admin" };

const eventName = (c: string) => EVENTS.find((e) => e.code === c)?.name ?? c;
const fmt = (d: Date | null) =>
  d ? d.toLocaleString("en-GB", { timeZone: "Asia/Colombo" }) : "";

const LANGUAGE_NAMES: Record<string, string> = { en: "English", si: "Sinhala", ta: "Tamil" };
const QUALIFICATION_NAMES: Record<string, string> = {
  CECS_L1_YOUTH: "World Athletics CECS Level 1 (Youth)",
  CECS_L2_EVENT: "World Athletics CECS Level 2 (Event group)",
  CECS_L3_ELITE: "World Athletics CECS Level 3 (Elite)",
  SLAA_NATIONAL: "SLA national coaching certificate",
  UNIVERSITY_SPORT_SCI: "University degree in sport science",
};

const ACADEMIC_NAMES: Record<string, string> = { SCHOOL: "School", UNIVERSITY: "University", NONE: "Not studying" };
const MEMBERSHIP_NAMES: Record<string, string> = {
  REGULAR_SERVICE: "Regular / volunteer service",
  CONTRACT_SPORTS: "Contract / sports basis",
};

const DELETE_ERRORS: Record<string, string> = {
  confirm: "The SLA ID you typed did not match. Nothing was deleted.",
  reason: "Please give a reason for deleting. Nothing was deleted.",
  merged: "Other records were merged into this one, so it cannot be deleted.",
};

export default async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleteError?: string; actionError?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { deleteError, actionError } = await searchParams;
  const slaaId = decodeURIComponent(id).toUpperCase();

  const [m] =
    await sql`SELECT *, date_of_birth::text AS dob, updated_at::text AS version FROM member WHERE slaa_id = ${slaaId}`;
  if (!m) notFound();

  const [
    [coach],
    [athlete],
    guardians,
    coaches,
    athletes,
    requests,
    audit,
    events,
    qualifications,
    declarations,
    listedAthletes,
    [photo],
    [club],
  ] = await Promise.all([
    sql`SELECT * FROM coach WHERE slaa_id = ${slaaId}`,
    sql`SELECT * FROM athlete WHERE slaa_id = ${slaaId}`,
    sql`SELECT * FROM guardian WHERE athlete_id = ${slaaId} ORDER BY id`,
    sql`SELECT ac.*, mm.full_name, mm.status FROM athlete_coach ac JOIN member mm ON mm.slaa_id = ac.coach_id
        WHERE ac.athlete_id = ${slaaId} ORDER BY ac.relationship_type, ac.id`,
    sql`SELECT ac.*, mm.full_name, mm.status FROM athlete_coach ac JOIN member mm ON mm.slaa_id = ac.athlete_id
        WHERE ac.coach_id = ${slaaId} ORDER BY ac.relationship_type, ac.id`,
    sql`SELECT * FROM coach_request WHERE requested_by = ${slaaId} ORDER BY id`,
    sql`SELECT * FROM audit_log WHERE slaa_id = ${slaaId} ORDER BY at DESC LIMIT 100`,
    sql`SELECT * FROM athlete_event WHERE athlete_id = ${slaaId} ORDER BY rank`,
    sql`SELECT q.*, d.id AS document_id, d.file_name, d.size_bytes
        FROM coach_qualification q
        LEFT JOIN coach_document d ON q.document_path = 'coach_document:' || d.id::text
        WHERE q.coach_id = ${slaaId} ORDER BY q.year_awarded DESC, q.id`,
    sql`SELECT cd.*, dt.title FROM coach_declaration cd
        JOIN declaration_text dt USING (code, version)
        WHERE cd.coach_id = ${slaaId} ORDER BY cd.answer DESC, cd.id`,
    sql`SELECT * FROM coach_athlete_request WHERE coach_id = ${slaaId} ORDER BY id`,
    sql`SELECT id FROM coach_document WHERE coach_id = ${slaaId} AND kind = 'photo' AND attached_at IS NOT NULL`,
    sql`SELECT c.club_id, c.name, c.status FROM athlete a JOIN club c ON c.club_id = a.club_id WHERE a.slaa_id = ${slaaId}`,
  ]);
  const badge = roleBadge(
    { athlete: !!athlete, coach: !!coach },
    qualifications.filter((q) => q.verification_status === "verified").map((q) => q.level as string),
  );
  const clubLabel = !athlete?.represents_club_or_force
    ? "No"
    : athlete.club_category === "CIVIL_CLUB"
      ? club ? `${club.name} (${club.club_id}, ${club.status})` : athlete.club_id
      : athlete.club_category === "OTHER"
        ? `${athlete.unlisted_club_name} (not in the club list — check it)`
        : FORCE_CLUB_NAMES[athlete.club_category as keyof typeof FORCE_CLUB_NAMES];

  const identity = [
    m.nic && ["NIC", `${m.nic} (entered as ${m.nic_as_entered})`],
    m.postal_id && ["Postal ID", m.postal_id],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="flex flex-col gap-6">
      {actionError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          Give a reason before changing a member&apos;s status.
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/admin/coach-document/${photo.id}?inline=1`} alt={`Profile photo of ${m.full_name}`}
            className="size-20 shrink-0 rounded-lg border object-cover" />
        )}
        <div>
          <p className="font-mono text-sm text-muted-foreground">
            {m.slaa_id} {badge && <span className="ml-1 font-semibold text-primary">{badge}</span>}
          </p>
          <h1 className="text-2xl font-bold">{m.full_name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <StatusBadge status={m.status} />
            {coach && <span>Coach</span>}
            {athlete && <span>Athlete</span>}
            {m.merged_into && (
              <span>
                → merged into{" "}
                <Link
                  className="text-primary underline"
                  href={`/admin/members/${m.merged_into}`}
                >
                  {m.merged_into}
                </Link>
              </span>
            )}
          </div>
        </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(m.status === "pending" || m.status === "suspended") && (
            <form action={verifyMember}>
              <input type="hidden" name="slaaId" value={m.slaa_id} />
              <button className="h-9 rounded-md bg-emerald-700 px-4 text-sm text-white">
                {m.status === "suspended" ? "Reinstate (verified)" : "Verify"}
              </button>
            </form>
          )}
          {(m.status === "pending" || m.status === "verified") && (
            <form action={suspendMember} className="flex gap-2">
              <input type="hidden" name="slaaId" value={m.slaa_id} />
              <input
                name="reason"
                required
                maxLength={500}
                placeholder="Reason"
                className="h-9 w-40 rounded-md border px-2 text-sm"
              />
              <button className="h-9 rounded-md border border-red-300 px-4 text-sm text-red-700">
                Suspend
              </button>
            </form>
          )}
        </div>
      </div>

      {m.status !== "merged" && (
        <EditProfile
          value={{
            slaaId: m.slaa_id,
            version: m.version,
            fullName: m.full_name,
            nameWithInitials: m.name_with_initials ?? "",
            nic: m.nic_as_entered ?? m.nic ?? "",
            postalId: m.postal_id ?? "",
            dateOfBirth: m.dob,
            gender: m.gender,
            district: m.district,
            phone: m.phone ?? "",
            email: m.email ?? "",
            athlete: !!athlete,
            coach: !!coach,
            schoolOrClub: athlete?.school_or_club ?? "",
            licenseNo: coach?.slaa_license_no ?? "",
            licenseLevel: coach?.license_level ?? "",
            disciplines: coach?.disciplines ?? [],
            events: events.map((e) => ({
              code: e.event_code,
              pb: e.personal_best ?? "",
              pbYear: e.pb_year == null ? "" : String(e.pb_year),
              pbCompetition: e.pb_competition ?? "",
            })),
            guardian: guardians[0]
              ? {
                  fullName: guardians[0].full_name,
                  relationship: guardians[0].relationship,
                  phone: guardians[0].phone,
                  nic: guardians[0].nic ?? "",
                }
              : null,
          }}
        />
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Personal details">
          <Dl
            rows={[
              ...identity,
              ["Name with initials", m.name_with_initials],
              ["Date of birth", m.dob],
              ["Gender", m.gender === "F" ? "Female" : "Male"],
              ["District", m.district],
              ["Province", PROVINCE_OF[m.district as District]],
              ["Phone", m.phone],
              ["Email", m.email],
              ["Language", LANGUAGE_NAMES[m.language_pref as string] ?? "—"],
              ["Consent", `${m.consent_version} at ${fmt(m.consent_at)}`],
              ["Registered", fmt(m.created_at)],
            ]}
          />
        </Card>

        {coach && (
          <Card title="Coach profile">
            <Dl
              rows={[
                ["Licence no.", coach.slaa_license_no],
                ["Licence level", coach.license_level],
                ["Events", coach.disciplines.map(eventName).join(", ")],
                [
                  "Registered via",
                  coach.registered_via === "public" ? "Coach portal" : "Staff / import",
                ],
                [
                  "Verified",
                  coach.is_verified
                    ? `by ${coach.verified_by} at ${fmt(coach.verified_at)}`
                    : "No",
                ],
              ]}
            />
          </Card>
        )}

        {athlete && (
          <Card title="Athlete profile">
            <Dl
              rows={[
                ["Studying", [ACADEMIC_NAMES[athlete.academic_status as string], athlete.academic_institution].filter(Boolean).join(" · ")],
                ["Club or armed force", clubLabel],
                ["Service", [MEMBERSHIP_NAMES[athlete.forces_membership_type as string], athlete.forces_service_id].filter(Boolean).join(" · ")],
                ["School or club (summary)", athlete.school_or_club],
              ]}
            />
            {events.length > 0 ? (
              <table className="mt-3 w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-1 pr-2">#</th>
                    <th className="py-1 pr-2">Event</th>
                    <th className="py-1 pr-2">PB</th>
                    <th className="py-1">Year / competition</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {events.map((e) => (
                    <tr key={e.event_code}>
                      <td className="py-1.5 pr-2 text-muted-foreground">
                        {e.rank}
                        {e.rank === 1 ? " (main)" : ""}
                      </td>
                      <td className="py-1.5 pr-2">{eventName(e.event_code)}</td>
                      <td className="py-1.5 pr-2 font-mono">
                        {e.personal_best ?? "—"}
                      </td>
                      <td className="py-1.5">
                        {[e.pb_year, e.pb_competition]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Events: {athlete.main_events.map(eventName).join(", ") || "—"}
              </p>
            )}
          </Card>
        )}

        {guardians.map((g) => (
          <Card key={g.id} title="Guardian">
            <Dl
              rows={[
                ["Name", g.full_name],
                ["Relationship", g.relationship],
                ["Phone", g.phone],
                ["NIC", g.nic],
                ["Consent", fmt(g.consent_given_at)],
              ]}
            />
          </Card>
        ))}
      </div>

      {athlete && (
        <Card title="Coaches">
          <LinkTable rows={coaches} who="coach_id" />
          {m.status !== "merged" && m.status !== "suspended" && (
            <>
              {coaches.map((link) => (
                <LinkEditor key={link.id} athleteId={m.slaa_id} row={link} />
              ))}
              <LinkEditor athleteId={m.slaa_id} />
            </>
          )}
          {requests.length > 0 && (
            <div className="mt-3 text-sm">
              <p className="font-medium">Coaches not in the list</p>
              <ul className="mt-1 list-disc pl-5">
                {requests.map((r) => (
                  <li key={r.id}>
                    {r.coach_name} ·{" "}
                    {r.relationship_type === "CURRENT" ? "current" : "past"}
                    {(r.start_year || r.end_year) &&
                      ` (${[r.start_year, r.end_year].filter(Boolean).join("–")})`}
                    {" · "}
                    {r.coach_phone ?? "no phone"} ·{" "}
                    {r.coach_district ?? "no district"} ·{" "}
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
      {coach && (
        <Card title="Athletes">
          <LinkTable rows={athletes} who="athlete_id" />
          {listedAthletes.length > 0 && (
            <div className="mt-3 text-sm">
              <p className="font-medium">Athletes listed without a matching SLA ID</p>
              <ul className="mt-1 list-disc pl-5">
                {listedAthletes.map((r) => (
                  <li key={r.id}>
                    {r.athlete_name}
                    {r.athlete_slaa_id && <span className="font-mono"> ({r.athlete_slaa_id})</span>} ·{" "}
                    {r.relationship_type === "CURRENT" ? "current" : "past"}
                    {r.is_primary ? " (main coach)" : ""}
                    {(r.start_year || r.end_year) &&
                      ` (${[r.start_year, r.end_year].filter(Boolean).join("–")})`}
                    {" · "}
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {coach && (qualifications.length > 0 || coach.confidential_disclosure) && (
        <Card title="Qualifications">
          {qualifications.length > 0 ? (
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {qualifications.map((q) => (
                  <tr key={q.id}>
                    <td className="py-1.5 pr-3">
                      {q.level === "OTHER" ? q.level_other_text : QUALIFICATION_NAMES[q.level as string]}
                      {q.event_group && <span className="text-muted-foreground"> · {q.event_group}</span>}
                    </td>
                    <td className="py-1.5 pr-3">{q.issuing_body}</td>
                    <td className="py-1.5 pr-3 font-mono">{q.certificate_serial ?? "—"}</td>
                    <td className="py-1.5 pr-3">{q.year_awarded}</td>
                    <td className="py-1.5">
                      {q.document_id ? (
                        <a className="text-primary underline" href={`/api/admin/coach-document/${q.document_id}`}>
                          {q.file_name} ({Math.ceil(Number(q.size_bytes) / 1024)} KB)
                        </a>
                      ) : (
                        <span className="text-muted-foreground">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">None.</p>
          )}
          {coach.confidential_disclosure && (
            <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">Confidential note from the coach</p>
              <p className="mt-1 whitespace-pre-wrap">{coach.confidential_disclosure}</p>
            </div>
          )}
        </Card>
      )}
      {coach && declarations.length > 0 && (
        <Card title={`Declarations (version ${declarations[0].version}, signed "${declarations[0].signed_name}")`}>
          <ul className="divide-y text-sm">
            {declarations.map((d) => (
              <li key={d.id} className="py-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>{d.title}</span>
                  {d.answer === "disclose" ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      Disclosed · review {d.review_status}
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-700">Confirmed</span>
                  )}
                </div>
                {d.disclosure_details && (
                  <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2">{d.disclosure_details}</p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Signed {fmt(declarations[0].accepted_at)}</p>
        </Card>
      )}

      <section className="rounded-lg border border-red-200 bg-background p-4">
        <h2 className="font-semibold text-red-800">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently removes this person&apos;s details, coach links, guardian
          details and coach requests. This cannot be undone. The person could
          then register again with the same ID. The audit log keeps only who
          deleted it, when, and the reason.
        </p>
        {deleteError && DELETE_ERRORS[deleteError] && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {DELETE_ERRORS[deleteError]}
          </p>
        )}
        <details className="mt-3" open={!!deleteError}>
          <summary className="cursor-pointer text-sm font-medium text-red-700">
            Delete this account…
          </summary>
          <form
            action={deleteMember}
            className="mt-3 flex flex-col gap-2 text-sm sm:max-w-md"
          >
            <input type="hidden" name="slaaId" value={m.slaa_id} />
            <label htmlFor="del-reason">Reason</label>
            <input
              id="del-reason"
              name="reason"
              required
              maxLength={500}
              placeholder="e.g. Test entry, person asked to be removed"
              className="h-9 rounded-md border px-2"
            />
            <label htmlFor="del-confirm">
              Type <span className="font-mono font-semibold">{m.slaa_id}</span>{" "}
              to confirm
            </label>
            <input
              id="del-confirm"
              name="confirm"
              required
              autoComplete="off"
              className="h-9 rounded-md border px-2 font-mono uppercase"
            />
            <button className="h-9 self-start rounded-md bg-red-700 px-4 text-white">
              Delete permanently
            </button>
          </form>
        </details>
      </section>

      <Card title="Audit history">
        <ul className="divide-y text-sm">
          {audit.map((a) => (
            <li key={a.id} className="flex flex-wrap gap-x-3 py-1.5">
              <span className="text-muted-foreground">{fmt(a.at)}</span>
              <span className="font-medium">{a.action}</span>
              <span>{a.actor}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {JSON.stringify(a.details)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-background p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Dl({ rows }: { rows: [string, unknown][] }) {
  return (
    <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="break-words">{v ? String(v) : "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function LinkTable({
  rows,
  who,
}: {
  rows: Record<string, unknown>[];
  who: "coach_id" | "athlete_id";
}) {
  if (!rows.length)
    return <p className="text-sm text-muted-foreground">None.</p>;
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y">
        {rows.map((r) => (
          <tr key={String(r.id)}>
            <td className="py-1.5 pr-3 font-mono">
              <Link
                className="text-primary hover:underline"
                href={`/admin/members/${r[who]}`}
              >
                {String(r[who])}
              </Link>
            </td>
            <td className="py-1.5 pr-3">{String(r.full_name)}</td>
            <td className="py-1.5 pr-3">
              {r.relationship_type === "CURRENT" ? "Current" : "Past"}
              {r.is_primary ? " (primary)" : ""}
            </td>
            <td className="py-1.5 pr-3">
              {[r.start_year, r.end_year].filter(Boolean).join("–")}
            </td>
            <td className="py-1.5">
              {r.review_status === "rejected"
                ? "Rejected"
                : !r.is_approved_by_coach
                  ? "Awaiting coach"
                  : r.is_confirmed_by_athlete === false
                    ? "Listed by coach · awaiting athlete"
                    : "Confirmed"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
