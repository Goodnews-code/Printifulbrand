import { NextRequest } from "next/server";
import { z } from "zod";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/products";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const includeAll = req.nextUrl.searchParams.get("all") === "true";
    if (includeAll && !isAuthorized(req)) return unauthorized();
    return Response.json(await listProducts(includeAll));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load products";
    return Response.json({ error: message }, { status: 500 });
  }
}

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  image_url: z.string().optional(),
  category: z.string().optional(),
  is_active: z.boolean().optional(),
  images: z
    .array(
      z.object({
        image_url: z.string(),
        color_code: z.string(),
        is_primary: z.union([z.boolean(), z.number()]).optional(),
      }),
    )
    .optional(),
  sizes: z
    .array(
      z.object({
        size_name: z.string(),
        price: z.number(),
      }),
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const product = await createProduct(parsed.data);
    return Response.json(product, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
