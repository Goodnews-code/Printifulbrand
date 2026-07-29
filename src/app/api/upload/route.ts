import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { uploadProductImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return Response.json({ error: "No image uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Only images allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Max 5MB" }, { status: 400 });
    }

    const image_url = await uploadProductImage(file);
    return Response.json({ image_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
