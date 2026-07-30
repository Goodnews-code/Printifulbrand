import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { MAX_UPLOAD_BYTES } from "@/lib/image-optimize";
import { uploadProductImage } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return Response.json({ error: "No image uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/") || !ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        {
          error: `Upload rejected: file type “${file.type || "unknown"}” is not allowed. Use JPEG, PNG, WebP, or GIF. Maximum size is 5MB.`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return Response.json(
        {
          error: `Upload rejected: “${file.name}” is ${sizeMb}MB. Maximum allowed is 5MB.`,
        },
        { status: 400 },
      );
    }

    const result = await uploadProductImage(file);
    return Response.json({
      image_url: result.image_url,
      originalBytes: result.originalBytes,
      optimizedBytes: result.optimizedBytes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
