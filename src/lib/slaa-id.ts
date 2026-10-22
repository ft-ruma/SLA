// SLA ID: SL26-000452-8 (year, 6-digit serial, Luhn check digit over the
// 8 digits). IDs issued before the unified format (A26-000123-4 for
// athletes, C26-... for coaches, O26-... for officials) stay valid for life.
// checkDigit() must give the same answer as slaa_check_digit() in SQL.

export const SLAA_ID_REGEX = /^(?:SL|[ACO])[0-9]{2}-[0-9]{6}-[0-9]$/;

export function checkDigit(body: string): number {
  const digits = body.replace(/\D/g, "");
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i]);
    // double every second digit counting from the right, starting with the last
    if ((digits.length - (i + 1)) % 2 === 0) {
      const x = d * 2;
      sum += Math.floor(x / 10) + (x % 10);
    } else {
      sum += d;
    }
  }
  return (10 - (sum % 10)) % 10;
}

export function isValidSlaaId(id: string): boolean {
  const v = id.trim().toUpperCase();
  if (!SLAA_ID_REGEX.test(v)) return false;
  return checkDigit(v.slice(0, -2)) === Number(v.at(-1));
}

/** Builds an ID in the unified format (the database issues the real ones). */
export function formatSlaaId(serial: number, year: number): string {
  const body = `SL${String(year).slice(-2)}-${String(serial).padStart(6, "0")}`;
  return `${body}-${checkDigit(body)}`;
}

const COACH_LEVEL: Record<string, string> = { CECS_L1_YOUTH: "C-L1", CECS_L2_EVENT: "C-L2", CECS_L3_ELITE: "C-L3" };

/**
 * Role badge printed after the ID: [A], [C-L2] or [A | C-L1]. The coach
 * level is the highest World Athletics CECS level the coach holds.
 */
export function roleBadge(roles: { athlete: boolean; coach: boolean }, qualificationLevels: string[] = []): string {
  const parts: string[] = [];
  if (roles.athlete) parts.push("A");
  if (roles.coach) {
    const levels = qualificationLevels.map((l) => COACH_LEVEL[l]).filter(Boolean).sort();
    parts.push(levels.at(-1) ?? "C");
  }
  return parts.length ? `[${parts.join(" | ")}]` : "";
}
