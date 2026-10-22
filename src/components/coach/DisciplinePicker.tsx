"use client";

import { Check } from "lucide-react";
import { EVENTS } from "@/lib/reference";
import { cn } from "@/lib/utils";
import { useT } from "../LangProvider";

const GROUPS = [...new Set(EVENTS.map((e) => e.category))];

/** Events a coach coaches, as tappable chips grouped by event group. */
export function DisciplinePicker({ value, onChange, error }: {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const { t, tErr, event, category } = useT();
  const selected = new Set(value);
  const toggle = (code: string) => {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    onChange(EVENTS.map((e) => e.code).filter((c) => next.has(c)));
  };
  const toggleGroup = (group: string) => {
    const codes = EVENTS.filter((e) => e.category === group).map((e) => e.code);
    const all = codes.every((c) => selected.has(c));
    const next = new Set(selected);
    for (const c of codes) {
      if (all) next.delete(c);
      else next.add(c);
    }
    onChange(EVENTS.map((e) => e.code).filter((c) => next.has(c)));
  };

  return (
    <fieldset className="flex flex-col gap-3" aria-invalid={!!error}>
      <legend className="flex w-full flex-wrap items-baseline justify-between gap-2 text-sm font-medium">
        <span>{t("disciplinesTitle")}</span>
        <span className="text-xs font-normal text-muted-foreground">{t("disciplinesCount", { n: String(value.length) })}</span>
      </legend>
      <p className="-mt-1 text-xs text-muted-foreground">{t("disciplinesHint")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {GROUPS.map((g) => {
          const events = EVENTS.filter((e) => e.category === g);
          const all = events.every((e) => selected.has(e.code));
          return (
            <div key={g} className="rounded-xl border bg-muted/30 p-3">
              <button type="button" onClick={() => toggleGroup(g)} aria-pressed={all}
                className="mb-2 text-xs font-semibold tracking-wide text-primary uppercase hover:underline">
                {category(g)}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {events.map((e) => {
                  const on = selected.has(e.code);
                  return (
                    <button key={e.code} type="button" onClick={() => toggle(e.code)} aria-pressed={on}
                      className={cn(
                        "flex min-h-9 items-center gap-1 rounded-full border px-3 text-sm transition",
                        on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/50",
                      )}>
                      {on && <Check className="size-3.5" aria-hidden />}
                      {event(e.code)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{tErr(error)}</p>}
    </fieldset>
  );
}
