import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { passKey, rateLimit } from "@/lib/guard";
import { errorResponse } from "@/lib/register";

// Certificate and profile-photo upload for the coach portal. Files are
// stored in the database until the coach submits; only SLA staff can open
// them. The browser must hold the pass from the identity check, and the file
// type is checked from its contents, not its name. A photo must be JPG or PNG.

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const MAX_PENDING_PER_SESSION = 20;

function sniff(buf: Buffer): "application/pdf" | "image/jpeg" | "image/png" | null {
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  return null;
}

function safeName(name: string) {
  const cleaned = name.replace(/[^\p{L}\p{N} ._()-]/gu, "_").replace(/\s+/g, " ").trim();
  return (cleaned || "certificate").slice(-200);
}

export async function POST(req: Request) {
  const key = passKey(req);
  if (!key) {
    return NextResponse.json(
      { error: "Your session has expired. Please start the registration again." },
      { status: 401 },
    );
  }

  let file: FormDataEntryValue | null = null;
  let kind: "certificate" | "photo" = "certificate";
  try {
    const data = await req.formData();
    file = data.get("file");
    if (data.get("kind") === "photo") kind = "photo";
  } catch {
    file = null;
  }
  const wrongType = kind === "photo" ? "The photo must be a JPG or PNG." : "The file must be a PDF, JPG or PNG.";
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: wrongType }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "The file is larger than 3 MB." }, { status: 413 });
  }

  try {
    const limited = await rateLimit(req, "register");
    if (limited) return limited;

    const data = Buffer.from(await file.arrayBuffer());
    const type = sniff(data);
    if (!type || (kind === "photo" && type === "application/pdf")) {
      return NextResponse.json({ error: wrongType }, { status: 400 });
    }

    const [{ n }] = await sql<{ n: number }[]>`
      SELECT count(*)::int AS n FROM coach_document
      WHERE upload_key = ${key} AND coach_id IS NULL AND created_at > now() - interval '1 day'`;
    if (n >= MAX_PENDING_PER_SESSION) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const name = safeName(file.name);
    const [row] = await sql<{ id: string }[]>`
      INSERT INTO coach_document (upload_key, kind, file_name, content_type, size_bytes, sha256, data)
      VALUES (${key}, ${kind}, ${name}, ${type}, ${data.length},
              ${createHash("sha256").update(data).digest("hex")}, ${data})
      RETURNING id`;
    return NextResponse.json({ id: row.id, name, size: data.length }, { status: 201 });
  } catch (e) {
    return errorResponse(e, "coach upload");
  }
}
