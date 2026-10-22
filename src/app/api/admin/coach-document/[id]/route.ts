import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

// Certificate or profile photo a coach attached in the coach portal. Staff
// only; every download is written to audit_log. Files waiting for a coach to
// submit are never served. ?inline=1 shows an image in the page (PDFs are
// always downloaded).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [doc] = await sql<{ coach_id: string; file_name: string; content_type: string; data: Buffer }[]>`
    SELECT coach_id, file_name, content_type, data FROM coach_document
    WHERE id = ${id} AND coach_id IS NOT NULL`;
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sql`
    INSERT INTO audit_log (actor, action, slaa_id, details)
    VALUES (${admin}, 'download_coach_document', ${doc.coach_id}, ${sql.json({ document: id })})`;

  const inline = new URL(req.url).searchParams.get("inline") === "1" && doc.content_type.startsWith("image/");
  const ascii = doc.file_name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.content_type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(doc.file_name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
