import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { purgeDeletedImages } from "@/lib/storage";

export const runtime = "nodejs";

/** Purge soft-deleted upload files older than 3 days. */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const result = await purgeDeletedImages(3);
    return Response.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cleanup failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
