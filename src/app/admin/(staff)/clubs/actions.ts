"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";
import { CLUB_ID_REGEX } from "@/lib/validation";

const NEXT_STATUS = { verify: "verified", suspend: "suspended", reopen: "pending" } as const;

/** Verify, suspend or reopen a club. Only verified clubs appear in the athlete form. */
export async function setClubStatus(formData: FormData) {
  const admin = await requireAdmin();
  const clubId = String(formData.get("clubId") ?? "").trim().toUpperCase();
  const action = String(formData.get("action") ?? "") as keyof typeof NEXT_STATUS;
  if (!CLUB_ID_REGEX.test(clubId) || !(action in NEXT_STATUS)) throw new Error("Invalid club action");
  const status = NEXT_STATUS[action];
  await sql.begin(async (tx) => {
    const [c] = await tx<{ club_id: string }[]>`
      UPDATE club SET status = ${status},
        verified_by = ${status === "verified" ? admin : null},
        verified_at = CASE WHEN ${status} = 'verified' THEN now() END
      WHERE club_id = ${clubId} AND status <> ${status}
      RETURNING club_id`;
    if (!c) return;
    await tx`
      INSERT INTO audit_log (actor, action, slaa_id, details)
      VALUES (${admin}, ${"club_" + status}, ${clubId}, ${tx.json({})})`;
  });
  revalidatePath("/admin/clubs");
}
