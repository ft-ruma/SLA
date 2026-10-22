// Zod schemas shared by the forms (client) and the API routes (server).
// Schemas validate what the user typed; normalise*() turns it into what is
// stored. The database still enforces uniqueness and the NIC checks.

import { z } from "zod";
import { DECLARATIONS } from "./declarations";
import { LANGS } from "./i18n";
import { cleanNic, parseNic } from "./nic";
import { DISTRICTS, EVENT_CODES, PB_REGEX } from "./reference";
import { isValidSlaaId } from "./slaa-id";

export const PHONE_REGEX = /^(?:\+94|0)7[0-9]{8}$/;

export function cleanPhone(v: string) {
  return (v ?? "").replace(/[\s-]/g, "");
}

/** Store phones as +947XXXXXXXX so SMS sending needs no further work. */
export function normalizePhone(v: string) {
  const p = cleanPhone(v);
  return p.startsWith("0") ? "+94" + p.slice(1) : p;
}

export function normalizePostalId(v: string) {
  return (v ?? "").replace(/\s/g, "").toUpperCase();
}

export function cleanText(v: string) {
  return (v ?? "").trim().replace(/\s+/g, " ");
}

/** Age in whole years on the given date (default: today in Sri Lanka). */
export function ageOn(dob: string, on: string = todayInColombo()): number {
  const [y, m, d] = dob.split("-").map(Number);
  const [ty, tm, td] = on.split("-").map(Number);
  let age = ty - y;
  if (tm < m || (tm === m && td < d)) age--;
  return age;
}

export function todayInColombo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(new Date());
}

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

const nicField = z.string().refine((v) => parseNic(v).ok, {
  error: (iss) => {
    const r = parseNic(String(iss.input ?? ""));
    return r.ok ? "Invalid NIC" : r.error;
  },
});

export const identitySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("nic"), nic: nicField }),
  z.object({
    type: z.literal("postal"),
    postalId: z
      .string()
      .refine((v) => /^[A-Z0-9/-]{4,20}$/.test(normalizePostalId(v)), {
        error: "Enter the Postal ID number (4-20 letters or digits).",
      }),
  }),
]);

export type Identity = z.infer<typeof identitySchema>;

export type NormalizedIdentity = {
  /** As entered (cleaned); the DB trigger normalises to 12-digit form. */
  nic: string | null;
  postalId: string | null;
};

export function normalizeIdentity(id: Identity): NormalizedIdentity {
  return {
    nic: id.type === "nic" ? cleanNic(id.nic) : null,
    postalId: id.type === "postal" ? normalizePostalId(id.postalId) : null,
  };
}

// ---------------------------------------------------------------------------
// Shared person fields
// ---------------------------------------------------------------------------

const requiredText = (label: string, max = 120) =>
  z
    .string()
    .refine((v) => cleanText(v).length > 0, { error: `${label} is required.` })
    .refine((v) => cleanText(v).length <= max, { error: `${label} is too long.` });

const phoneField = z.string().refine((v) => PHONE_REGEX.test(cleanPhone(v)), {
  error: "Enter a Sri Lankan mobile number, e.g. 0771234567.",
});

const dobField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Enter the date of birth." })
  .refine((v) => !Number.isNaN(Date.parse(v)) && v <= todayInColombo(), {
    error: "Enter a valid date of birth.",
  });

const personCore = {
  fullName: requiredText("Full name"),
  nameWithInitials: requiredText("Name with initials", 80),
  dateOfBirth: dobField,
  gender: z.enum(["M", "F"], { error: "Select a gender." }),
  district: z.enum(DISTRICTS, { error: "Select a district." }),
};

const personFields = {
  ...personCore,
  consent: z.literal(true, { error: "You must agree to continue." }),
};

// ---------------------------------------------------------------------------
// Athlete
// ---------------------------------------------------------------------------

const currentYear = () => Number(todayInColombo().slice(0, 4));

const yearField = z.union([
  z.literal(""),
  z
    .union([z.string().trim().regex(/^\d{4}$/, { error: "Enter a 4-digit year." }), z.number().int()])
    .transform(Number)
    .refine((y) => y >= 1950 && y <= currentYear(), { error: "Enter a year between 1950 and now." }),
]);

export const coachLinkSchema = z
  .object({
    coachId: z.string().refine(isValidSlaaId, { error: "Invalid coach ID." }),
    relationship: z.enum(["CURRENT", "PAST"]),
    startYear: yearField,
    endYear: yearField,
    isPrimary: z.boolean(),
  })
  .superRefine((c, ctx) => {
    if (c.relationship === "CURRENT" && c.endYear !== "") {
      ctx.addIssue({ code: "custom", path: ["endYear"], message: "A current coach has no end year." });
    }
    if (c.relationship === "PAST" && c.isPrimary) {
      ctx.addIssue({ code: "custom", path: ["isPrimary"], message: "Only a current coach can be primary." });
    }
    if (c.startYear !== "" && c.endYear !== "" && c.endYear < c.startYear) {
      ctx.addIssue({ code: "custom", path: ["endYear"], message: "End year is before start year." });
    }
  });

/** One event row: the event, and optionally the personal best and where/when it was set. */
export const eventEntrySchema = z.object({
  code: z.string().refine((c) => EVENT_CODES.includes(c), { error: "Select an event." }),
  pb: z
    .string()
    .trim()
    .refine((v) => v === "" || PB_REGEX.test(v), {
      error: "Enter the personal best as numbers, e.g. 10.85, 1:52.30 or 6.45.",
    }),
  pbYear: yearField,
  pbCompetition: z.string().trim().max(120, { error: "Competition name is too long." }),
});

export type EventEntry = z.infer<typeof eventEntrySchema>;

/** A current or past coach who is not in the list. Phone number is optional. */
export const unlistedCoachSchema = z
  .object({
    name: requiredText("Coach name"),
    phone: z.string(),
    district: z.union([z.literal(""), z.enum(DISTRICTS)]),
    relationship: z.enum(["CURRENT", "PAST"]),
    startYear: yearField,
    endYear: yearField,
  })
  .superRefine((c, ctx) => {
    const phone = cleanPhone(c.phone);
    if (phone !== "" && !PHONE_REGEX.test(phone)) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a Sri Lankan mobile number, e.g. 0771234567." });
    }
    if (c.relationship === "CURRENT" && c.endYear !== "") {
      ctx.addIssue({ code: "custom", path: ["endYear"], message: "A current coach has no end year." });
    }
    if (c.startYear !== "" && c.endYear !== "" && c.endYear < c.startYear) {
      ctx.addIssue({ code: "custom", path: ["endYear"], message: "End year is before start year." });
    }
  });

export type UnlistedCoach = z.infer<typeof unlistedCoachSchema>;

export const guardianSchema = z.object({
  fullName: requiredText("Guardian name"),
  relationship: requiredText("Relationship", 40),
  phone: phoneField,
  nic: z.union([z.literal(""), nicField]),
  consent: z.literal(true, { error: "The guardian must give consent." }),
});

export const ACADEMIC_STATUSES = ["SCHOOL", "UNIVERSITY", "NONE"] as const;
/** What the athlete represents outside school or university. */
export const CLUB_CATEGORIES = ["ARMY", "NAVY", "AIR_FORCE", "POLICE", "CIVIL_CLUB", "OTHER"] as const;
export const FORCES = ["ARMY", "NAVY", "AIR_FORCE", "POLICE"] as const;
export const FORCES_MEMBERSHIP = ["REGULAR_SERVICE", "CONTRACT_SPORTS"] as const;
export const CLUB_ID_REGEX = /^CLB-[A-Z]{3}-[0-9]{4}$/;

const affiliationFields = {
  academicStatus: z.enum(ACADEMIC_STATUSES, { error: "Choose whether you are at school or university." }),
  academicInstitution: z.string().trim().max(150, { error: "School or university name is too long." }),
  representsClub: z.enum(["yes", "no"], { error: "Tell us whether you represent a club or armed force." }),
  clubCategory: z.union([z.literal(""), z.enum(CLUB_CATEGORIES)]),
  clubId: z.string().trim().max(20),
  unlistedClubName: z.string().trim().max(150, { error: "Club name is too long." }),
  forcesMembership: z.union([z.literal(""), z.enum(FORCES_MEMBERSHIP)]),
  forcesServiceId: z.string().trim().max(40, { error: "Service ID is too long." }),
};

type Affiliation = { [K in keyof typeof affiliationFields]: z.infer<(typeof affiliationFields)[K]> };

function refineAffiliation(a: Affiliation, ctx: z.RefinementCtx) {
  if (a.academicStatus !== "NONE" && cleanText(a.academicInstitution) === "") {
    ctx.addIssue({ code: "custom", path: ["academicInstitution"], message: "Enter the name of your school or university." });
  }
  if (a.representsClub !== "yes") return;
  if (a.clubCategory === "") {
    ctx.addIssue({ code: "custom", path: ["clubCategory"], message: "Choose your club or armed force." });
  } else if (a.clubCategory === "CIVIL_CLUB" && !CLUB_ID_REGEX.test(a.clubId)) {
    ctx.addIssue({ code: "custom", path: ["clubId"], message: "Choose your club from the list." });
  } else if (a.clubCategory === "OTHER" && cleanText(a.unlistedClubName) === "") {
    ctx.addIssue({ code: "custom", path: ["unlistedClubName"], message: "Enter your club's name." });
  } else if ((FORCES as readonly string[]).includes(a.clubCategory) && a.forcesMembership === "") {
    ctx.addIssue({ code: "custom", path: ["forcesMembership"], message: "Choose how you serve." });
  }
}

/** What is stored: fields that do not apply to the answers given are dropped. */
export function normalizeAffiliation(a: Affiliation) {
  const club = a.representsClub === "yes" && a.clubCategory !== "" ? a.clubCategory : null;
  const forces = club !== null && (FORCES as readonly string[]).includes(club);
  return {
    academicStatus: a.academicStatus,
    academicInstitution: a.academicStatus === "NONE" ? null : cleanText(a.academicInstitution),
    representsClub: club !== null,
    clubCategory: club,
    clubId: club === "CIVIL_CLUB" ? a.clubId : null,
    unlistedClubName: club === "OTHER" ? cleanText(a.unlistedClubName) : null,
    forcesMembership: forces ? a.forcesMembership || null : null,
    forcesServiceId: forces ? cleanText(a.forcesServiceId) || null : null,
  };
}

export const athleteFormSchema = z
  .object({
    ...personFields,
    phone: phoneField,
    ...affiliationFields,
    // the first event is the main event; any after that are additional
    events: z
      .array(eventEntrySchema)
      .min(1, { error: "Select at least 1 event." })
      .max(8, { error: "Up to 8 events." }),
    guardian: guardianSchema.nullable(),
    coaches: z.array(coachLinkSchema).max(10, { error: "Up to 10 coaches." }),
    unlistedCoaches: z.array(unlistedCoachSchema).max(5, { error: "Up to 5 coaches not in the list." }),
  })
  .superRefine((a, ctx) => {
    refineAffiliation(a, ctx);
    if (dobField.safeParse(a.dateOfBirth).success && ageOn(a.dateOfBirth) < 18 && !a.guardian) {
      ctx.addIssue({
        code: "custom",
        path: ["guardian"],
        message: "Athletes under 18 must give parent or guardian details.",
      });
    }
    if (a.coaches.filter((c) => c.isPrimary).length > 1) {
      ctx.addIssue({ code: "custom", path: ["coaches"], message: "Only one current coach can be primary." });
    }
    const codes = a.events.map((e) => e.code).filter(Boolean);
    a.events.forEach((e, i) => {
      if (e.code && codes.indexOf(e.code) !== i) {
        ctx.addIssue({ code: "custom", path: ["events", i, "code"], message: "An event is selected twice." });
      }
    });
    const current = a.coaches.filter((c) => c.relationship === "CURRENT").map((c) => c.coachId);
    if (new Set(current).size !== current.length) {
      ctx.addIssue({ code: "custom", path: ["coaches"], message: "The same coach is listed twice as current." });
    }
  });

export type AthleteForm = z.infer<typeof athleteFormSchema>;

/** The language the person registered in; staff and messages use it. */
const langField = z.enum(LANGS).catch("en");

export const athleteRegisterSchema = z.object({
  identity: identitySchema,
  form: athleteFormSchema,
  turnstileToken: z.string().min(1, { error: "Please complete the security check." }),
  lang: langField,
});

// ---------------------------------------------------------------------------
// Coach (separate portal, separate route; never accepted by the athlete route)
// ---------------------------------------------------------------------------

export const QUALIFICATION_LEVELS = [
  "CECS_L1_YOUTH",
  "CECS_L2_EVENT",
  "CECS_L3_ELITE",
  "SLAA_NATIONAL",
  "UNIVERSITY_SPORT_SCI",
  "OTHER",
] as const;

export const EVENT_GROUPS = [
  "Sprints", "Hurdles", "Middle distance", "Long distance", "Jumps", "Throws", "Relays",
  "Combined events", "Race walk",
] as const;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const requiredYear = yearField.refine((y) => y !== "", { error: "Enter the year awarded." });

export const qualificationSchema = z
  .object({
    level: z.enum(QUALIFICATION_LEVELS, { error: "Select a qualification." }),
    levelOther: z.string().trim().max(120),
    eventGroup: z.union([z.literal(""), z.enum(EVENT_GROUPS)]),
    issuingBody: requiredText("Issued by", 120),
    serial: z.string().trim().max(60, { error: "Certificate number is too long." }),
    year: requiredYear,
    documentId: z.union([z.literal(""), z.string().regex(UUID_REGEX)]),
    documentName: z.string().max(200),
  })
  .superRefine((q, ctx) => {
    if (q.level === "OTHER" && cleanText(q.levelOther) === "") {
      ctx.addIssue({ code: "custom", path: ["levelOther"], message: "Name of the qualification is required." });
    }
  });

export type Qualification = z.infer<typeof qualificationSchema>;

export const declarationAnswerSchema = z.object({
  answer: z.enum(["confirm", "disclose", ""]),
  details: z.string().max(2000),
});

/** Signature check: same letters as the full name, ignoring case and spacing. */
export function signatureMatches(signature: string, fullName: string) {
  const norm = (s: string) => cleanText(s).toLocaleLowerCase();
  return norm(signature) !== "" && norm(signature) === norm(fullName);
}

/** Everything the coach portal asks that belongs to the coach role itself. */
const coachRoleFields = {
  email: z.string().trim().max(200).refine((v) => v === "" || EMAIL_REGEX.test(v), {
    error: "Enter a valid email address.",
  }),
  licenseNo: z.string().trim().max(40),
  licenseLevel: z.string().trim().max(60),
  disciplines: z
    .array(z.string().refine((c) => EVENT_CODES.includes(c), { error: "Select an event." }))
    .min(1, { error: "Choose at least one event you coach." })
    .max(EVENT_CODES.length),
  qualifications: z.array(qualificationSchema).max(10, { error: "Up to 10 qualifications." }),
  /** optional profile photo, uploaded before submitting */
  photoId: z.union([z.literal(""), z.string().regex(UUID_REGEX)]),
  declarations: z.record(z.string(), declarationAnswerSchema),
  signature: z.string().max(200),
};

type CoachRole = { [K in keyof typeof coachRoleFields]: z.infer<(typeof coachRoleFields)[K]> };

function refineCoachRole(c: CoachRole, ctx: z.RefinementCtx) {
  for (const d of DECLARATIONS) {
    const a = c.declarations[d.code];
    if (!a || a.answer === "") {
      ctx.addIssue({ code: "custom", path: ["declarations", d.code], message: "Please answer every declaration." });
    } else if (a.answer === "disclose" && !d.allowsDisclosure) {
      ctx.addIssue({
        code: "custom",
        path: ["declarations", d.code],
        message: "This statement cannot be disclosed; please confirm it or contact SLA.",
      });
    } else if (a.answer === "disclose" && cleanText(a.details) === "") {
      ctx.addIssue({ code: "custom", path: ["declarations", d.code], message: "Give details for each disclosure." });
    }
  }
  const docs = [...c.qualifications.map((q) => q.documentId), c.photoId].filter(Boolean);
  if (new Set(docs).size !== docs.length) {
    ctx.addIssue({ code: "custom", path: ["qualifications"], message: "A certificate file could not be found. Please attach it again." });
  }
}

export const coachFormSchema = z
  .object({ ...personCore, phone: phoneField, ...coachRoleFields })
  .superRefine((c, ctx) => {
    if (dobField.safeParse(c.dateOfBirth).success && ageOn(c.dateOfBirth) < 18) {
      ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Coaches must be 18 or older." });
    }
    refineCoachRole(c, ctx);
    if (!signatureMatches(c.signature, c.fullName)) {
      ctx.addIssue({ code: "custom", path: ["signature"], message: "The signature must match your full name exactly." });
    }
  });

export type CoachForm = z.infer<typeof coachFormSchema>;

/**
 * A person who already has an SLA ID (as an athlete) adds the coach role.
 * Their personal details are already on record, so only the coach part is
 * asked; the server checks the signature against the name on record.
 */
export const coachRoleFormSchema = z.object(coachRoleFields).superRefine((c, ctx) => {
  refineCoachRole(c, ctx);
  if (cleanText(c.signature) === "") {
    ctx.addIssue({ code: "custom", path: ["signature"], message: "Type your full name to sign." });
  }
});

export type CoachRoleForm = z.infer<typeof coachRoleFormSchema>;

const turnstileField = z.string().min(1, { error: "Please complete the security check." });

export const coachRegisterSchema = z.preprocess(
  // requests without a mode come from forms made before roles could be added
  (v) => (v && typeof v === "object" && !("mode" in v) ? { ...v, mode: "new" } : v),
  z.discriminatedUnion("mode", [
    z.object({
      mode: z.literal("new"),
      identity: identitySchema,
      form: coachFormSchema,
      turnstileToken: turnstileField,
      lang: langField,
    }),
    z.object({
      mode: z.literal("addRole"),
      identity: identitySchema,
      slaaId: z.string().trim().toUpperCase().refine(isValidSlaaId, { error: "Invalid SLA ID." }),
      form: coachRoleFormSchema,
      turnstileToken: turnstileField,
      lang: langField,
    }),
  ]),
);

// ---------------------------------------------------------------------------
// Club (separate portal; registers an organisation, not a person)
// ---------------------------------------------------------------------------

// Armed forces and police are not registered here; athletes pick them from a fixed list.
export const CLUB_TYPES = ["UNIVERSITY", "SCHOOL", "CIVIL_CLUB", "INSTITUTIONAL"] as const;

export const clubFormSchema = z
  .object({
    name: requiredText("Club name", 150).refine((v) => cleanText(v).length >= 3, { error: "Club name is too short." }),
    category: z.enum(CLUB_TYPES, { error: "Choose the type of club." }),
    affiliationNumber: z.string().trim().max(40, { error: "Affiliation number is too long." }),
    district: z.enum(DISTRICTS, { error: "Select a district." }),
    presidentName: requiredText("President's name"),
    presidentNic: z.union([z.literal(""), nicField]),
    presidentPhone: phoneField,
    secretaryName: requiredText("Secretary's name"),
    secretaryNic: nicField,
    secretaryPhone: phoneField,
    email: z.string().trim().max(200).refine((v) => EMAIL_REGEX.test(v), { error: "Enter a valid email address." }),
    consent: z.literal(true, { error: "You must agree to continue." }),
  });

export type ClubForm = z.infer<typeof clubFormSchema>;

export const clubRegisterSchema = z.object({
  form: clubFormSchema,
  turnstileToken: turnstileField,
  lang: langField,
});

export const identityCheckSchema = z.object({
  identity: identitySchema,
  turnstileToken: z.string().min(1, { error: "Please complete the security check." }),
});

/** First error message per field path, for API 400 responses. */
export function flattenIssues(err: z.ZodError): { message: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  for (const i of err.issues) {
    const key = i.path.join(".");
    if (!(key in fields)) fields[key] = i.message;
  }
  return { message: err.issues[0]?.message ?? "Please check the form.", fields };
}
