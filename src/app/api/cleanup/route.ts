import { unlink } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

/** Purge soft-deleted upload files older than 3 days. */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, image_path FROM deleted_images
       WHERE deleted_at <= datetime('now', '-3 days')`,
    )
    .all() as Array<{ id: number; image_path: string }>;

  let removed = 0;
  for (const row of rows) {
    const relative = row.image_path.replace(/^\//, "");
    const filePath = path.join(process.cwd(), "public", relative);
    try {
      await unlink(filePath);
      removed += 1;
    } catch {
      // File may already be gone
    }
    db.prepare("DELETE FROM deleted_images WHERE id = ?").run(row.id);
  }

  return Response.json({
    success: true,
    queued: rows.length,
    removed,
  });
}
