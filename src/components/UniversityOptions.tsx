"use client";

import { PRIVATE_UNIVERSITIES, STATE_UNIVERSITIES, UNIVERSITIES } from "@/lib/reference";
import { useT } from "./LangProvider";

/** Select value for "another university", which then asks for the name as text. */
export const OTHER_UNIVERSITY = "__other";

export const isListedUniversity = (name: string) => (UNIVERSITIES as readonly string[]).includes(name);

/** The options of a university select: state and private groups, then "another university". */
export function UniversityOptions() {
  const { t } = useT();
  return (
    <>
      <option value="">{t("select")}</option>
      <optgroup label={t("universityGroupState")}>
        {STATE_UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
      </optgroup>
      <optgroup label={t("universityGroupPrivate")}>
        {PRIVATE_UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
      </optgroup>
      <option value={OTHER_UNIVERSITY}>{t("universityOther")}</option>
    </>
  );
}
