import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";
import { StatusBadge } from "../StatusBadge";
import { setClubStatus } from "./actions";

export const metadata = { title: "Clubs · SLA admin" };

type Club = {
  club_id: string; name: string; category: string; affiliation_number: string | null;
  district: string; president_name: string; president_phone: string; secretary_name: string; secretary_nic: string;
  secretary_phone: string; email: string; status: string; created_at: Date; verified_by: string | null; athletes: number;
};

const CATEGORY_NAMES: Record<string, string> = {
  UNIVERSITY: "University", SCHOOL: "School", CIVIL_CLUB: "Civil club", INSTITUTIONAL: "Institution",
};

export default async function ClubsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = "pending" } = await searchParams;
  const shown = ["pending", "verified", "suspended"].includes(status) ? status : "pending";

  const [clubs, unlisted] = await Promise.all([
    sql<Club[]>`
      SELECT c.*, (SELECT count(*)::int FROM athlete a WHERE a.club_id = c.club_id) AS athletes
      FROM club c WHERE c.status = ${shown} ORDER BY c.created_at LIMIT 500`,
    sql<{ name: string; athletes: number; example: string }[]>`
      SELECT min(unlisted_club_name) AS name, count(*)::int AS athletes, min(slaa_id) AS example
      FROM athlete WHERE club_category = 'OTHER' AND unlisted_club_name IS NOT NULL
      GROUP BY lower(unlisted_club_name) ORDER BY count(*) DESC, 1 LIMIT 200`,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-bold">Clubs</h1>
        <nav className="flex gap-3 text-sm">
          {["pending", "verified", "suspended"].map((s) => (
            <Link key={s} href={`?status=${s}`} className={s === shown ? "font-semibold" : "text-primary"}>{s}</Link>
          ))}
        </nav>
      </div>
      <p className="text-sm text-muted-foreground">
        Clubs already on the register. Call the secretary to check the details, then verify. Verified
        civil and institutional clubs appear in the athlete form; armed forces and police are always listed.
      </p>

      {!clubs.length && <p className="rounded-lg border bg-background p-6 text-center text-muted-foreground">No {shown} clubs.</p>}

      {clubs.map((c) => (
        <section key={c.club_id} className="flex flex-col gap-3 rounded-lg border bg-background p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">
                {c.name} <span className="font-mono text-muted-foreground">{c.club_id}</span> <StatusBadge status={c.status} />
              </p>
              <p className="text-muted-foreground">
                {CATEGORY_NAMES[c.category] ?? c.category}
                {" · "}{c.district}
                {" · "}affiliation no. {c.affiliation_number ?? "none"} · {c.athletes} athletes
              </p>
            </div>
            <form action={setClubStatus} className="flex gap-2">
              <input type="hidden" name="clubId" value={c.club_id} />
              {c.status !== "verified" && (
                <button name="action" value="verify" className="h-8 rounded-md bg-emerald-700 px-3 text-xs text-white">Verify</button>
              )}
              {c.status !== "suspended" && (
                <button name="action" value="suspend" className="h-8 rounded-md border border-red-300 px-3 text-xs text-red-700">Suspend</button>
              )}
              {c.status === "suspended" && (
                <button name="action" value="reopen" className="h-8 rounded-md border px-3 text-xs">Back to pending</button>
              )}
            </form>
          </div>
          <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <div><dt className="inline text-muted-foreground">President / CO: </dt><dd className="inline">{c.president_name} · {c.president_phone}</dd></div>
            <div><dt className="inline text-muted-foreground">Secretary: </dt><dd className="inline">{c.secretary_name} · {c.secretary_nic} · {c.secretary_phone}</dd></div>
            <div><dt className="inline text-muted-foreground">Email: </dt><dd className="inline">{c.email}</dd></div>
            <div><dt className="inline text-muted-foreground">Registered: </dt><dd className="inline">{c.created_at.toLocaleDateString("en-GB")}{c.verified_by && ` · verified by ${c.verified_by}`}</dd></div>
          </dl>
        </section>
      ))}

      <h2 className="mt-4 text-lg font-semibold">Clubs typed by athletes</h2>
      <p className="text-sm text-muted-foreground">
        Athletes chose “A club that is not in the list”. These names are not on the verified club list.
      </p>
      {unlisted.length ? (
        <table className="w-full rounded-lg border bg-background text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-2">Club name</th><th className="p-2">Athletes</th><th className="p-2">Example</th></tr>
          </thead>
          <tbody className="divide-y">
            {unlisted.map((u) => (
              <tr key={u.name}>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.athletes}</td>
                <td className="p-2"><Link className="font-mono text-primary hover:underline" href={`/admin/members/${u.example}`}>{u.example}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">None yet.</p>
      )}
    </div>
  );
}
