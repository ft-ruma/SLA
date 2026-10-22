import { describe, expect, it } from "vitest";
import { COMPETITIONS, NEWS, PAGES, RANKINGS, RECORDS } from "@/content";
import { en } from "@/lib/dict/en";
import { si } from "@/lib/dict/si";
import { ta } from "@/lib/dict/ta";
import { formatMark, getEvent } from "@/lib/events";
import { formatDateRange } from "@/lib/i18n";
import { LANGS } from "@/lib/langs";
import { isValidSlaaId, normalizeSlaaId } from "@/lib/slaa-id";

describe("SLA ID", () => {
  it("matches the plan's test vectors", () => {
    expect(isValidSlaaId("SL26-000452-8")).toBe(true);
    expect(isValidSlaaId("SL26-000452-3")).toBe(false);
    expect(isValidSlaaId("SL26-000001-3")).toBe(true);
    expect(isValidSlaaId("SL27-000001-1")).toBe(true);
  });

  it("accepts the ID typed without dashes or in lowercase", () => {
    expect(normalizeSlaaId("sl26 000452 8")).toBe("SL26-000452-8");
    expect(isValidSlaaId("sl260004528")).toBe(true);
  });
});

describe("marks", () => {
  it("formats times, distances and points", () => {
    expect(formatMark("100m", 10280)).toBe("10.28");
    expect(formatMark("800m", 125400)).toBe("2:05.40");
    expect(formatMark("MAR", 8054000)).toBe("2:14:14");
    expect(formatMark("LJ", 7680)).toBe("7.68");
    expect(formatMark("DEC", 7012)).toBe("7,012");
  });
});

describe("dates", () => {
  it("shortens ranges inside one month", () => {
    expect(formatDateRange("en", "2026-10-23", "2026-10-25")).toBe("23–25 October 2026");
    expect(formatDateRange("en", "2026-10-23", "2026-10-23")).toBe("23 October 2026");
  });
});

describe("translations", () => {
  it("has every interface text in Sinhala and Tamil", () => {
    for (const dict of [si, ta]) {
      expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
      for (const [k, v] of Object.entries(dict)) {
        expect(v.trim(), k).not.toBe("");
        if (/[a-z]{4,}/.test(en[k as keyof typeof en])) {
          expect(v, `${k} looks untranslated`).not.toBe(en[k as keyof typeof en]);
        }
      }
    }
  });

  it("has all content in three languages", () => {
    const texts = [
      ...NEWS.flatMap((n) => [n.title, n.summary]),
      ...COMPETITIONS.map((c) => c.name),
      ...Object.values(PAGES).flatMap((p) => [p.title, p.intro, ...p.sections.flatMap((s) => [s.heading, s.body])]),
    ];
    for (const text of texts) for (const l of LANGS) expect(text[l]?.trim(), text.en).toBeTruthy();
    for (const n of NEWS) {
      expect(n.body.si.length).toBe(n.body.en.length);
      expect(n.body.ta.length).toBe(n.body.en.length);
    }
  });
});

describe("content", () => {
  it("uses only known events", () => {
    const codes = [
      ...RANKINGS.map((r) => r.event),
      ...RECORDS.map((r) => r.event),
      ...COMPETITIONS.flatMap((c) => c.results?.map((r) => r.event) ?? []),
    ];
    for (const code of codes) expect(() => getEvent(code)).not.toThrow();
  });

  it("has unique addresses", () => {
    expect(new Set(NEWS.map((n) => n.slug)).size).toBe(NEWS.length);
    expect(new Set(COMPETITIONS.map((c) => c.id)).size).toBe(COMPETITIONS.length);
  });
});
