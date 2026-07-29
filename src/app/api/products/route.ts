import { NextRequest } from "next/server";
import { z } from "zod";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/products";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const includeAll = req.nextUrl.searchParams.get("all") === "true";
  if (includeAll && !isAuthorized(req)) return unauthorized();
  return Response.json(listProducts(includeAll));
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
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const product = createProduct(parsed.data);
  return Response.json(product, { status: 201 });
}
