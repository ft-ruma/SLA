"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck, Briefcase, ClipboardCheck, FileSignature, Fingerprint, GraduationCap, History, LoaderCircle, PartyPopper, ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors, type Path } from "react-hook-form";
import { DeclarationList, answeredCount, emptyDeclarations, type DeclarationAnswers } from "@/components/coach/DeclarationList";
import { DisciplinePicker } from "@/components/coach/DisciplinePicker";
import { ProfilePhoto } from "@/components/coach/ProfilePhoto";
import { QualificationRows } from "@/components/coach/QualificationRows";
import { Field, FormError, Section, inputClass } from "@/components/Field";
import { FormProgress, jumpTo, percentComplete, type ProgressItem } from "@/components/FormProgress";
import { IdentitySummary } from "@/components/IdentitySummary";
import { useT } from "@/components/LangProvider";
import { PageTitle, StickyActions } from "@/components/Page";
import { PersonFields } from "@/components/PersonFields";
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DECLARATIONS } from "@/lib/declarations";
import { parseNic } from "@/lib/nic";
import {
  clearCheckedIdentity, clearDraft, loadCheckedIdentity, loadDraft, saveDone, saveDraft, type CheckedIdentity,
} from "@/lib/registration-state";
import { submitRegistration } from "@/lib/submit";
import { cn } from "@/lib/utils";
import {
  PHONE_REGEX, cleanPhone, cleanText, coachFormSchema, coachRoleFormSchema, signatureMatches, type CoachForm,
} from "@/lib/validation";

const DEFAULTS = {
  fullName: "",
  nameWithInitials: "",
  dateOfBirth: "",
  district: "",
  phone: "",
  email: "",
  licenseNo: "",
  licenseLevel: "",
  disciplines: [],
  qualifications: [],
  photoId: "",
  declarations: emptyDeclarations(),
  signature: "",
} as unknown as CoachForm;

const fullResolver = zodResolver(coachFormSchema);
const roleResolver = zodResolver(coachRoleFormSchema);

const SECTION_OF: Record<string, string> = {
  fullName: "sec-about", nameWithInitials: "sec-about", dateOfBirth: "sec-about", gender: "sec-about",
  district: "sec-about", phone: "sec-about", photoId: "sec-about", identity: "sec-about", email: "sec-professional",
  licenseNo: "sec-professional", licenseLevel: "sec-professional", disciplines: "sec-professional",
  qualifications: "sec-qualifications", declarations: "sec-declarations", signature: "sec-signature",
};
const SECTION_ORDER = ["sec-about", "sec-professional", "sec-qualifications", "sec-declarations", "sec-signature"];

const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const phoneOk = (v: unknown) => typeof v === "string" && PHONE_REGEX.test(cleanPhone(v));

/** RHF keeps array item errors as arrays; flatten to index -> field -> message. */
function itemErrors(list: unknown) {
  const out: Record<number, Record<string, string>> = {};
  const arr = list as (Record<string, { message?: string }> | undefined)[] | undefined;
  if (Array.isArray(arr)) {
    arr.forEach((e, i) => {
      if (!e) return;
      out[i] = {};
      for (const [k, v] of Object.entries(e)) if (v?.message) out[i][k] = v.message;
    });
  }
  return out;
}

function listError(e: unknown) {
  const x = e as { message?: string; root?: { message?: string } } | undefined;
  return x?.message ?? x?.root?.message;
}

export function CoachRegistration() {
  const router = useRouter();
  const { t, path, lang, district } = useT();
  const [checked, setChecked] = useState<CheckedIdentity | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [canRecover, setCanRecover] = useState(false);
  const [restored, setRestored] = useState(false);
  const turnstile = useRef<TurnstileHandle>(null);
  // adding the coach role to an existing SLA ID: personal details are on record
  const addingRole = useRef(false);

  const {
    register, control, handleSubmit, setValue, reset, setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: ((values, ctx, opts) =>
      (addingRole.current ? roleResolver : fullResolver)(values as never, ctx, opts as never)) as typeof fullResolver,
    defaultValues: DEFAULTS,
  });

  const values = useWatch({ control });
  const districtValue = values.district ?? "";
  const fullName = values.fullName ?? "";

  function applyNic(c: CheckedIdentity) {
    if (c.identity.type !== "nic") return;
    const r = parseNic(c.identity.nic);
    if (r.ok) {
      setValue("dateOfBirth", r.info.dateOfBirth);
      setValue("gender", r.info.gender);
    }
  }

  useEffect(() => {
    const c = loadCheckedIdentity("coach");
    if (!c) {
      router.replace(path("/register/coach"));
      return;
    }
    const draft = loadDraft<CoachForm, null>("coach", c.identity);
    if (draft) {
      // uploaded files belong to the server session; keep them in the draft
      reset({ ...DEFAULTS, ...draft.values, declarations: { ...emptyDeclarations(), ...draft.values.declarations } });
      setRestored(true);
    }
    addingRole.current = !!c.existing;
    applyNic(c);
    setChecked(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, reset]);

  useEffect(() => {
    if (!checked) return;
    const timer = setTimeout(() => saveDraft("coach", checked.identity, values, null), 400);
    return () => clearTimeout(timer);
  }, [checked, values]);

  function startOver() {
    clearDraft("coach");
    reset(DEFAULTS);
    if (checked) applyNic(checked);
    setRestored(false);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const existing = checked?.existing;
  const declAnswers = useMemo(() => (values.declarations ?? {}) as DeclarationAnswers, [values.declarations]);
  const signed = existing ? cleanText(values.signature ?? "") !== "" : signatureMatches(values.signature ?? "", fullName);

  const progress: ProgressItem[] = useMemo(() => {
    const v = values as Record<string, unknown>;
    const quals = (values.qualifications ?? []) as { level?: string; issuingBody?: string; year?: unknown; levelOther?: string }[];
    const qualsOk = quals.every((q) => filled(q.level) && filled(q.issuingBody) && /^\d{4}$/.test(String(q.year ?? ""))
      && (q.level !== "OTHER" || filled(q.levelOther)));
    return [
      existing
        ? { id: "sec-about", label: t("aboutYou"), total: 1, done: 1 }
        : {
            id: "sec-about", label: t("aboutYou"), total: 6,
            done: [filled(v.fullName), filled(v.nameWithInitials), isDate(v.dateOfBirth), filled(v.gender),
              filled(v.district), phoneOk(v.phone)].filter(Boolean).length,
          },
      { id: "sec-professional", label: t("navProfessional"), total: 1, done: (values.disciplines ?? []).length > 0 ? 1 : 0 },
      { id: "sec-qualifications", label: t("navQualifications"), total: 1, done: qualsOk ? 1 : 0 },
      { id: "sec-declarations", label: t("navDeclarations"), total: DECLARATIONS.length, done: answeredCount(declAnswers) },
      { id: "sec-signature", label: t("signatureTitle"), total: 1, done: signed ? 1 : 0 },
    ];
  }, [values, declAnswers, signed, existing, t]);

  const pct = percentComplete(progress);
  const statusOf = (id: string) => progress.find((p) => p.id === id);
  const unfinished = progress.filter((p) => p.done < p.total);

  function showProblems(fieldNames: string[]) {
    const ids = [...new Set(fieldNames.map((f) => SECTION_OF[f.split(".")[0]]).filter(Boolean))]
      .sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b));
    if (!ids.length) return false;
    const labels = ids.map((id) => progress.find((p) => p.id === id)?.label ?? id);
    setFormError(t("fixErrors", { list: labels.join(", ") }));
    jumpTo(ids[0]);
    return true;
  }

  function onInvalid(errs: FieldErrors<CoachForm>) {
    showProblems(Object.keys(errs));
  }

  async function onSubmit(form: CoachForm) {
    if (!checked) return;
    setFormError(null);
    setCanRecover(false);
    const token = (await turnstile.current?.getToken()) ?? "";
    if (!token) {
      setFormError(t("securityHint"));
      return;
    }
    const result = await submitRegistration("/api/register/coach", {
      ...(checked.existing ? { mode: "addRole", slaaId: checked.existing.slaaId } : { mode: "new" }),
      identity: checked.identity,
      form,
      turnstileToken: token,
      lang,
    });
    turnstile.current?.reset();
    if (result.ok) {
      saveDone({
        slaaId: result.slaaId, name: checked.existing ? checked.existing.maskedName : form.nameWithInitials,
        coachLinks: 0, role: "coach", addedRole: !!checked.existing,
      });
      clearDraft("coach");
      clearCheckedIdentity("coach");
      router.push(path("/register/coach/done"));
      return;
    }
    setCanRecover(result.status === 0 || result.status === 409 || result.status >= 500);
    for (const [field, message] of Object.entries(result.fields)) {
      if (field !== "identity" && SECTION_OF[field.split(".")[0]]) setError(field as Path<CoachForm>, { message });
    }
    if (!showProblems(Object.keys(result.fields))) setFormError(result.error);
  }

  if (!checked) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden /> {t("loading")}
      </p>
    );
  }

  const lockedFromNic = checked.identity.type === "nic";
  const declErrors: Record<string, string> = {};
  const de = errors.declarations as Record<string, { message?: string }> | undefined;
  if (de) for (const [code, e] of Object.entries(de)) if (e?.message) declErrors[code] = e.message;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-5 sm:gap-6" noValidate>
      <PageTitle kicker={t("coachCredential")} title={t("coachFormTitle")} intro={t("coachFormIntro")} />

      {restored && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <History className="size-4 shrink-0 text-primary" aria-hidden />
            {t("draftRestored")}
          </span>
          <button type="button" onClick={startOver} className="font-medium text-primary underline-offset-4 hover:underline">
            {t("startOver")}
          </button>
        </div>
      )}

      <IdentitySummary identity={checked.identity} changeHref={path("/register/coach")} />
      <FormProgress items={progress} />

      <Section step={1} id="sec-about" title={t("aboutYou")} icon={<UserRound />} status={statusOf("sec-about")}>
        {existing ? (
          <div data-testid="existing-member" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <Fingerprint className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden />
            <div className="min-w-0">
              <p className="font-semibold text-emerald-900">{t("existingTitle", { id: existing.slaaId })}</p>
              <p className="mt-1 text-sm text-emerald-900/80 text-pretty">{t("existingText")}</p>
              <p className="mt-2 text-sm font-medium">{existing.maskedName} · {district(existing.district)}</p>
            </div>
          </div>
        ) : (
          <PersonFields register={register} errors={errors} lockedFromNic={lockedFromNic}
            phoneLabel={t("phoneCoach")} district={districtValue} />
        )}
        <Controller control={control} name="photoId"
          render={({ field }) => (
            <ProfilePhoto value={field.value ?? ""} onChange={field.onChange} error={errors.photoId?.message} />
          )} />
      </Section>

      <Section step={2} id="sec-professional" title={t("secProfessional")} icon={<Briefcase />} status={statusOf("sec-professional")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("email")} htmlFor="email" optional error={errors.email?.message} hint={t("emailHint")}
            className="md:col-span-2">
            <Input id="email" type="email" inputMode="email" autoComplete="email" className={inputClass}
              {...register("email")} aria-invalid={!!errors.email} />
          </Field>
          <Field label={t("licenceNo")} htmlFor="licenseNo" optional error={errors.licenseNo?.message} hint={t("licenceNoHint")}>
            <Input id="licenseNo" className={inputClass + " font-mono uppercase"} {...register("licenseNo")} />
          </Field>
          <Field label={t("licenceLevel")} htmlFor="licenseLevel" optional error={errors.licenseLevel?.message}
            hint={t("licenceLevelHint")}>
            <Input id="licenseLevel" className={inputClass} {...register("licenseLevel")} />
          </Field>
        </div>
        <Controller control={control} name="disciplines"
          render={({ field }) => (
            <DisciplinePicker value={field.value ?? []} onChange={field.onChange} error={listError(errors.disciplines)} />
          )} />
      </Section>

      <Section step={3} id="sec-qualifications" title={t("secQualifications")} description={t("qualDesc")} icon={<GraduationCap />}
        status={statusOf("sec-qualifications")}>
        <Controller control={control} name="qualifications"
          render={({ field }) => (
            <QualificationRows value={field.value as never} onChange={field.onChange}
              error={listError(errors.qualifications)} itemErrors={itemErrors(errors.qualifications)} />
          )} />
      </Section>

      <Section step={4} id="sec-declarations" title={t("secDeclarations")} description={t("declarationsDesc")} icon={<ShieldCheck />}
        status={statusOf("sec-declarations")}>
        <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
          {t("declAnswered", { n: String(answeredCount(declAnswers)), total: String(DECLARATIONS.length) })}
        </p>
        <Controller control={control} name="declarations"
          render={({ field }) => (
            <DeclarationList value={field.value as DeclarationAnswers} onChange={field.onChange} errors={declErrors} />
          )} />
      </Section>

      <Section step={5} id="sec-signature" title={t("signatureTitle")} icon={<FileSignature />} status={statusOf("sec-signature")}>
        <div className={cn("relative overflow-hidden rounded-2xl border-2 bg-[#fffdf4] p-4 sm:p-6",
          signed ? "border-emerald-300" : "border-dashed border-gold")}>
          <p className="pr-16 font-serif text-base leading-relaxed text-[var(--coach-ink)] italic sm:text-lg">
            “{t("coachPledge")}”
          </p>
          <span aria-hidden className={cn("absolute top-4 right-4 grid size-12 place-items-center rounded-full ring-4 transition sm:size-14",
            signed ? "bg-emerald-600 text-white ring-emerald-100" : "bg-gold/25 text-amber-700 ring-gold/20")}>
            {signed ? <BadgeCheck className="size-7" /> : <FileSignature className="size-6" />}
          </span>
          <Field label={t("signatureLabel")} htmlFor="signature" error={errors.signature?.message} className="mt-4"
            hint={existing ? t("addRoleSignHint") : fullName.trim() ? t("signatureHint", { name: fullName.trim() }) : undefined}>
            <Input id="signature" autoComplete="off" aria-invalid={!!errors.signature} {...register("signature")}
              className="h-14 rounded-none border-0 border-b-2 border-[var(--coach-ink)]/40 bg-transparent px-1 font-serif text-2xl italic shadow-none focus-visible:border-[var(--coach-ink)] focus-visible:ring-0" />
          </Field>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{t("coachSignedOn", { date: new Date().toLocaleDateString(lang === "en" ? "en-GB" : `${lang}-LK`) })}</span>
            {signed && !existing && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <BadgeCheck className="size-4" aria-hidden /> {t("signatureMatches")}
              </span>
            )}
          </div>
        </div>
      </Section>

      <FormError message={formError} />
      {canRecover && (
        <div role="status" className="rounded-xl border bg-muted/40 p-4 text-sm">
          <p>{t("recoverRegistration")}</p>
          <Link href={path("/register/coach")} className="mt-2 inline-block font-semibold text-primary underline underline-offset-4">
            {t("recoverId")}
          </Link>
        </div>
      )}
      <Turnstile ref={turnstile} />
      <StickyActions>
        <div className="mb-2.5 text-sm" aria-live="polite">
          {pct === 100 ? (
            <p className="flex items-center gap-2 font-medium text-emerald-700">
              <PartyPopper className="size-4 shrink-0" aria-hidden /> {t("allSet")}
            </p>
          ) : (
            <p className="text-muted-foreground">
              {t("stillToFinish", { list: "" })}
              {unfinished.map((u, i) => (
                <span key={u.id}>
                  {i > 0 && ", "}
                  <button type="button" onClick={() => jumpTo(u.id)}
                    className="font-medium text-amber-800 underline decoration-amber-400 underline-offset-2">
                    {u.label}
                  </button>
                </span>
              ))}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}
          className={cn("h-auto min-h-12 w-full gap-2 rounded-xl py-2 text-base font-bold whitespace-normal shadow-md sm:min-h-13 sm:text-lg",
            "bg-gold text-[var(--coach-night)] hover:bg-gold/90",
            pct === 100 && "ring-4 ring-emerald-400/50")}>
          {isSubmitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <ClipboardCheck className="size-5" aria-hidden />}
          {isSubmitting ? t("submitting") : t("coachSubmit")}
        </Button>
      </StickyActions>
    </form>
  );
}
