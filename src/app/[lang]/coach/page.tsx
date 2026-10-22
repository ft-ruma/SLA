import {
  ArrowRight, BadgeCheck, CircleCheck, ClipboardCheck, ClipboardList, FileBadge, Fingerprint, GraduationCap,
  PhoneCall, ShieldCheck, Timer, Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StopwatchArt } from "@/components/art";
import { localePath, t, type Lang, type MessageKey } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "SLA Coach Portal · Sri Lanka Athletics" };

// The coaches' own front door, styled apart from the athletes' pages.
// It leads only to the coach registration.
export default async function CoachPortalPage() {
  const lang = await getLang();
  const start = localePath(lang, "/register/coach");

  return (
    <div className="coach-theme flex flex-1 flex-col">
      <section className="coach-board relative overflow-hidden text-white">
        <span aria-hidden className="watermark pointer-events-none absolute -right-4 bottom-0 text-[7rem] sm:text-[12rem] lg:text-[15rem]">
          {t(lang, "coachWatermark")}
        </span>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:grid-cols-[1.2fr_1fr] lg:pt-20 lg:pb-24">
          <div className="flex flex-col items-start gap-5">
            <span className="rise inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-xs font-bold tracking-widest text-gold uppercase sm:text-sm">
              <ClipboardList className="size-4" aria-hidden /> {t(lang, "portalCoachBadge")}
            </span>
            <h1 className="rise rise-2 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t(lang, "coachHomeTitle")}
            </h1>
            <span className="h-1.5 w-20 rounded-full bg-gold" aria-hidden />
            <p className="rise rise-3 max-w-xl text-base text-pretty text-white/80 sm:text-lg">{t(lang, "coachHomeIntro")}</p>
            <ul className="flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
              {[
                { icon: <GraduationCap />, label: t(lang, "coachChipQual") },
                { icon: <ShieldCheck />, label: t(lang, "coachChipSafe") },
                { icon: <BadgeCheck />, label: t(lang, "coachChipClean") },
              ].map((c) => (
                <li key={c.label} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 [&_svg]:size-4 [&_svg]:text-gold">
                  {c.icon} {c.label}
                </li>
              ))}
            </ul>
            <Link href={start} data-testid="coach-start"
              className="group mt-2 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gold px-7 text-lg font-extrabold text-[var(--coach-night)] shadow-xl shadow-black/40 transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0">
              <ClipboardCheck className="size-6" aria-hidden />
              {t(lang, "coachHomeCta")}
              <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
            </Link>
            <p className="flex items-center gap-2 text-sm text-white/70"><Timer className="size-4" aria-hidden /> {t(lang, "coachHomeCtaNote")}</p>
          </div>

          <div aria-hidden className="relative hidden min-h-80 items-center justify-center lg:flex">
            <StopwatchArt className="absolute -top-6 right-2 w-48 text-white" />
            <CoachCard lang={lang} className="relative mt-16 -rotate-3" />
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-6 sm:py-16">
        <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="form-anchor rounded-3xl border bg-background p-6">
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--coach-ink)] text-gold"><ClipboardList className="size-5" aria-hidden /></span>
              {t(lang, "coachNeedTitle")}
            </h2>
            <ul className="mt-5 flex flex-col gap-3.5">
              {(["coachNeed1", "coachNeed2", "coachNeed3", "coachNeed4"] as MessageKey[]).map((k) => (
                <li key={k} className="flex items-start gap-3 text-sm sm:text-base">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
                  <span className="text-pretty">{t(lang, k)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="form-anchor rounded-3xl border bg-background p-6">
            <h2 className="text-xl font-extrabold">{t(lang, "coachHowTitle")}</h2>
            <ol className="relative mt-5 flex flex-col gap-5 before:absolute before:top-2 before:bottom-2 before:left-5 before:w-0.5 before:bg-gold/50">
              {([
                { k: "homeCoachHow1", icon: <Fingerprint /> },
                { k: "homeCoachHow2", icon: <FileBadge /> },
                { k: "homeCoachHow3", icon: <ClipboardCheck /> },
                { k: "coachHow4", icon: <PhoneCall /> },
              ] as { k: MessageKey; icon: React.ReactNode }[]).map((s, i) => (
                <li key={s.k} className="relative flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--coach-night)] text-gold ring-4 ring-[var(--coach-paper)] [&_svg]:size-5">
                    {s.icon}
                  </span>
                  <div className="pt-0.5">
                    <p className="text-[11px] font-bold tracking-[0.16em] text-amber-700 uppercase">{t(lang, "coachStep", { n: String(i + 1) })}</p>
                    <p className="font-semibold text-pretty">{t(lang, s.k)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="code-title">
          <h2 id="code-title" className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">{t(lang, "coachCodeTitle")}</h2>
          <span className="mx-auto mt-3 block h-1.5 w-16 rounded-full bg-gold" aria-hidden />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {([
              { title: "coachCode1Title", text: "coachCode1", icon: <ShieldCheck /> },
              { title: "coachChipClean", text: "coachCode2", icon: <BadgeCheck /> },
              { title: "coachCode3Title", text: "coachCode3", icon: <GraduationCap /> },
            ] as { title: MessageKey; text: MessageKey; icon: React.ReactNode }[]).map((c) => (
              <div key={c.title} className="coach-board relative overflow-hidden rounded-3xl p-6 text-white shadow-lg">
                <span className="grid size-12 place-items-center rounded-2xl bg-gold text-[var(--coach-night)] [&_svg]:size-6">{c.icon}</span>
                <h3 className="mt-4 text-lg font-bold">{t(lang, c.title)}</h3>
                <p className="mt-1 text-sm text-white/75 text-pretty">{t(lang, c.text)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="coach-board relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl px-6 py-10 text-center text-white">
          <Users className="size-8 text-gold" aria-hidden />
          <p className="max-w-xl text-xl font-bold text-balance sm:text-2xl">{t(lang, "coachHomeTitle")}</p>
          <Link href={start}
            className="group inline-flex min-h-13 items-center gap-2 rounded-xl bg-gold px-6 font-extrabold text-[var(--coach-night)] shadow-lg transition hover:-translate-y-0.5">
            {t(lang, "coachHomeCta")} <ArrowRight className="size-5 transition group-hover:translate-x-1" aria-hidden />
          </Link>
          <p className="text-sm text-white/70">{t(lang, "coachNeed4")}</p>
        </section>
      </div>
    </div>
  );
}

function CoachCard({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <div className={cn("w-72 overflow-hidden rounded-3xl bg-white text-foreground shadow-2xl shadow-black/50 ring-2 ring-gold/70", className)}>
      <div className="flex items-center justify-between bg-[var(--coach-ink)] px-4 py-3">
        <Image src="/brand/sla-lion.png" alt="" width={409} height={245} className="h-7 w-auto" />
        <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--coach-night)] uppercase">{t(lang, "cardCoach")}</span>
      </div>
      <div className="flex items-end justify-between gap-3 p-4">
        <div>
          <p className="text-[11px] text-muted-foreground">{t(lang, "cardSlaaId")}</p>
          <p className="font-mono text-xl font-bold tracking-wider">SL26-000045-0</p>
          <div className="mt-2 h-1 w-14 rounded-full bg-gold" />
        </div>
        <span className="grid size-12 place-items-center rounded-2xl bg-[var(--coach-ink)] text-gold"><ClipboardCheck className="size-6" /></span>
      </div>
    </div>
  );
}
