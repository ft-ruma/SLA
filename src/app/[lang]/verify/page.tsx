import { BadgeCheck, CircleAlert, Clock, Search, ShieldOff } from "lucide-react";
import { headers } from "next/headers";
import { PageContainer } from "@/components/Page";
import { sql } from "@/lib/db";
import { rateLimit } from "@/lib/guard";
import { districtName, localePath, t, type MessageKey } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { isValidSlaaId, roleBadge } from "@/lib/slaa-id";
import { cn } from "@/lib/utils";

export const metadata = { title: "Check an SLA ID · SLA National Register" };

type Found = {
  slaa_id: string;
  masked_name: string;
  district: string;
  status: "pending" | "verified" | "suspended";
  is_athlete: boolean;
  is_coach: boolean;
  coach_levels: string[];
};

// Public SLA ID check: masked name, district, role and status only. No NIC,
// phone, email or date of birth ever leaves the database here.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const lang = await getLang();
  const raw = ((await searchParams).id ?? "").trim().toUpperCase().slice(0, 20);

  let outcome: "none" | "invalid" | "notFound" | "limited" | "error" | "found" = "none";
  let found: Found | null = null;
  if (raw) {
    if (!isValidSlaaId(raw)) {
      outcome = "invalid";
    } else {
      try {
        const limited = await rateLimit(new Request("https://sla.local/verify", { headers: await headers() }), "search");
        if (limited) {
          outcome = "limited";
        } else {
          const rows = await sql<Found[]>`
            SELECT m.slaa_id, mask_name(coalesce(nullif(m.name_with_initials, ''), m.full_name)) AS masked_name,
                   m.district, m.status,
                   EXISTS (SELECT 1 FROM athlete a WHERE a.slaa_id = m.slaa_id) AS is_athlete,
                   EXISTS (SELECT 1 FROM coach c WHERE c.slaa_id = m.slaa_id) AS is_coach,
                   ARRAY(SELECT q.level FROM coach_qualification q
                         WHERE q.coach_id = m.slaa_id AND q.verification_status = 'verified') AS coach_levels
            FROM member m
            WHERE m.slaa_id = ${raw} AND m.status IN ('pending', 'verified', 'suspended')`;
          found = rows[0] ?? null;
          outcome = found ? "found" : "notFound";
        }
      } catch (e) {
        console.error("verify lookup failed", e);
        outcome = "error";
      }
    }
  }

  const statusIcon = { verified: <BadgeCheck />, pending: <Clock />, suspended: <ShieldOff /> };
  const statusTone = {
    verified: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-900",
    suspended: "bg-muted text-muted-foreground",
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t(lang, "verifyTitle")}</h1>
          <p className="mt-2 text-muted-foreground text-pretty">{t(lang, "verifyIntro")}</p>
        </div>

        <form action={localePath(lang, "/verify")} method="get" className="flex flex-col gap-2 rounded-2xl border bg-background p-4 shadow-xs sm:p-6">
          <label htmlFor="verify-id" className="text-sm font-medium">{t(lang, "verifyLabel")}</label>
          <div className="flex gap-2">
            <input id="verify-id" name="id" defaultValue={raw} required autoComplete="off" placeholder={t(lang, "verifyPlaceholder")}
              className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 font-mono text-lg uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
            <button className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90">
              <Search className="size-4" aria-hidden /> {t(lang, "verifyButton")}
            </button>
          </div>
        </form>

        {outcome !== "none" && outcome !== "found" && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {outcome === "invalid" && t(lang, "verifyInvalid")}
            {outcome === "notFound" && t(lang, "verifyNotFound")}
            {outcome === "limited" && t(lang, "verifyTooMany")}
            {outcome === "error" && t(lang, "serverError")}
          </p>
        )}

        {found && (
          <div data-testid="verify-result" className="overflow-hidden rounded-2xl bg-background shadow-lg ring-1 ring-black/5">
            <div className={cn("track-lanes flex items-center justify-between gap-3 px-5 py-3 text-white",
              found.is_coach && !found.is_athlete ? "bg-brand-deep" : "bg-brand")}>
              <span className="text-xs font-semibold tracking-widest text-gold uppercase">{t(lang, "cardOrg")}</span>
              <span className="flex gap-1.5">
                {found.is_athlete && <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-brand-deep">{t(lang, "verifyRoleAthlete")}</span>}
                {found.is_coach && <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-brand-deep">{t(lang, "verifyRoleCoach")}</span>}
              </span>
            </div>
            <div className="flex flex-col gap-3 p-5 sm:p-6">
              <p className="text-sm text-muted-foreground">{t(lang, "verifyFound")}</p>
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-3xl font-bold tracking-wider break-all">{found.slaa_id}</span>
                <span data-testid="role-badge" className="font-mono text-base font-bold text-primary">
                  {roleBadge({ athlete: found.is_athlete, coach: found.is_coach }, found.coach_levels)}
                </span>
              </p>
              <p className="text-lg font-medium">{found.masked_name} · {districtName(lang, found.district)}</p>
              <span className={cn("inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-sm font-semibold [&_svg]:size-4",
                statusTone[found.status])}>
                {statusIcon[found.status]}
                {t(lang, `verifyStatus_${found.status}` as MessageKey)}
              </span>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
