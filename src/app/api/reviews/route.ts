import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { listAllReviews, listReviewSummaries } from "@/lib/reviews";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "true";
    if (all) {
      if (!isAuthorized(req)) return unauthorized();
      return Response.json(await listAllReviews());
    }
    return Response.json(await listReviewSummaries());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load reviews";
    return Response.json({ error: message }, { status: 500 });
  }
}
