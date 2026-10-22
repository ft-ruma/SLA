"use client";

import { Anchor, Building2, GraduationCap, Medal, Plane, School, Shield, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { MessageKey } from "@/lib/i18n";
import { FORCE_CLUB_NAMES, type ClubOption } from "@/lib/reference";
import { cn } from "@/lib/utils";
import { ACADEMIC_STATUSES, CLUB_CATEGORIES, FORCES, FORCES_MEMBERSHIP } from "@/lib/validation";
import { Field, inputClass, selectClass } from "./Field";
import { useT } from "./LangProvider";
import { OTHER_UNIVERSITY, UniversityOptions, isListedUniversity } from "./UniversityOptions";

export type AffiliationValues = {
  academicStatus: "" | (typeof ACADEMIC_STATUSES)[number];
  academicInstitution: string;
  representsClub: "" | "yes" | "no";
  clubCategory: "" | (typeof CLUB_CATEGORIES)[number];
  clubId: string;
  unlistedClubName: string;
  forcesMembership: "" | (typeof FORCES_MEMBERSHIP)[number];
  forcesServiceId: string;
};

export const emptyAffiliation: AffiliationValues = {
  academicStatus: "", academicInstitution: "", representsClub: "", clubCategory: "", clubId: "",
  unlistedClubName: "", forcesMembership: "", forcesServiceId: "",
};

/** Answered questions out of 2: school/university, and club/armed force. */
export function affiliationDone(v: Partial<AffiliationValues>) {
  const academic = v.academicStatus === "NONE" || (!!v.academicStatus && !!v.academicInstitution?.trim());
  const club = v.representsClub === "no" || (v.representsClub === "yes" && (
    (v.clubCategory === "CIVIL_CLUB" && !!v.clubId)
    || (v.clubCategory === "OTHER" && !!v.unlistedClubName?.trim())
    || ((FORCES as readonly string[]).includes(v.clubCategory ?? "") && !!v.forcesMembership)));
  return Number(academic) + Number(club);
}

const ACADEMIC_ICON = { SCHOOL: <School />, UNIVERSITY: <GraduationCap />, NONE: <Medal /> };
const CLUB_ICON: Record<(typeof CLUB_CATEGORIES)[number], React.ReactNode> = {
  ARMY: <Shield />, NAVY: <Anchor />, AIR_FORCE: <Plane />, POLICE: <ShieldCheck />, CIVIL_CLUB: <Users />, OTHER: <Building2 />,
};
/* eslint-disable @typescript-eslint/no-explicit-any */
export function AffiliationFields({ register, setValue, values, errors, clubs }: {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  values: Partial<AffiliationValues>;
  errors: FieldErrors<AffiliationValues>;
  clubs: ClubOption[];
}) {
  const { t, tErr, district } = useT();
  const institution = values.academicInstitution ?? "";
  const listed = isListedUniversity(institution);
  const [otherUniversity, setOtherUniversity] = useState(!listed && institution !== "");
  const forces = (FORCES as readonly string[]).includes(values.clubCategory ?? "");

  const choice = (selected: boolean) =>
    cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 bg-background px-3 py-2 text-sm font-medium transition [&_svg]:size-5 [&_svg]:shrink-0",
      selected ? "border-primary bg-primary/5 text-primary" : "border-input hover:border-primary/40");

  return (
    <div className="flex flex-col gap-6">
      {/* A. school or university */}
      <fieldset className="flex flex-col gap-3" id="academicStatus">
        <legend className="mb-3 text-sm font-semibold">{t("academicQuestion")}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {ACADEMIC_STATUSES.map((s) => (
            <label key={s} className={choice(values.academicStatus === s)}>
              <input type="radio" value={s} className="sr-only" {...register("academicStatus", {
                onChange: () => {
                  setValue("academicInstitution", "");
                  setOtherUniversity(false);
                },
              })} />
              {ACADEMIC_ICON[s]} {t(`academic_${s}` as MessageKey)}
            </label>
          ))}
        </div>
        {errors.academicStatus?.message && <p role="alert" className="text-sm text-destructive">{tErr(errors.academicStatus.message)}</p>}

        {values.academicStatus === "SCHOOL" && (
          <Field label={t("schoolName")} htmlFor="academicInstitution" error={errors.academicInstitution?.message}
            hint={t("schoolNameHint")}>
            <Input id="academicInstitution" className={inputClass} {...register("academicInstitution")}
              aria-invalid={!!errors.academicInstitution} />
          </Field>
        )}
        {values.academicStatus === "UNIVERSITY" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("universityName")} htmlFor="universitySelect" error={otherUniversity ? undefined : errors.academicInstitution?.message}>
              <select id="universitySelect" className={selectClass}
                value={otherUniversity ? OTHER_UNIVERSITY : listed ? institution : ""}
                onChange={(e) => {
                  const other = e.target.value === OTHER_UNIVERSITY;
                  setOtherUniversity(other);
                  setValue("academicInstitution", other ? "" : e.target.value, { shouldValidate: !other });
                }}>
                <UniversityOptions />
              </select>
            </Field>
            {otherUniversity && (
              <Field label={t("universityOtherName")} htmlFor="academicInstitution" error={errors.academicInstitution?.message}>
                <Input id="academicInstitution" className={inputClass} {...register("academicInstitution")}
                  aria-invalid={!!errors.academicInstitution} />
              </Field>
            )}
          </div>
        )}
      </fieldset>

      {/* B. club or armed force, which can be in addition to a university */}
      <div className="border-t" aria-hidden />
      <fieldset className="flex flex-col gap-3" id="representsClub">
        <legend className="mb-3 text-sm font-semibold">{t("clubQuestion")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
          {(["yes", "no"] as const).map((v) => (
            <label key={v} className={choice(values.representsClub === v)}>
              <input type="radio" value={v} className="sr-only" {...register("representsClub")} />
              {v === "yes" ? t("yes") : t("no")}
            </label>
          ))}
        </div>
        {errors.representsClub?.message && <p role="alert" className="text-sm text-destructive">{tErr(errors.representsClub.message)}</p>}

        {values.representsClub === "yes" && (
          <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-2" id="clubCategory">
              <span className="text-sm font-medium">{t("clubCategory")}</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {CLUB_CATEGORIES.map((c) => (
                  <label key={c} className={choice(values.clubCategory === c)}>
                    <input type="radio" value={c} className="sr-only" {...register("clubCategory")} />
                    {CLUB_ICON[c]}
                    {c in FORCE_CLUB_NAMES ? FORCE_CLUB_NAMES[c as keyof typeof FORCE_CLUB_NAMES] : t(`club_${c}` as MessageKey)}
                  </label>
                ))}
              </div>
              {errors.clubCategory?.message && <p role="alert" className="text-sm text-destructive">{tErr(errors.clubCategory.message)}</p>}
            </div>

            {values.clubCategory === "CIVIL_CLUB" && (
              <Field label={t("clubPick")} htmlFor="clubId" error={errors.clubId?.message}
                hint={clubs.length ? t("clubPickHint") : t("clubNoneYet")}>
                <select id="clubId" className={selectClass} {...register("clubId")} aria-invalid={!!errors.clubId}>
                  <option value="">{t("select")}</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} · {district(c.district)}</option>
                  ))}
                </select>
              </Field>
            )}

            {values.clubCategory === "OTHER" && (
              <Field label={t("clubOtherName")} htmlFor="unlistedClubName" error={errors.unlistedClubName?.message}
                hint={t("clubOtherHint")}>
                <Input id="unlistedClubName" className={inputClass} {...register("unlistedClubName")}
                  aria-invalid={!!errors.unlistedClubName} />
              </Field>
            )}

            {forces && (
              <>
                <div className="flex flex-col gap-2" id="forcesMembership">
                  <span className="text-sm font-medium">{t("forcesMembership")}</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FORCES_MEMBERSHIP.map((m) => (
                      <label key={m} className={choice(values.forcesMembership === m)}>
                        <input type="radio" value={m} className="sr-only" {...register("forcesMembership")} />
                        {t(`forces_${m}` as MessageKey)}
                      </label>
                    ))}
                  </div>
                  {errors.forcesMembership?.message && (
                    <p role="alert" className="text-sm text-destructive">{tErr(errors.forcesMembership.message)}</p>
                  )}
                </div>
                <Field label={t("forcesServiceId")} htmlFor="forcesServiceId" optional error={errors.forcesServiceId?.message}
                  hint={t("forcesServiceIdHint")}>
                  <Input id="forcesServiceId" className={inputClass} {...register("forcesServiceId")} />
                </Field>
              </>
            )}
          </div>
        )}
      </fieldset>
    </div>
  );
}
