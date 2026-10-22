import {
  ArrowRight, CircleCheck, ClipboardList, Fingerprint, IdCard, Info, Languages, ListChecks, MapPin, Medal, Search,
  ShieldCheck, Sparkles, Users,
} from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { TrackArt } from "@/components/art";
import { sql } from "@/lib/db";
import { LANG_LABELS, LANGS, localePath, t, type Lang, type MessageKey } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

type Stats = { athletes: number; coaches: number; districts: number };

// Public counters. Cached for five minutes so a busy registration day does
// not turn the home page into a database load.
const getStats = unstable_cache(
  async (): Promise<Stats | null> => {
    try {
      const [s] = await sql<Stats[]>`
        SELECT
          (SELECT count(*)::int FROM athlete a JOIN member m USING (slaa_id) WHERE m.status IN ('pending','verified')) AS athletes,
          (SELECT count(*)::int FROM coach c JOIN member m USING (slaa_id) WHERE m.status IN ('pending','verified')) AS coaches,
          (SELECT count(DISTINCT district)::int FROM member WHERE status IN ('pending','verified')) AS districts`;
      return s;
    } catch (e) {
      console.error("home stats failed", e);
      return null;
    }
  },
  ["home-stats"],
  { revalidate: 300 },
);

// The home page is the athletes' front door. Coaches have their own portal
// (/coach); here they only get one quiet link to it.
export default async function Home() {
  const lang = await getLang();
  const stats = await getStats();
  const fmt = (n: number) => n.toLocaleString("en-LK");

  return (
    <>
      <section className="track-lanes relative overflow-hidden bg-brand text-white">
        <TrackArt className="pointer-events-none absolute right-0 bottom-0 hidden h-[115%] w-auto opacity-70 lg:block" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:pt-20 lg:pb-24">
          <div className="flex flex-col items-start gap-5">
            <span className="rise inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-wide text-gold ring-1 ring-white/20 sm:text-sm">
              <Sparkles className="size-3.5" aria-hidden /> {t(lang, "homeEyebrow")}
            </span>
            <h1 className="rise rise-2 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t(lang, "heroTitle")}
            </h1>
            <p className="rise rise-3 max-w-xl text-base text-pretty text-white/85 sm:text-lg">{t(lang, "heroIntro")}</p>

            <div className="rise rise-3 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={localePath(lang, "/register/athlete")} data-testid="home-athlete"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gold px-7 text-lg font-extrabold text-brand-deep shadow-xl shadow-black/25 transition hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0">
                <Medal className="size-6" aria-hidden />
                {t(lang, "heroCta")}
                <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link href={localePath(lang, "/verify")}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-5 font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10">
                <Search className="size-5" aria-hidden /> {t(lang, "navVerify")}
              </Link>
            </div>
            <p className="text-sm text-white/75">{t(lang, "heroCtaNote")}</p>
          </div>

          <div aria-hidden className="relative hidden h-full min-h-80 items-center justify-center lg:flex">
            <div className="absolute size-80 rounded-full bg-white/10 blur-3xl" />
            <Image src="/brand/sla-lion.png" alt="" width={409} height={245} priority
              className="absolute top-2 left-6 h-auto w-44 -rotate-6 opacity-95 drop-shadow-xl" />
            <AthleteCard lang={lang} className="relative mt-24 rotate-3" />
          </div>
        </div>
      </section>

      {stats && (
        <section aria-label={t(lang, "siteTitle")} className="relative z-10 mx-auto -mt-10 w-full max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x overflow-hidden rounded-3xl bg-background shadow-xl shadow-brand/10 ring-1 ring-black/5">
            {[
              { icon: <Medal />, n: stats.athletes, label: t(lang, "statsAthletes") },
              { icon: <Users />, n: stats.coaches, label: t(lang, "statsCoaches") },
              { icon: <MapPin />, n: stats.districts, label: t(lang, "statsDistricts") },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-2 py-5 text-center sm:py-6">
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:size-4.5" aria-hidden>{s.icon}</span>
                <p className="text-2xl font-extrabold tabular-nums sm:text-4xl">{fmt(s.n)}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-6 sm:py-16">
        <section aria-labelledby="how-title">
          <h2 id="how-title" className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t(lang, "athleteHowTitle")}
          </h2>
          <span className="mx-auto mt-3 block h-1.5 w-16 rounded-full bg-gold" aria-hidden />
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {([
              { k: "homeAthleteHow1", icon: <Fingerprint /> },
              { k: "homeAthleteHow2", icon: <ListChecks /> },
              { k: "homeAthleteHow3", icon: <IdCard /> },
            ] as { k: MessageKey; icon: React.ReactNode }[]).map((s, i) => (
              <li key={s.k} className="group relative overflow-hidden rounded-3xl border bg-background p-6 shadow-xs transition hover:-translate-y-0.5 hover:shadow-lg">
                <span aria-hidden className="absolute -top-4 -right-1 text-8xl font-black text-primary/6 transition group-hover:text-primary/10">
                  {i + 1}
                </span>
                <span className="grid size-12 place-items-center rounded-2xl bg-brand text-gold shadow-md shadow-brand/30 [&_svg]:size-6">
                  {s.icon}
                </span>
                <p className="mt-4 text-xs font-bold tracking-[0.14em] text-primary uppercase">{t(lang, "coachStep", { n: String(i + 1) })}</p>
                <p className="mt-1 text-lg font-semibold text-pretty">{t(lang, s.k)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-center">
            <Link href={localePath(lang, "/register/athlete")}
              className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-md transition hover:bg-primary/90">
              {t(lang, "heroCta")} <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-3xl border bg-background p-6 shadow-xs">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Languages className="size-6" aria-hidden /></span>
            <h2 className="text-lg font-bold">{t(lang, "homeLangTitle")}</h2>
            <p className="text-sm text-muted-foreground text-pretty">{t(lang, "homeLangText")}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {LANGS.map((l) => (
                <Link key={l} href={localePath(l)} lang={l} hrefLang={l} aria-current={l === lang ? "true" : undefined}
                  className={cn("rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                    l === lang ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary hover:text-primary")}>
                  {LANG_LABELS[l]}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-3xl border bg-background p-6 shadow-xs">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><ShieldCheck className="size-6" aria-hidden /></span>
            <h2 className="text-lg font-bold">{t(lang, "homeSeparateTitle")}</h2>
            <p className="text-sm text-muted-foreground text-pretty">{t(lang, "homeSeparateText")}</p>
          </div>
          <form action={localePath(lang, "/verify")} method="get"
            className="flex flex-col gap-3 rounded-3xl border bg-background p-6 shadow-xs">
            <span className="grid size-12 place-items-center rounded-2xl bg-gold/35 text-brand-deep"><Search className="size-6" aria-hidden /></span>
            <h2 className="text-lg font-bold">{t(lang, "homeVerifyTitle")}</h2>
            <p className="text-sm text-muted-foreground text-pretty">{t(lang, "homeVerifyText")}</p>
            <label htmlFor="home-verify" className="sr-only">{t(lang, "verifyLabel")}</label>
            <div className="mt-auto flex gap-2 pt-2">
              <input id="home-verify" name="id" required placeholder={t(lang, "verifyPlaceholder")} autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 font-mono uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
              <button className="h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                {t(lang, "verifyButton")}
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border bg-background p-6 shadow-xs">
            <h2 className="font-bold">{t(lang, "needTitle")}</h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm">
              {(["need1", "need2", "need3"] as const).map((k) => (
                <li key={k} className="flex items-start gap-2.5">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                  {t(lang, k)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <Info className="size-4 text-primary" aria-hidden />
              {t(lang, "homeAlreadyTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">{t(lang, "homeAlreadyText")}</p>
          </div>
        </section>

        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted-foreground">
          <ClipboardList className="size-4 text-[var(--coach-ink)]" aria-hidden />
          {t(lang, "coachNoteText")}
          <Link href={localePath(lang, "/coach")} data-testid="home-coach"
            className="font-semibold text-[var(--coach-ink)] underline decoration-gold decoration-2 underline-offset-4">
            {t(lang, "coachNoteLink")}
          </Link>
        </p>
      </div>
    </>
  );
}

function AthleteCard({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <div className={cn("w-72 overflow-hidden rounded-3xl bg-white text-foreground shadow-2xl shadow-black/40 ring-1 ring-black/5", className)}>
      <div className="track-lanes flex items-center justify-between bg-brand px-4 py-3">
        <span className="text-[11px] font-bold tracking-widest text-gold uppercase">{t(lang, "cardOrg")}</span>
        <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-extrabold text-brand-deep">{t(lang, "cardAthlete")}</span>
      </div>
      <div className="flex items-end justify-between gap-3 p-4">
        <div>
          <p className="text-[11px] text-muted-foreground">{t(lang, "cardSlaaId")}</p>
          <p className="font-mono text-xl font-bold tracking-wider">SL26-000123-5</p>
          <div className="mt-2 h-1 w-14 rounded-full bg-gold" />
        </div>
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Medal className="size-6" /></span>
      </div>
    </div>
  );
}
