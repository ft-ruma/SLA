"use client";

import { ArrowRight, BadgeCheck, Check, ClipboardList, GraduationCap, Medal, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/registration-state";
import { cn } from "@/lib/utils";
import { StopwatchArt, TrackArt } from "./art";
import { useT } from "./LangProvider";

/**
 * Full-width banner at the top of each registration. Athletes get SLA blue
 * with running-track lanes; coaches get night navy, a tactics-board pattern,
 * a stopwatch and a gold "Coach portal" badge. It also shows the 3 steps.
 */
export function PortalHero({ role }: { role: Role }) {
  const { t } = useT();
  const pathname = usePathname() ?? "";
  const step = pathname.endsWith("/details") ? 2 : pathname.endsWith("/done") ? 3 : 1;
  const coach = role === "coach";

  return (
    <section data-portal={role} aria-label={coach ? t("portalCoach") : t("portalAthlete")}
      className={cn("no-print relative overflow-hidden text-white", coach ? "coach-board" : "track-lanes bg-brand")}>
      {coach ? (
        <>
          <span aria-hidden className="watermark pointer-events-none absolute -right-3 -bottom-2 text-[5.5rem] sm:text-[9rem]">
            {t("coachWatermark")}
          </span>
          <StopwatchArt className="pointer-events-none absolute -top-4 right-6 hidden w-36 text-white md:block" />
        </>
      ) : (
        <TrackArt className="pointer-events-none absolute right-0 bottom-0 h-full w-auto opacity-60 sm:opacity-80" />
      )}

      <div className="relative mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-6 pb-7 sm:px-6 sm:pt-8 sm:pb-9">
        <div className="rise flex items-center gap-4">
          <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl shadow-lg [&_svg]:size-7 sm:size-16",
            coach ? "bg-gold text-[var(--coach-night)] shadow-black/40" : "bg-white text-brand shadow-black/20")}>
            {coach ? <ClipboardList aria-hidden /> : <Medal aria-hidden />}
          </span>
          <div className="min-w-0">
            {coach && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-xs font-bold tracking-wide text-gold uppercase">
                {t("portalCoachBadge")}
              </span>
            )}
            <p className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
              {coach ? t("portalCoach") : t("portalAthlete")}
            </p>
            <p className="mt-1 max-w-lg text-sm text-white/80 text-pretty sm:text-base">
              {coach ? t("portalCoachTagline") : t("portalAthleteTagline")}
            </p>
          </div>
        </div>

        {coach && (
          <ul className="rise rise-2 flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
            {[
              { icon: <GraduationCap />, label: t("coachChipQual") },
              { icon: <ShieldCheck />, label: t("coachChipSafe") },
              { icon: <BadgeCheck />, label: t("coachChipClean") },
            ].map((c) => (
              <li key={c.label} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 [&_svg]:size-4 [&_svg]:text-gold">
                {c.icon} {c.label}
              </li>
            ))}
          </ul>
        )}

        <HeroSteps current={step} coach={coach} />
      </div>
    </section>
  );
}

function HeroSteps({ current, coach }: { current: 1 | 2 | 3; coach: boolean }) {
  const { t } = useT();
  const steps = [t("stepLabelId"), t("stepLabelDetails"), t("stepLabelDone")];
  return (
    <nav aria-label={t("progress")} className="rise rise-3">
      <ol className="flex items-center gap-2">
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <li key={label} className={cn("flex items-center gap-2", n < 3 && "flex-1")} aria-current={active ? "step" : undefined}>
              <span className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                done && "bg-gold text-brand-deep",
                active && cn("bg-white ring-4 ring-white/25", coach ? "text-[var(--coach-night)]" : "text-brand"),
                !done && !active && "bg-white/10 text-white/70 ring-1 ring-white/25",
              )}>
                {done ? <Check className="size-4" aria-hidden /> : n}
              </span>
              <span className={cn("text-xs whitespace-nowrap sm:text-sm", active ? "font-semibold" : "hidden text-white/70 sm:inline")}>
                {label}
              </span>
              {n < 3 && <span className={cn("h-0.5 flex-1 rounded-full", done ? "bg-gold" : "bg-white/25")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The only mention of coaches on the athletes' pages: a quiet link to the coach portal. */
export function CoachNote({ className }: { className?: string }) {
  const { t, path } = useT();
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-dashed bg-background/60 px-4 py-3 text-sm text-muted-foreground", className)}>
      <ClipboardList className="size-4 shrink-0 text-[var(--coach-ink)]" aria-hidden />
      <span>{t("coachNoteText")}</span>
      <Link href={path("/coach")} data-testid="coach-note"
        className="inline-flex items-center gap-1 font-semibold text-[var(--coach-ink)] underline decoration-gold decoration-2 underline-offset-4">
        {t("coachNoteLink")} <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </p>
  );
}
