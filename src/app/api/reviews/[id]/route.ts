import { NextRequest } from "next/server";
import { z } from "zod";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { deleteReview, setReviewVisibility } from "@/lib/reviews";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  is_visible: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { id } = await params;
    const reviewId = Number(id);
    if (!Number.isFinite(reviewId)) {
      return Response.json({ error: "Invalid review" }, { status: 400 });
    }
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }
    const review = await setReviewVisibility(reviewId, parsed.data.is_visible);
    if (!review) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(review);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { id } = await params;
    const reviewId = Number(id);
    if (!Number.isFinite(reviewId)) {
      return Response.json({ error: "Invalid review" }, { status: 400 });
    }
    const ok = await deleteReview(reviewId);
    if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
