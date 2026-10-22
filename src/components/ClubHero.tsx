"use client";

import { Flag } from "lucide-react";
import Link from "next/link";
import { useT } from "./LangProvider";

/** Banner for the club portal: deep green so it is never mistaken for the athlete or coach forms. */
export function ClubHero() {
  const { t, path } = useT();
  return (
    <section data-portal="club" aria-label={t("portalClub")}
      className="no-print relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 text-white">
      <span aria-hidden className="watermark pointer-events-none absolute -right-3 -bottom-2 text-[5.5rem] sm:text-[9rem]">
        {t("clubWatermark")}
      </span>
      <div className="relative mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-6 pb-7 sm:px-6 sm:pt-8 sm:pb-9">
        <div className="rise flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-emerald-800 shadow-lg shadow-black/30 [&_svg]:size-7 sm:size-16">
            <Flag aria-hidden />
          </span>
          <div className="min-w-0">
            <span className="mb-1 inline-flex rounded-full border border-emerald-300/50 bg-emerald-300/15 px-2.5 py-0.5 text-xs font-bold tracking-wide text-emerald-100 uppercase">
              {t("portalClubBadge")}
            </span>
            <p className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">{t("portalClub")}</p>
            <p className="mt-1 max-w-lg text-sm text-white/80 text-pretty sm:text-base">{t("portalClubTagline")}</p>
          </div>
        </div>
        <p className="rise rise-2 max-w-xl rounded-xl bg-white/10 px-3 py-2 text-xs text-white/85 ring-1 ring-white/15 sm:text-sm">
          {t("clubNotPeople")}{" "}
          <Link href={path("/register/athlete")} className="font-semibold underline underline-offset-2">{t("clubNotPeopleAthlete")}</Link>
          {" · "}
          <Link href={path("/coach")} className="font-semibold underline underline-offset-2">{t("clubNotPeopleCoach")}</Link>
        </p>
      </div>
    </section>
  );
}
