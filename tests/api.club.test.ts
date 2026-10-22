import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { admin, resetDb } from "./support/db";

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: async (t: string) => t !== "bad" }));

const { POST: registerClub } = await import("@/app/api/register/club/route");
const { sql } = await import("@/lib/db");

const clubForm = (over: Record<string, unknown> = {}) => ({
  name: "Kandy Harriers Athletic Club",
  category: "CIVIL_CLUB",
  affiliationNumber: "sla/aff/123",
  district: "Kandy",
  presidentName: "Sunil Perera",
  presidentNic: "",
  presidentPhone: "0771234567",
  secretaryName: "Nirmala Silva",
  secretaryNic: "881234567V",
  secretaryPhone: "0712223344",
  email: "Secretary@KandyHarriers.lk",
  consent: true,
  ...over,
});

const post = (form: unknown, turnstileToken = "ok") =>
  registerClub(new Request("http://test/api/register/club", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.20" },
    body: JSON.stringify({ form, turnstileToken, lang: "ta" }),
  }));

beforeAll(resetDb);
afterAll(async () => {
  await sql.end();
  await admin.end();
});

describe("club registration", () => {
  it("issues a district club ID and starts as pending", async () => {
    const res = await post(clubForm());
    expect(res.status).toBe(201);
    const { clubId } = await res.json();
    expect(clubId).toMatch(/^CLB-KDY-\d{4}$/);
    const [c] = await admin`SELECT * FROM club WHERE club_id = ${clubId}`;
    expect(c).toMatchObject({
      status: "pending", category: "CIVIL_CLUB", affiliation_number: "SLA/AFF/123",
      secretary_nic: "198812304567", secretary_phone: "+94712223344", president_nic: null,
      email: "secretary@kandyharriers.lk", language_pref: "ta",
    });
    const [a] = await admin`SELECT actor, action FROM audit_log WHERE slaa_id = ${clubId}`;
    expect(a).toEqual({ actor: "public", action: "register_club" });
  });

  it("does not register armed forces or police", async () => {
    for (const category of ["ARMED_FORCES", "POLICE"]) {
      const res = await post(clubForm({ name: `${category} team`, category, affiliationNumber: "" }));
      expect(res.status).toBe(400);
      expect((await res.json()).fields).toHaveProperty("category", "Choose the type of club.");
    }
    await expect(admin`
      INSERT INTO club (club_id, name, category, district, president_name, president_phone, secretary_name,
                        secretary_nic, secretary_phone, email)
      VALUES ('CLB-CMB-9999', 'Army Team', 'ARMED_FORCES', 'Colombo', 'P', '+94771111111', 'S', '199012345678',
              '+94772222222', 'a@example.com')`).rejects.toMatchObject({ constraint_name: "club_category_check" });
  });

  it("uses the district code for every club", async () => {
    const res = await post(clubForm({ name: "Galle University AC", category: "UNIVERSITY", affiliationNumber: "", district: "Galle" }));
    expect(res.status).toBe(201);
    expect((await res.json()).clubId).toMatch(/^CLB-GAL-\d{4}$/);
  });

  it("blocks the same name or affiliation number twice", async () => {
    const name = await post(clubForm({ name: "kandy harriers athletic club", affiliationNumber: "" }));
    expect(name.status).toBe(409);
    expect((await name.json()).fields).toEqual({ name: "A club with this name is already registered." });
    const aff = await post(clubForm({ name: "Another Club", affiliationNumber: "SLA/AFF/123" }));
    expect(aff.status).toBe(409);
    expect((await aff.json()).fields).toHaveProperty("affiliationNumber");
  });

  it("checks the form and the security check", async () => {
    const bad = await post(clubForm({ name: "AB", secretaryNic: "", email: "nope", consent: false }));
    expect(bad.status).toBe(400);
    const { fields } = await bad.json();
    expect(Object.keys(fields)).toEqual(expect.arrayContaining(["name", "secretaryNic", "email", "consent"]));
    expect((await post(clubForm({ name: "Turnstile Club" }), "bad")).status).toBe(403);
  });
});
