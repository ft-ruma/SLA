import { sql } from "@/lib/db";
import type { ClubOption } from "@/lib/reference";
import { AthleteRegistration } from "./AthleteRegistration";

export const metadata = { title: "Athlete details · SLA National Register" };
export const dynamic = "force-dynamic";

async function verifiedClubs(): Promise<ClubOption[]> {
  try {
    return await sql<ClubOption[]>`
      SELECT club_id AS id, name, district FROM club
      WHERE status = 'verified' AND category IN ('CIVIL_CLUB', 'INSTITUTIONAL')
      ORDER BY name`;
  } catch (e) {
    // the form still works: the athlete can type the club under "Other"
    console.error("club list failed", e);
    return [];
  }
}

export default async function AthleteDetailsPage() {
  return <AthleteRegistration clubs={await verifiedClubs()} />;
}
