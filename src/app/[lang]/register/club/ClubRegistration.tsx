"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Building2, Flag, GraduationCap, LoaderCircle, School, ShieldCheck, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import { DistrictSelect } from "@/components/DistrictSelect";
import { Field, FormError, Section, inputClass, selectClass } from "@/components/Field";
import { useT } from "@/components/LangProvider";
import { PageTitle, StickyActions } from "@/components/Page";
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile";
import { OTHER_UNIVERSITY, UniversityOptions, isListedUniversity } from "@/components/UniversityOptions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CLUB_TYPES, clubFormSchema, type ClubForm } from "@/lib/validation";

export const CLUB_DONE_KEY = "sla.clubDone";
export type ClubDone = { clubId: string; name: string };

const DEFAULTS = {
  name: "", category: undefined, affiliationNumber: "", district: undefined,
  presidentName: "", presidentNic: "", presidentPhone: "",
  secretaryName: "", secretaryNic: "", secretaryPhone: "", email: "", consent: undefined,
} as unknown as ClubForm;

const TYPE_ICON: Record<(typeof CLUB_TYPES)[number], React.ReactNode> = {
  UNIVERSITY: <GraduationCap />, SCHOOL: <School />, CIVIL_CLUB: <Users />, INSTITUTIONAL: <Building2 />,
};

export function ClubRegistration() {
  const router = useRouter();
  const { t, path, lang } = useT();
  const turnstile = useRef<TurnstileHandle>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [otherUniversity, setOtherUniversity] = useState(false);
  const {
    register, control, handleSubmit, setValue, setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(clubFormSchema), defaultValues: DEFAULTS });
  const v = useWatch({ control });

  const choice = (selected: boolean) =>
    cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 bg-background px-3 py-2 text-sm font-medium transition [&_svg]:size-5 [&_svg]:shrink-0",
      selected ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-input hover:border-emerald-400");

  async function onSubmit(form: ClubForm) {
    setFormError(null);
    const token = (await turnstile.current?.getToken()) ?? "";
    if (!token) {
      setFormError(t("securityHint"));
      return;
    }
    let res: Response;
    let data: { clubId?: string; error?: string; fields?: Record<string, string> } = {};
    try {
      res = await fetch("/api/register/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, turnstileToken: token, lang }),
      });
      data = await res.json().catch(() => ({}));
    } catch {
      turnstile.current?.reset();
      setFormError("Could not reach the server. Check your connection and try again.");
      return;
    }
    turnstile.current?.reset();
    if (res.ok && data.clubId) {
      sessionStorage.setItem(CLUB_DONE_KEY, JSON.stringify({ clubId: data.clubId, name: form.name } satisfies ClubDone));
      router.push(path("/register/club/done"));
      return;
    }
    for (const [field, message] of Object.entries(data.fields ?? {})) {
      if (field in clubFormSchema.shape) setError(field as Path<ClubForm>, { message });
    }
    setFormError(data.error ?? "Something went wrong. Please try again.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, () => setFormError(t("clubFixErrors")))} className="flex flex-col gap-5 sm:gap-6" noValidate>
      <PageTitle title={t("clubFormTitle")} intro={t("clubFormIntro")} />

      <Section id="sec-club" step={1} title={t("clubAboutTitle")} icon={<Flag />}>
        <div className="flex flex-col gap-2" id="category">
          <span className="text-sm font-medium">{t("clubType")}</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {CLUB_TYPES.map((c) => (
              <label key={c} className={choice(v.category === c)}>
                <input type="radio" value={c} className="sr-only" {...register("category", {
                  onChange: () => {
                    if (isListedUniversity(v.name ?? "")) setValue("name", "");
                    setOtherUniversity(false);
                  },
                })} />
                {TYPE_ICON[c]} {t(`clubType_${c}` as MessageKey)}
              </label>
            ))}
          </div>
          {errors.category?.message && <Err message={errors.category.message} />}
        </div>

        {v.category === "UNIVERSITY" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("clubUniversity")} htmlFor="universitySelect" error={otherUniversity ? undefined : errors.name?.message}>
              <select id="universitySelect" className={selectClass} aria-invalid={!otherUniversity && !!errors.name}
                value={otherUniversity ? OTHER_UNIVERSITY : isListedUniversity(v.name ?? "") ? v.name : ""}
                onChange={(e) => {
                  const other = e.target.value === OTHER_UNIVERSITY;
                  setOtherUniversity(other);
                  setValue("name", other ? "" : e.target.value, { shouldValidate: !other });
                }}>
                <UniversityOptions />
              </select>
            </Field>
            {otherUniversity && (
              <Field label={t("universityOtherName")} htmlFor="name" error={errors.name?.message}>
                <Input id="name" className={inputClass} {...register("name")} aria-invalid={!!errors.name} />
              </Field>
            )}
          </div>
        ) : (
          <Field label={t("clubName")} htmlFor="name" error={errors.name?.message}>
            <Input id="name" className={inputClass} {...register("name")} aria-invalid={!!errors.name} />
          </Field>
        )}


        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("clubAffiliationNo")} htmlFor="affiliationNumber" optional
            error={errors.affiliationNumber?.message} hint={t("clubAffiliationHint")}>
            <Input id="affiliationNumber" className={inputClass} {...register("affiliationNumber")} />
          </Field>
          <Field label={t("district")} htmlFor="district" error={errors.district?.message}>
            <DistrictSelect id="district" {...register("district")} aria-invalid={!!errors.district} />
          </Field>
        </div>
      </Section>

      <Section id="sec-president" step={2} title={t("clubPresidentTitle")} description={t("clubPresidentDesc")} icon={<UserRound />}>
        <Field label={t("clubOfficerName")} htmlFor="presidentName" error={errors.presidentName?.message}>
          <Input id="presidentName" className={inputClass} {...register("presidentName")} aria-invalid={!!errors.presidentName} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("clubOfficerNic")} htmlFor="presidentNic" optional error={errors.presidentNic?.message}>
            <Input id="presidentNic" className={inputClass} {...register("presidentNic")} autoCapitalize="characters" />
          </Field>
          <Field label={t("clubOfficerPhone")} htmlFor="presidentPhone" error={errors.presidentPhone?.message}>
            <Input id="presidentPhone" type="tel" inputMode="tel" className={inputClass} {...register("presidentPhone")}
              aria-invalid={!!errors.presidentPhone} />
          </Field>
        </div>
      </Section>

      <Section id="sec-secretary" step={3} title={t("clubSecretaryTitle")} description={t("clubSecretaryDesc")} icon={<Building />}>
        <Field label={t("clubOfficerName")} htmlFor="secretaryName" error={errors.secretaryName?.message}>
          <Input id="secretaryName" className={inputClass} {...register("secretaryName")} aria-invalid={!!errors.secretaryName} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("clubOfficerNic")} htmlFor="secretaryNic" error={errors.secretaryNic?.message}>
            <Input id="secretaryNic" className={inputClass} {...register("secretaryNic")} autoCapitalize="characters"
              aria-invalid={!!errors.secretaryNic} />
          </Field>
          <Field label={t("clubOfficerPhone")} htmlFor="secretaryPhone" error={errors.secretaryPhone?.message}>
            <Input id="secretaryPhone" type="tel" inputMode="tel" className={inputClass} {...register("secretaryPhone")}
              aria-invalid={!!errors.secretaryPhone} />
          </Field>
        </div>
        <Field label={t("clubEmail")} htmlFor="email" error={errors.email?.message} hint={t("clubEmailHint")}>
          <Input id="email" type="email" inputMode="email" className={inputClass} {...register("email")}
            aria-invalid={!!errors.email} />
        </Field>
      </Section>

      <Section id="sec-confirm" step={4} title={t("clubConfirmTitle")} icon={<ShieldCheck />}>
        <label htmlFor="consent" className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm">
          <Checkbox id="consent" checked={v.consent === true} className="mt-0.5"
            onCheckedChange={(c) => setValue("consent", (c === true) as true, { shouldValidate: true })} />
          <span>{t("clubConsent")}</span>
        </label>
        {errors.consent?.message && <Err message={errors.consent.message} />}
        <Turnstile ref={turnstile} />
      </Section>

      <FormError message={formError} />
      <StickyActions>
        <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full bg-emerald-700 text-base hover:bg-emerald-800 sm:w-auto sm:px-8">
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
          {isSubmitting ? t("submitting") : t("clubSubmit")}
        </Button>
      </StickyActions>
    </form>
  );
}

function Err({ message }: { message: string }) {
  const { tErr } = useT();
  return <p role="alert" className="text-sm text-destructive">{tErr(message)}</p>;
}
