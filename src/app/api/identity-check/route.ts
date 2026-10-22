import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapPgError } from "@/lib/errors";
import { issuePass, rateLimit, readJson, requireTurnstile } from "@/lib/guard";
import { flattenIssues, identityCheckSchema, normalizeIdentity } from "@/lib/validation";

// Step 1 of registration. Returns only the masked record from
// find_existing_member_public(); never the unmasked lookup.
export async function POST(req: Request) {
  const parsed = identityCheckSchema.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: flattenIssues(parsed.error).message }, { status: 400 });
  const { identity, turnstileToken } = parsed.data;

  try {
    const limited = await rateLimit(req, "identityCheck");
    if (limited) return limited;
    const failed = await requireTurnstile(req, turnstileToken);
    if (failed) return failed;

    const id = normalizeIdentity(identity);
    const rows = await sql<
      { slaa_id: string; masked_name: string; district: string; is_athlete: boolean; is_coach: boolean }[]
    >`
      SELECT f.slaa_id, f.masked_name, f.district,
             EXISTS (SELECT 1 FROM athlete a WHERE a.slaa_id = f.slaa_id) AS is_athlete,
             EXISTS (SELECT 1 FROM coach c WHERE c.slaa_id = f.slaa_id) AS is_coach
      FROM find_existing_member_public(${id.nic}, ${id.postalId}) f
      LIMIT 1`;

    // roles let the other portal explain that staff add a role to the same ID
    const res = rows.length
      ? NextResponse.json({
          exists: true,
          slaaId: rows[0].slaa_id,
          maskedName: rows[0].masked_name,
          district: rows[0].district,
          roles: { athlete: rows[0].is_athlete, coach: rows[0].is_coach },
        })
      : NextResponse.json({ exists: false });
    issuePass(res);
    return res;
  } catch (e) {
    const mapped = mapPgError(e);
    if (mapped) return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    console.error("identity-check failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
