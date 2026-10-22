import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LANGS, formatDate, districtName, eventName, langFromAcceptLanguage, t, tErr } from "@/lib/i18n";
import { en } from "@/lib/i18n/en";
import { portalEn, portalErrorsSi, portalErrorsTa, portalSi, portalTa } from "@/lib/i18n/portal";
import { registryEn, registryErrorsSi, registryErrorsTa, registrySi, registryTa } from "@/lib/i18n/registry";
import { si, siErrors as siBase } from "@/lib/i18n/si";
import { ta, taErrors as taBase } from "@/lib/i18n/ta";

const siErrors = { ...siBase, ...portalErrorsSi, ...registryErrorsSi };
const taErrors = { ...taBase, ...portalErrorsTa, ...registryErrorsTa };
import { DISTRICTS, EVENTS } from "@/lib/reference";

// Every English message the public site can show must have a Sinhala and a
// Tamil translation. Messages are collected straight from the source files.
const SOURCES = [
  "src/lib/nic.ts",
  "src/lib/validation.ts",
  "src/lib/errors.ts",
  "src/lib/guard.ts",
  "src/lib/register.ts",
  "src/app/api/identity-check/route.ts",
  "src/app/api/register/athlete/route.ts",
  "src/app/api/coaches/search/route.ts",
  "src/app/api/register/coach/route.ts",
  "src/app/api/register/coach/upload/route.ts",
  "src/app/api/register/club/route.ts",
  "src/app/[lang]/register/club/ClubRegistration.tsx",
  "src/app/[lang]/register/athlete/details/AthleteRegistration.tsx",
  "src/app/[lang]/register/coach/details/CoachRegistration.tsx",
  "src/components/coach/QualificationRows.tsx",
];

function publicMessages(): string[] {
  const out = new Set<string>();
  for (const file of SOURCES) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/(?:error|message|return \{ ok: false, error):\s*"([^"]+)"/g)) out.add(m[1]);
    for (const m of src.matchAll(/_MSG = "([^"]+)"/g)) out.add(m[1]);
    for (const m of src.matchAll(/requiredText\("([^"]+)"/g)) {
      out.add(`${m[1]} is required.`);
      out.add(`${m[1]} is too long.`);
    }
    for (const m of src.matchAll(/eventsField\("([^"]+)"\)/g)) out.add(`Select at least one ${m[1]}.`);
  }
  return [...out];
}

describe("translations", () => {
  it("finds the error messages in the source", () => {
    const msgs = publicMessages();
    expect(msgs).toContain("This ID is already registered.");
    expect(msgs).toContain("Full name is required.");
    expect(msgs.length).toBeGreaterThan(40);
  });

  it("portal text exists in all three languages", () => {
    for (const map of [portalSi, portalTa]) {
      expect(Object.keys(map).sort()).toEqual(Object.keys(portalEn).sort());
      for (const [key, value] of Object.entries(map)) {
        if (key === "langSwitchLabel") continue;
        expect(value, key).not.toBe(portalEn[key as keyof typeof portalEn]);
      }
    }
  });

  it("registry text exists in all three languages", () => {
    for (const map of [registrySi, registryTa]) {
      expect(Object.keys(map).sort()).toEqual(Object.keys(registryEn).sort());
      for (const [key, value] of Object.entries(map)) {
        expect(value, key).not.toBe(registryEn[key as keyof typeof registryEn]);
      }
    }
  });

  it("portal text never replaces a form label with the same key", () => {
    const clashes = Object.keys(portalEn).filter((key) => key in en);
    expect(clashes).toEqual([]);
    const registryClashes = Object.keys(registryEn).filter((key) => key in en || key in portalEn);
    expect(registryClashes).toEqual([]);
  });

  for (const [lang, map, messages] of [["si", siErrors, si], ["ta", taErrors, ta]] as const) {
    it(`every public error message has a ${lang} translation`, () => {
      const missing = publicMessages().filter((m) => !(m in map));
      expect(missing).toEqual([]);
    });

    it(`${lang} translations contain no leftover English sentences`, () => {
      for (const [key, value] of Object.entries(messages)) {
        expect(value, key).not.toBe(en[key as keyof typeof en]);
      }
    });
  }

  it("names every district and event in all languages", () => {
    for (const lang of LANGS) {
      for (const d of DISTRICTS) expect(districtName(lang, d)).toBeTruthy();
      for (const e of EVENTS) expect(eventName(lang, e.code)).toBeTruthy();
    }
    expect(districtName("si", "Kandy")).toBe("මහනුවර");
    expect(districtName("ta", "Jaffna")).toBe("யாழ்ப்பாணம்");
    expect(new Set(DISTRICTS.map((d) => districtName("si", d))).size).toBe(DISTRICTS.length);
    expect(new Set(EVENTS.map((e) => eventName("ta", e.code))).size).toBe(EVENTS.length);
  });

  it("fills placeholders and falls back to English for unknown messages", () => {
    expect(t("ta", "nicDecoded", { dob: "X", gender: "Y" })).toContain("X");
    expect(tErr("si", "Some brand new message")).toBe("Some brand new message");
    expect(tErr("en", "This ID is already registered.")).toBe("This ID is already registered.");
  });

  it("reads a language from an Accept-Language header (used before one is chosen)", () => {
    expect(langFromAcceptLanguage("si-LK,si;q=0.9,en;q=0.8")).toBe("si");
    expect(langFromAcceptLanguage("ta-IN,en;q=0.5")).toBe("ta");
    expect(langFromAcceptLanguage("fr-FR,de")).toBe("en");
    expect(langFromAcceptLanguage(null)).toBe("en");
  });

  it("formats dates with translated month names", () => {
    expect(formatDate("en", "2008-03-07")).toBe("7 March 2008");
    expect(formatDate("si", "2008-03-07")).toBe("2008 මාර්තු 7");
    expect(formatDate("ta", "2008-12-31")).toBe("31 டிசம்பர் 2008");
  });
});
