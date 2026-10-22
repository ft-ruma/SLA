"use client";

import { FileCheck2, GraduationCap, LoaderCircle, Paperclip, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MessageKey } from "@/lib/i18n";
import { EVENT_GROUPS, QUALIFICATION_LEVELS } from "@/lib/validation";
import { Field, inputClass, selectClass } from "../Field";
import { useT } from "../LangProvider";

export type QualificationRow = {
  level: string;
  levelOther: string;
  eventGroup: string;
  issuingBody: string;
  serial: string;
  year: string | number;
  documentId: string;
  documentName: string;
};

export const MAX_QUALIFICATIONS = 10;

export const emptyQualification: QualificationRow = {
  level: "", levelOther: "", eventGroup: "", issuingBody: "", serial: "", year: "", documentId: "", documentName: "",
};

const MAX_BYTES = 3 * 1024 * 1024;

export function QualificationRows({ value, onChange, error, itemErrors }: {
  value: QualificationRow[];
  onChange: (v: QualificationRow[]) => void;
  error?: string;
  itemErrors?: Record<number, Record<string, string>>;
}) {
  const { t, tErr, category } = useT();
  const update = (i: number, patch: Partial<QualificationRow>) =>
    onChange(value.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  return (
    <div className="flex flex-col gap-4">
      {value.length === 0 && (
        <p className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">{t("noQualifications")}</p>
      )}
      {value.map((q, i) => {
        const err = itemErrors?.[i] ?? {};
        return (
          <div key={i} className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <GraduationCap className="size-4 text-primary" aria-hidden />
                {t("qualN", { n: String(i + 1) })}
              </span>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" aria-hidden /> {t("remove")}
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("qualLevel")} htmlFor={`q-${i}-level`} error={err.level} className="md:col-span-2">
                <select id={`q-${i}-level`} className={selectClass} value={q.level} aria-invalid={!!err.level}
                  onChange={(e) => update(i, { level: e.target.value })}>
                  <option value="">{t("select")}</option>
                  {QUALIFICATION_LEVELS.map((l) => (
                    <option key={l} value={l}>{t(`level${l}` as MessageKey)}</option>
                  ))}
                </select>
              </Field>
              {q.level === "OTHER" && (
                <Field label={t("qualLevelOther")} htmlFor={`q-${i}-other`} error={err.levelOther} className="md:col-span-2">
                  <Input id={`q-${i}-other`} className={inputClass} value={q.levelOther}
                    onChange={(e) => update(i, { levelOther: e.target.value })} />
                </Field>
              )}
              <Field label={t("qualIssuer")} htmlFor={`q-${i}-issuer`} error={err.issuingBody} hint={t("qualIssuerHint")}>
                <Input id={`q-${i}-issuer`} className={inputClass} value={q.issuingBody} aria-invalid={!!err.issuingBody}
                  onChange={(e) => update(i, { issuingBody: e.target.value })} />
              </Field>
              <Field label={t("qualEventGroup")} htmlFor={`q-${i}-group`} optional error={err.eventGroup}>
                <select id={`q-${i}-group`} className={selectClass} value={q.eventGroup}
                  onChange={(e) => update(i, { eventGroup: e.target.value })}>
                  <option value="">{t("qualEventGroupAny")}</option>
                  {EVENT_GROUPS.map((g) => <option key={g} value={g}>{category(g)}</option>)}
                </select>
              </Field>
              <Field label={t("qualSerial")} htmlFor={`q-${i}-serial`} optional error={err.serial}>
                <Input id={`q-${i}-serial`} className={inputClass + " font-mono"} value={q.serial}
                  onChange={(e) => update(i, { serial: e.target.value })} />
              </Field>
              <Field label={t("qualYear")} htmlFor={`q-${i}-year`} error={err.year}>
                <Input id={`q-${i}-year`} className={inputClass} inputMode="numeric" maxLength={4} value={q.year}
                  aria-invalid={!!err.year} onChange={(e) => update(i, { year: e.target.value.replace(/\D/g, "") })} />
              </Field>
            </div>
            <CertificateUpload row={q} onChange={(patch) => update(i, patch)} index={i} />
          </div>
        );
      })}
      {error && <p role="alert" className="text-sm text-destructive">{tErr(error)}</p>}
      {value.length < MAX_QUALIFICATIONS && (
        <Button type="button" variant="outline" onClick={() => onChange([...value, { ...emptyQualification }])}
          className="h-auto min-h-12 gap-2 self-start rounded-xl px-4 text-base">
          <Plus className="size-5" aria-hidden /> {t("addQualification")}
        </Button>
      )}
    </div>
  );
}

function CertificateUpload({ row, onChange, index }: {
  row: QualificationRow;
  onChange: (patch: Partial<QualificationRow>) => void;
  index: number;
}) {
  const { t, tErr } = useT();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("The file is larger than 3 MB.");
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/register/coach/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.id !== "string") {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      onChange({ documentId: data.id, documentName: data.name });
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {t("qualFile")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
      </span>
      {row.documentId ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2 text-emerald-800">
            <FileCheck2 className="size-4 shrink-0" aria-hidden />
            <span className="font-medium">{t("qualUploaded")}:</span>
            <span className="truncate">{row.documentName}</span>
          </span>
          <button type="button" onClick={() => onChange({ documentId: "", documentName: "" })}
            className="text-sm font-medium text-emerald-900 underline underline-offset-2">
            {t("qualRemoveFile")}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <input ref={input} id={`q-${index}-file`} type="file" className="sr-only"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}
            className="h-auto min-h-11 gap-2 rounded-xl px-4">
            {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Paperclip className="size-4" aria-hidden />}
            {busy ? t("qualUploading") : t("qualUpload")}
          </Button>
          <span className="text-xs text-muted-foreground">{t("qualFileHint")}</span>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{tErr(error)}</p>}
    </div>
  );
}
