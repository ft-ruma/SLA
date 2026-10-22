"use client";

import { CircleCheck, ShieldAlert } from "lucide-react";
import { DECLARATIONS } from "@/lib/declarations";
import { cn } from "@/lib/utils";
import { useT } from "../LangProvider";

export type DeclarationAnswers = Record<string, { answer: "confirm" | "disclose" | ""; details: string }>;

export const emptyDeclarations = (): DeclarationAnswers =>
  Object.fromEntries(DECLARATIONS.map((d) => [d.code, { answer: "", details: "" }]));

export function answeredCount(v: DeclarationAnswers) {
  return DECLARATIONS.filter((d) => {
    const a = v[d.code];
    return a?.answer === "confirm" || (a?.answer === "disclose" && a.details.trim() !== "");
  }).length;
}

/**
 * The three coach statements in the visitor's language. Each is confirmed;
 * the record statement can instead be disclosed, with confidential details
 * for SLA's reviewers.
 */
export function DeclarationList({ value, onChange, errors }: {
  value: DeclarationAnswers;
  onChange: (v: DeclarationAnswers) => void;
  errors?: Record<string, string>;
}) {
  const { t, tErr, lang } = useT();
  const set = (code: string, patch: Partial<DeclarationAnswers[string]>) =>
    onChange({ ...value, [code]: { ...{ answer: "", details: "" }, ...value[code], ...patch } });

  return (
    <div className="flex flex-col gap-3">
      {DECLARATIONS.map((d) => {
        const a = value[d.code] ?? { answer: "", details: "" };
        const text = d.text[lang];
        const err = errors?.[d.code];
        return (
          <fieldset key={d.code} id={`decl-${d.code}`}
            className={cn("rounded-xl border p-4 transition-colors",
              a.answer === "confirm" && "border-emerald-200 bg-emerald-50/50",
              a.answer === "disclose" && "border-amber-300 bg-amber-50/60",
              err && "border-destructive/50")}>
            <legend className="sr-only">{text.title}</legend>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{text.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">{text.body}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <label className={cn("flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-medium",
                  a.answer === "confirm" ? "border-emerald-500 bg-emerald-600 text-white" : "bg-background")}>
                  <input type="radio" name={`decl-${d.code}`} className="sr-only" checked={a.answer === "confirm"}
                    onChange={() => set(d.code, { answer: "confirm" })} />
                  <CircleCheck className="size-4" aria-hidden /> {t("declConfirm")}
                </label>
                {d.allowsDisclosure && (
                  <label className={cn("flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-medium",
                    a.answer === "disclose" ? "border-amber-500 bg-amber-500 text-amber-950" : "bg-background")}>
                    <input type="radio" name={`decl-${d.code}`} className="sr-only" checked={a.answer === "disclose"}
                      onChange={() => set(d.code, { answer: "disclose" })} />
                    <ShieldAlert className="size-4" aria-hidden /> {t("declDisclose")}
                  </label>
                )}
              </div>
            </div>
            {a.answer === "disclose" && (
              <div className="mt-3 flex flex-col gap-1.5">
                <label htmlFor={`decl-${d.code}-details`} className="text-sm font-medium">{t("declDetails")}</label>
                <textarea id={`decl-${d.code}-details`} rows={3} maxLength={2000} value={a.details}
                  onChange={(e) => set(d.code, { details: e.target.value })}
                  className="rounded-xl border border-input bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
              </div>
            )}
            {err && <p role="alert" className="mt-2 text-sm text-destructive">{tErr(err)}</p>}
          </fieldset>
        );
      })}
    </div>
  );
}
