import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";
import { ActionForm } from "@/components/admin/ActionForm";
import { CoachImport } from "@/components/admin/CoachImport";
import { DISTRICTS, type District, EVENTS, PROVINCE_OF } from "@/lib/reference";
import { createCoach } from "../suite-actions";
import { StatusBadge } from "../StatusBadge";
import {
  coachFilters,
  coachWhere,
  type CoachFilters,
} from "@/lib/coach-filters";

export const maxDuration = 60;
export const metadata = { title: "Coaches · SLA admin" };

const PAGE_SIZE = 25;

type CoachRow = {
  slaa_id: string;
  full_name: string;
  name_with_initials: string | null;
  nic: string | null;
  nic_as_entered: string | null;
  postal_id: string | null;
  district: string;
  phone: string | null;
  email: string | null;
  status: string;
  created_at: Date;
  slaa_license_no: string | null;
  license_level: string | null;
  disciplines: string[];
  is_verified: boolean;
  verified_by: string | null;
  verified_at: Date | null;
  athlete_count: number;
};

type StatsRow = {
  total: number;
  verified: number;
  pending: number;
  athletes_linked: number;
};

const eventName = (c: string) => EVENTS.find((e) => e.code === c)?.name ?? c;

function getWhatsAppLink(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const rawParams = await searchParams;
  const filters: CoachFilters = coachFilters(rawParams);
  const { page, q, district, status, level } = filters;
  const whereClause = coachWhere(filters);

  const [rows, [{ total_matching }], [stats]] = await Promise.all([
    sql<CoachRow[]>`
      SELECT 
        m.slaa_id,
        m.full_name,
        m.name_with_initials,
        m.nic,
        m.nic_as_entered,
        m.postal_id,
        m.district,
        m.phone,
        m.email,
        m.status,
        m.created_at,
        c.slaa_license_no,
        c.license_level,
        COALESCE(c.disciplines, '{}') AS disciplines,
        c.is_verified,
        c.verified_by,
        c.verified_at,
        COUNT(ac.id)::int AS athlete_count
      FROM coach c
      JOIN member m ON m.slaa_id = c.slaa_id
      LEFT JOIN athlete_coach ac ON ac.coach_id = c.slaa_id
      ${whereClause}
      GROUP BY 
        m.slaa_id, m.full_name, m.name_with_initials, m.nic, m.nic_as_entered,
        m.postal_id, m.district, m.phone, m.email, m.status, m.created_at,
        c.slaa_license_no, c.license_level, c.disciplines, c.is_verified,
        c.verified_by, c.verified_at
      ORDER BY m.created_at DESC, m.slaa_id
      LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}
    `,
    sql<[{ total_matching: number }]>`
      SELECT COUNT(DISTINCT c.slaa_id)::int AS total_matching
      FROM coach c
      JOIN member m ON m.slaa_id = c.slaa_id
      ${whereClause}
    `,
    sql<StatsRow[]>`
      SELECT 
        COUNT(c.slaa_id)::int AS total,
        COUNT(*) FILTER (WHERE c.is_verified OR m.status = 'verified')::int AS verified,
        COUNT(*) FILTER (WHERE NOT c.is_verified AND m.status = 'pending')::int AS pending,
        (SELECT COUNT(*)::int FROM athlete_coach)::int AS athletes_linked
      FROM coach c
      JOIN member m ON m.slaa_id = c.slaa_id
      WHERE m.status <> 'merged'
    `,
  ]);

  const totalPages = Math.ceil(total_matching / PAGE_SIZE) || 1;

  const buildQuery = (patch: Record<string, string | number | undefined>) => {
    const merged = { ...rawParams, ...patch };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "" && v !== null) {
        p.set(k, String(v));
      }
    }
    return `?${p.toString()}`;
  };

  const hasActiveFilters = Boolean(q || district || status || level);

  const inputField = (name: string, label: string, type = "text") => (
    <label key={name} className="text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        maxLength={254}
        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Add and import coaches
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Directory of registered coaches, credentials, athlete links, and
            management tools.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download */}
          <a
            href="/api/admin/coach-template"
            className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            Download CSV Template
          </a>
          <Link
            href="/admin/coach-requests"
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            Review Coach Requests →
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-background p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">
            Total Coaches
          </p>
          <p className="mt-1 text-2xl font-bold">{stats?.total ?? 0}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Registered profiles
          </p>
        </div>
        <div className="rounded-xl border bg-background p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">
            Verified Coaches
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {stats?.verified ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Credentials confirmed
          </p>
        </div>
        <div className="rounded-xl border bg-background p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">
            Pending Verification
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {stats?.pending ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Awaiting verification
          </p>
        </div>
        <div className="rounded-xl border bg-background p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">
            Athletes Coached
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {stats?.athletes_linked ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Active athlete links
          </p>
        </div>
      </div>

      {/* Action Tools: CSV Import & Add One Coach */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-background p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Import coach CSV</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Bulk tool
            </span>
          </div>
          <CoachImport />
        </section>

        <details className="group rounded-xl border bg-background p-5 shadow-xs">
          <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-primary">
            <span>Add one coach</span>
            <span className="text-xs font-normal text-muted-foreground group-open:hidden">
              Click to expand
            </span>
            <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
              Click to close
            </span>
          </summary>
          <ActionForm
            action={createCoach}
            submit="Create coach profile"
            className="mt-4 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {inputField("fullName", "Full name")}
              {inputField("nameWithInitials", "Name with initials")}
              <label className="text-sm font-medium">
                Identity type
                <select
                  name="identityType"
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="nic">NIC</option>
                  <option value="postal">Postal ID</option>
                </select>
              </label>
              {inputField("nic", "NIC number")}
              {inputField("postalId", "Postal ID (if selected)")}
              {inputField(
                "dateOfBirth",
                "Date of birth (required for Postal ID)",
                "date",
              )}
              <label className="text-sm font-medium">
                Gender (derived from NIC when used)
                <select
                  name="gender"
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                District
                <select
                  name="district"
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              {inputField("phone", "Mobile phone (optional)", "tel")}
              {inputField("email", "Email (optional)", "email")}
              {inputField("licenseNo", "Licence number (optional)")}
              {inputField("licenseLevel", "Licence level (optional)")}
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Coaching events
              </legend>
              <div className="grid max-h-36 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-3">
                {EVENTS.map((e) => (
                  <label key={e.code} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" name="disciplines" value={e.code} />
                    <span>{e.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-medium">
              Source or reason
              <textarea
                name="reason"
                required
                maxLength={500}
                placeholder="e.g. Registered at SLA headquarters with coach credentials verified"
                className="mt-1 h-20 w-full rounded-lg border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="consent" required className="mt-0.5" />
                This coach authorized SLA to store these details.
              </label>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="linkExisting" className="mt-0.5" />
                If this identity belongs to an existing member, add a coach role to
                their existing SLA ID while preserving personal details.
              </label>
            </div>
          </ActionForm>
        </details>
      </div>

      {/* Coaches Directory Section */}
      <section className="space-y-4 rounded-xl border bg-background p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">Registered Coaches</h2>
            <p className="text-xs text-muted-foreground">
              {total_matching} {total_matching === 1 ? "coach" : "coaches"}{" "}
              found {hasActiveFilters && "(filtered)"}
            </p>
          </div>

          {/* Search and Filter Form */}
          <form method="GET" className="flex flex-wrap items-center gap-2 text-sm">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, ID, licence, phone, NIC..."
              className="h-9 w-64 rounded-md border border-input bg-background px-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              name="district"
              defaultValue={district}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={status}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <input
              name="level"
              defaultValue={level}
              placeholder="Licence level"
              className="h-9 w-28 rounded-md border border-input bg-background px-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="h-9 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Filter
            </button>
            {hasActiveFilters && (
              <Link
                href="/admin/coaches"
                className="h-9 rounded-md border px-2.5 text-xs font-medium leading-9 text-muted-foreground hover:bg-muted"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Coaches Table */}
        {!rows.length ? (
          <div className="py-12 text-center">
            <p className="text-base font-medium">No coaches found.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting or clearing your search filters."
                : "Add a coach using the form above or import from CSV."}
            </p>
            {hasActiveFilters && (
              <Link
                href="/admin/coaches"
                className="mt-3 inline-block text-xs font-semibold text-primary underline"
              >
                Clear all filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 pr-3 pl-2">Coach Details</th>
                  <th className="py-3 px-3">Licence & Credentials</th>
                  <th className="py-3 px-3">District</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Athletes</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 pr-2 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((c) => {
                  const wa = getWhatsAppLink(c.phone);
                  const prov = PROVINCE_OF[c.district as District] ?? "";
                  return (
                    <tr
                      key={c.slaa_id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Coach info */}
                      <td className="py-3.5 pr-3 pl-2 align-top">
                        <Link
                          href={`/admin/members/${c.slaa_id}`}
                          className="font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {c.full_name}
                        </Link>
                        {c.name_with_initials && (
                          <p className="text-xs text-muted-foreground">
                            {c.name_with_initials}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {c.slaa_id}
                          </span>
                          {(c.nic || c.postal_id) && (
                            <span className="text-[11px] text-muted-foreground">
                              · {c.nic ? `NIC: ${c.nic}` : `Postal: ${c.postal_id}`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Licence & Credentials */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {c.slaa_license_no ? (
                            <span className="font-mono text-xs font-medium">
                              #{c.slaa_license_no}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No licence #
                            </span>
                          )}
                          {c.license_level && (
                            <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-800 border border-sky-200">
                              {c.license_level}
                            </span>
                          )}
                        </div>
                        {c.disciplines && c.disciplines.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1 max-w-xs">
                            {c.disciplines.slice(0, 3).map((d) => (
                              <span
                                key={d}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground font-medium"
                                title={eventName(d)}
                              >
                                {eventName(d)}
                              </span>
                            ))}
                            {c.disciplines.length > 3 && (
                              <span
                                className="rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground"
                                title={c.disciplines.slice(3).map(eventName).join(", ")}
                              >
                                +{c.disciplines.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">
                            No events listed
                          </p>
                        )}
                      </td>

                      {/* District & Province */}
                      <td className="py-3.5 px-3 align-top">
                        <p className="font-medium">{c.district}</p>
                        {prov && (
                          <p className="text-xs text-muted-foreground">
                            {prov} Prov.
                          </p>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-3 align-top text-xs">
                        {c.phone ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${c.phone}`}
                              className="font-medium hover:underline text-foreground"
                            >
                              {c.phone}
                            </a>
                            {wa && (
                              <a
                                href={wa}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-emerald-700 font-semibold hover:underline"
                                title="Chat on WhatsApp"
                              >
                                WA
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No phone</span>
                        )}
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="mt-0.5 block truncate max-w-[160px] text-muted-foreground hover:text-foreground hover:underline"
                            title={c.email}
                          >
                            {c.email}
                          </a>
                        )}
                      </td>

                      {/* Athletes Count */}
                      <td className="py-3.5 px-3 align-top">
                        <Link
                          href={`/admin/members/${c.slaa_id}`}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20"
                        >
                          {c.athlete_count}{" "}
                          {c.athlete_count === 1 ? "athlete" : "athletes"}
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex flex-col gap-1">
                          <div>
                            <StatusBadge status={c.status} />
                          </div>
                          {c.is_verified ? (
                            <span className="text-[11px] font-medium text-emerald-700">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              Unverified
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pr-2 pl-3 align-top text-right">
                        <Link
                          href={`/admin/members/${c.slaa_id}`}
                          className="inline-block rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Profile →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs">
            <span className="text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, total_matching)} of {total_matching}{" "}
              coaches
            </span>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildQuery({ page: page - 1 })}
                  className="rounded-md border bg-background px-3 py-1.5 font-medium hover:bg-muted"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-md border bg-muted/40 px-3 py-1.5 font-medium text-muted-foreground">
                  ← Previous
                </span>
              )}
              <span className="font-medium">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={buildQuery({ page: page + 1 })}
                  className="rounded-md border bg-background px-3 py-1.5 font-medium hover:bg-muted"
                >
                  Next →
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-md border bg-muted/40 px-3 py-1.5 font-medium text-muted-foreground">
                  Next →
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
