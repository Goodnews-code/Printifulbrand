import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { deleteReview, listAllReviews } from "@/lib/reviews";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const reviews = await listAllReviews();
    return Response.json(reviews);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load reviews";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isFinite(id)) {
      return Response.json({ error: "Invalid review id" }, { status: 400 });
    }

    const ok = await deleteReview(id);
    if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete review";
    return Response.json({ error: message }, { status: 500 });
  }
}
