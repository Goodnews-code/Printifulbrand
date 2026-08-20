import { NextRequest } from "next/server";
import { z } from "zod";
import { getProduct } from "@/lib/products";
import { createReview, listReviewsForProduct } from "@/lib/reviews";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return Response.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await getProduct(productId);
    if (!product || !(product.is_active === 1 || product.is_active === true)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const reviews = await listReviewsForProduct(productId);
    return Response.json(reviews);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load reviews";
    return Response.json({ error: message }, { status: 500 });
  }
}

const reviewSchema = z.object({
  author_name: z.string().trim().min(1).max(80),
  comment: z.string().trim().min(3).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return Response.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await getProduct(productId);
    if (!product || !(product.is_active === 1 || product.is_active === true)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid review", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const review = await createReview({
      productId,
      authorName: parsed.data.author_name,
      comment: parsed.data.comment,
      rating: parsed.data.rating,
    });

    return Response.json(review, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create review";
    return Response.json({ error: message }, { status: 500 });
  }
}
