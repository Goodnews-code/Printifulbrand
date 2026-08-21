import { NextRequest } from "next/server";
import { MAX_UPLOAD_BYTES } from "@/lib/image-optimize";
import { uploadPackageLogo } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Public logo upload for Small Business Package customizations. */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return Response.json({ error: "No logo file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/") || !ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        {
          error:
            "Upload a logo image (JPEG, PNG, WebP, or GIF). Maximum size is 5MB.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return Response.json(
        {
          error: `Logo is ${sizeMb}MB. Maximum allowed is 5MB.`,
        },
        { status: 400 },
      );
    }

    const result = await uploadPackageLogo(file);
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
