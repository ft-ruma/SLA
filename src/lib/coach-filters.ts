import { sql } from "./db";
import { normalizeNic } from "./nic";
import { DISTRICTS } from "./reference";

export type CoachFilters = {
  q: string;
  district: string;
  status: string;
  level: string;
  page: number;
};

export function coachFilters(
  input: Record<string, string | undefined>,
): CoachFilters {
  const get = (k: string, n = 120) =>
    String(input[k] ?? "")
      .trim()
      .slice(0, n);

  return {
    q: get("q"),
    district: (DISTRICTS as readonly string[]).includes(get("district"))
      ? get("district")
      : "",
    status: ["pending", "verified", "suspended"].includes(get("status"))
      ? get("status")
      : "",
    level: get("level"),
    page: Math.min(100000, Math.max(1, parseInt(get("page"), 10) || 1)),
  };
}

export function coachWhere(s: CoachFilters) {
  const nic = s.q ? normalizeNic(s.q) : null;
  const like = (value: string) =>
    "%" + value.replace(/[\\%_]/g, (c) => "\\" + c) + "%";

  return sql`WHERE m.status <> 'merged'
    ${s.district ? sql`AND m.district = ${s.district}` : sql``}
    ${
      s.status === "verified"
        ? sql`AND (c.is_verified = true OR m.status = 'verified')`
        : s.status === "pending"
          ? sql`AND (c.is_verified = false AND m.status = 'pending')`
          : s.status === "suspended"
            ? sql`AND m.status = 'suspended'`
            : sql``
    }
    ${s.level ? sql`AND c.license_level ILIKE ${like(s.level)}` : sql``}
    ${
      nic
        ? sql`AND (m.nic = ${nic} OR m.slaa_id ILIKE ${s.q.replace(/[\\%_]/g, (c) => "\\" + c) + "%"})`
        : s.q
          ? sql`AND (
              m.slaa_id ILIKE ${s.q.replace(/[\\%_]/g, (c) => "\\" + c) + "%"} OR
              m.full_name ILIKE ${like(s.q)} OR
              m.name_with_initials ILIKE ${like(s.q)} OR
              c.slaa_license_no ILIKE ${like(s.q)} OR
              m.phone ILIKE ${like(s.q)} OR
              m.email ILIKE ${like(s.q)} OR
              m.postal_id = ${s.q.toUpperCase()}
            )`
          : sql``
    }`;
}
