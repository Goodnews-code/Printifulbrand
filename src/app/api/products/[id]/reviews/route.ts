import { NextRequest } from "next/server";
import { z } from "zod";
import { getProduct } from "@/lib/products";
import { createReview, listVisibleReviews } from "@/lib/reviews";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const createSchema = z.object({
  author_name: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
  /** Honeypot — must be empty */
  website: z.string().max(0).optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return Response.json({ error: "Invalid product" }, { status: 400 });
    }
    const product = await getProduct(productId);
    if (!product || !(product.is_active === 1 || product.is_active === true)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    const reviews = await listVisibleReviews(productId);
    return Response.json(reviews);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load reviews";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return Response.json({ error: "Invalid product" }, { status: 400 });
    }

    const product = await getProduct(productId);
    if (!product || !(product.is_active === 1 || product.is_active === true)) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Please enter a name, 1–5 star rating, and a short review (10+ characters)." },
        { status: 400 },
      );
    }
    if (parsed.data.website) {
      return Response.json({ error: "Rejected" }, { status: 400 });
    }

    const review = await createReview({
      productId,
      authorName: parsed.data.author_name,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });
    return Response.json(review, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit review";
    return Response.json({ error: message }, { status: 500 });
  }
}
