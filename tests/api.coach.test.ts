import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { DECLARATIONS } from "@/lib/declarations";
import { admin, resetDb } from "./support/db";

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: async (t: string) => t !== "bad" }));
let staff: string | null = "staff@sla.lk";
vi.mock("@/lib/admin-auth", () => ({ getAdmin: async () => staff }));

const { POST: identityCheck } = await import("@/app/api/identity-check/route");
const { POST: registerAthlete } = await import("@/app/api/register/athlete/route");
const { POST: registerCoach } = await import("@/app/api/register/coach/route");
const { POST: uploadCertificate } = await import("@/app/api/register/coach/upload/route");
const { GET: downloadDocument } = await import("@/app/api/admin/coach-document/[id]/route");
const { sql } = await import("@/lib/db");

const COACH_NIC = "881234567V";
const COACH_NAME = "Ruwan Kumara Jayasinghe";

function post(body: unknown, cookie?: string) {
  return new Request("http://test/api", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
}

function upload(bytes: Uint8Array<ArrayBuffer>, name: string, cookie?: string, kind = "certificate") {
  const fd = new FormData();
  fd.append("file", new File([bytes], name));
  fd.append("kind", kind);
  return new Request("http://test/api/register/coach/upload", {
    method: "POST",
    headers: { "x-forwarded-for": "203.0.113.9", ...(cookie ? { cookie } : {}) },
    body: fd,
  });
}

const PDF = new TextEncoder().encode("%PDF-1.4\n% test certificate\n");
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);

const confirmAll = () =>
  Object.fromEntries(DECLARATIONS.map((d) => [d.code, { answer: "confirm", details: "" }]));

const coachForm = (over: Record<string, unknown> = {}) => ({
  fullName: COACH_NAME,
  nameWithInitials: "R. K. Jayasinghe",
  dateOfBirth: "1988-05-02",
  gender: "M",
  district: "Colombo",
  phone: "0712223344",
  email: "Ruwan@Example.com",
  licenseNo: "",
  licenseLevel: "",
  disciplines: ["100m", "200m"],
  qualifications: [],
  photoId: "",
  declarations: confirmAll(),
  signature: COACH_NAME,
  ...over,
});

const coachBody = (over: Record<string, unknown> = {}, nic = COACH_NIC) => ({
  identity: { type: "nic", nic },
  form: coachForm(over),
  turnstileToken: "ok",
  lang: "si",
});

async function pass(nic: string) {
  const res = await identityCheck(post({ identity: { type: "nic", nic }, turnstileToken: "ok" }));
  return (res.headers.get("set-cookie") ?? "").split(";")[0];
}

let cookie = "";
let athleteId = "";

beforeAll(async () => {
  await resetDb();
  const res = await registerAthlete(post({
    identity: { type: "nic", nic: "199076512345" },
    form: {
      fullName: "Anusha Kumari Fernando",
      nameWithInitials: "A. K. Fernando",
      dateOfBirth: "1990-09-21",
      gender: "F",
      district: "Kandy",
      phone: "0711234567",
      academicStatus: "NONE",
      academicInstitution: "",
      representsClub: "no",
      clubCategory: "",
      clubId: "",
      unlistedClubName: "",
      forcesMembership: "",
      forcesServiceId: "",
      events: [{ code: "400m", pb: "", pbYear: "", pbCompetition: "" }],
      unlistedCoaches: [
        { name: "R. K. Jayasinghe", phone: "0712223344", district: "", relationship: "CURRENT", startYear: "", endYear: "" },
      ],
      guardian: null,
      coaches: [],
      consent: true,
    },
    turnstileToken: "ok",
    lang: "en",
  }));
  expect(res.status).toBe(201);
  athleteId = (await res.json()).slaaId;
  cookie = await pass(COACH_NIC);
});
afterAll(async () => {
  await sql.end();
  await admin.end();
});

describe("certificate upload", () => {
  it("needs the pass from the identity check", async () => {
    expect((await uploadCertificate(upload(PDF, "cert.pdf"))).status).toBe(401);
  });

  it("checks the file contents, not the name", async () => {
    const res = await uploadCertificate(upload(new TextEncoder().encode("MZ fake exe"), "cert.pdf", cookie));
    expect(res.status).toBe(400);
  });

  it("refuses files over 3 MB", async () => {
    const big = new Uint8Array(3 * 1024 * 1024 + 1);
    big.set(PDF);
    expect((await uploadCertificate(upload(big, "big.pdf", cookie))).status).toBe(413);
  });

  it("takes only a JPG or PNG as the profile photo", async () => {
    const pdf = await uploadCertificate(upload(PDF, "me.pdf", cookie, "photo"));
    expect(pdf.status).toBe(400);
    expect((await pdf.json()).error).toBe("The photo must be a JPG or PNG.");
    expect((await uploadCertificate(upload(PNG, "me.png", cookie, "photo"))).status).toBe(201);
  });
});

describe("coach registration", () => {
  it("does not accept a Postal ID", async () => {
    const res = await registerCoach(post({
      ...coachBody({ dateOfBirth: "1985-03-02", gender: "M" }),
      identity: { type: "postal", postalId: "PID55555" },
    }, cookie));
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toHaveProperty("identity", "Coaches register with their NIC.");
  });

  it("rejects a wrong signature and unanswered declarations", async () => {
    const declarations = confirmAll();
    delete (declarations as Record<string, unknown>).COACH_CODE;
    const res = await registerCoach(post(coachBody({ signature: "Someone Else", declarations }), cookie));
    expect(res.status).toBe(400);
    const { fields } = await res.json();
    expect(Object.keys(fields)).toEqual(expect.arrayContaining(["signature", "declarations.COACH_CODE"]));
  });

  it("only allows disclosure where the statement permits it", async () => {
    const res = await registerCoach(post(coachBody({
      declarations: { ...confirmAll(), COACH_CODE: { answer: "disclose", details: "x" } },
    }), cookie));
    expect(res.status).toBe(400);
  });

  it("does not attach someone else's certificate", async () => {
    const other = await pass("199112345678");
    const up = await uploadCertificate(upload(PDF, "other.pdf", other));
    const { id } = await up.json();
    const res = await registerCoach(post(coachBody({
      qualifications: [{ level: "CECS_L1_YOUTH", levelOther: "", eventGroup: "Sprints", issuingBody: "World Athletics",
                         serial: "", year: 2020, documentId: id, documentName: "other.pdf" }],
    }), cookie));
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toHaveProperty("qualifications");
  });

  it("does not accept a certificate as the profile photo", async () => {
    const up = await uploadCertificate(upload(PDF, "cert.pdf", cookie));
    const res = await registerCoach(post(coachBody({ photoId: (await up.json()).id }), cookie));
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toHaveProperty("photoId");
  });

  it("registers a coach with a certificate, a photo and a disclosure", async () => {
    const up = await uploadCertificate(upload(PDF, "CECS level 1.pdf", cookie));
    expect(up.status).toBe(201);
    const doc = await up.json();
    const photo = await (await uploadCertificate(upload(PNG, "face.png", cookie, "photo"))).json();

    const res = await registerCoach(post(coachBody({
      qualifications: [{ level: "CECS_L1_YOUTH", levelOther: "", eventGroup: "Sprints", issuingBody: "World Athletics",
                         serial: "WA-123", year: 2020, documentId: doc.id, documentName: doc.name }],
      photoId: photo.id,
      declarations: { ...confirmAll(), CLEAN_RECORD: { answer: "disclose", details: "Traffic fine in 2010." } },
      signature: "  ruwan kumara  JAYASINGHE ",
    }), cookie));
    expect(res.status).toBe(201);
    const { slaaId } = await res.json();
    expect(slaaId).toMatch(/^SL\d{2}-\d{6}-\d$/);

    const [m] = await admin`SELECT email, language_pref, date_of_birth::text dob FROM member WHERE slaa_id = ${slaaId}`;
    expect(m).toMatchObject({ email: "ruwan@example.com", language_pref: "si", dob: "1988-05-02" });
    const [c] = await admin`SELECT registered_via, disciplines FROM coach WHERE slaa_id = ${slaaId}`;
    expect(c).toMatchObject({ registered_via: "public", disciplines: ["100m", "200m"] });

    const [q] = await admin`SELECT document_path FROM coach_qualification WHERE coach_id = ${slaaId}`;
    expect(q.document_path).toBe(`coach_document:${doc.id}`);
    expect(await admin`SELECT kind, coach_id FROM coach_document WHERE coach_id = ${slaaId} ORDER BY kind`).toEqual([
      { kind: "certificate", coach_id: slaaId },
      { kind: "photo", coach_id: slaaId },
    ]);

    const decl = await admin<{ code: string; answer: string; review_status: string }[]>`
      SELECT code, answer, review_status FROM coach_declaration WHERE coach_id = ${slaaId}`;
    expect(decl).toHaveLength(3);
    expect(decl.find((x) => x.code === "CLEAN_RECORD")).toMatchObject({ answer: "disclose", review_status: "pending" });

    // The athlete had already named this coach by phone, so the link is made
    // and waits for the coach to confirm it.
    const links = await admin`
      SELECT relationship_type, is_approved_by_coach, listed_by FROM athlete_coach
      WHERE athlete_id = ${athleteId} AND coach_id = ${slaaId}`;
    expect(links).toEqual([{ relationship_type: "CURRENT", is_approved_by_coach: false, listed_by: "athlete" }]);
    const [req] = await admin`SELECT status, resolved_coach FROM coach_request WHERE requested_by = ${athleteId}`;
    expect(req).toMatchObject({ status: "registered", resolved_coach: slaaId });
  });

  it("blocks the same NIC a second time", async () => {
    const res = await registerCoach(post(coachBody(), cookie));
    expect(res.status).toBe(409);
  });

  it("tells the identity check which portal the person already used", async () => {
    const res = await identityCheck(post({ identity: { type: "nic", nic: COACH_NIC }, turnstileToken: "ok" }));
    expect((await res.json()).roles).toEqual({ athlete: false, coach: true });
  });
});

describe("an athlete adding the coach role", () => {
  const ATHLETE_NIC = "199076512345";
  const roleForm = (over: Record<string, unknown> = {}) => ({
    email: "anusha@example.com", licenseNo: "", licenseLevel: "", disciplines: ["400m"], qualifications: [],
    photoId: "", declarations: confirmAll(), signature: "Anusha Kumari Fernando", ...over,
  });
  const addRole = (c: string, over: Record<string, unknown> = {}, slaaId = athleteId) =>
    registerCoach(post({ mode: "addRole", identity: { type: "nic", nic: ATHLETE_NIC }, slaaId, form: roleForm(over),
                         turnstileToken: "ok", lang: "en" }, c));

  it("the identity check offers to add the role to the same ID", async () => {
    const res = await identityCheck(post({ identity: { type: "nic", nic: ATHLETE_NIC }, turnstileToken: "ok" }));
    expect(await res.json()).toMatchObject({ exists: true, slaaId: athleteId, roles: { athlete: true, coach: false } });
  });

  it("needs the signature to match the name on the SLA record", async () => {
    const res = await addRole(await pass(ATHLETE_NIC), { signature: "Someone Else" });
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toHaveProperty("signature", "The signature must match the full name on your SLA record.");
  });

  it("cannot attach the role to someone else's ID", async () => {
    const [{ slaa_id: other }] = await admin`SELECT slaa_id FROM coach LIMIT 1`;
    const res = await addRole(await pass(ATHLETE_NIC), {}, other);
    expect(res.status).toBe(409);
  });

  it("keeps one SLA ID with both roles", async () => {
    const res = await addRole(await pass(ATHLETE_NIC));
    expect(res.status).toBe(201);
    expect((await res.json()).slaaId).toBe(athleteId);
    expect(await admin`SELECT count(*)::int n FROM member WHERE nic = ${ATHLETE_NIC}`).toEqual([{ n: 1 }]);
    expect(await admin`SELECT 1 FROM athlete WHERE slaa_id = ${athleteId}`).toHaveLength(1);
    const [c] = await admin`SELECT disciplines, registered_via FROM coach WHERE slaa_id = ${athleteId}`;
    expect(c).toEqual({ disciplines: ["400m"], registered_via: "public" });
    const [m] = await admin`SELECT full_name, email FROM member WHERE slaa_id = ${athleteId}`;
    expect(m).toEqual({ full_name: "Anusha Kumari Fernando", email: "anusha@example.com" });
    const [a] = await admin`SELECT action FROM audit_log WHERE slaa_id = ${athleteId} AND action = 'add_coach_role'`;
    expect(a).toBeTruthy();

    const again = await addRole(await pass(ATHLETE_NIC));
    expect(again.status).toBe(409);
    expect((await again.json()).error).toBe("This ID is already registered as a coach.");
  });

  it("the database forbids coaching yourself", async () => {
    await expect(admin`
      INSERT INTO athlete_coach (athlete_id, coach_id, relationship_type, is_primary, listed_by)
      VALUES (${athleteId}, ${athleteId}, 'CURRENT', false, 'athlete')`).rejects.toMatchObject({ constraint_name: "no_self_coaching" });
  });
});

describe("staff certificate download", () => {
  const get = (id: string) =>
    downloadDocument(new Request("http://test"), { params: Promise.resolve({ id }) });

  it("serves an attached certificate and writes the audit log", async () => {
    const [doc] = await admin<{ id: string; coach_id: string }[]>`
      SELECT id, coach_id FROM coach_document WHERE coach_id IS NOT NULL AND kind = 'certificate'`;
    const res = await get(doc.id);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain("attachment");
    expect(Buffer.from(await res.arrayBuffer())).toEqual(Buffer.from(PDF));
    const audit = await admin`SELECT actor FROM audit_log WHERE action = 'download_coach_document' AND slaa_id = ${doc.coach_id}`;
    expect(audit).toEqual([{ actor: "staff@sla.lk" }]);
  });

  it("never serves a file that was not submitted with a registration", async () => {
    const [doc] = await admin<{ id: string }[]>`SELECT id FROM coach_document WHERE coach_id IS NULL LIMIT 1`;
    expect((await get(doc.id)).status).toBe(404);
  });

  it("needs a signed-in staff member", async () => {
    staff = null;
    const [doc] = await admin<{ id: string }[]>`SELECT id FROM coach_document WHERE coach_id IS NOT NULL`;
    expect((await get(doc.id)).status).toBe(401);
    staff = "staff@sla.lk";
  });
});

describe("separate portals", () => {
  it("the athlete route ignores coach fields and the coach route ignores athlete fields", async () => {
    const c = await pass("197512345678");
    const res = await registerCoach(post({
      ...coachBody({ guardian: { fullName: "X" }, events: [{ code: "LJ" }], coaches: [{ slaaId: "C26-000001-0" }] },
        "197512345678"),
    }, c));
    expect(res.status).toBe(201);
    const { slaaId } = await res.json();
    expect(await admin`SELECT 1 FROM athlete WHERE slaa_id = ${slaaId}`).toHaveLength(0);
    expect(await admin`SELECT 1 FROM guardian WHERE athlete_id = ${slaaId}`).toHaveLength(0);
  });
});
