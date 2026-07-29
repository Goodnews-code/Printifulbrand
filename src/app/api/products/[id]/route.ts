import { NextRequest } from "next/server";
import { z } from "zod";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const product = await getProduct(Number(id));
    if (!product) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load product";
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

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const product = await updateProduct(Number(id), parsed.data);
    if (!product) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { id } = await params;
    const product = await deleteProduct(Number(id));
    if (!product) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
