import {
  getSupabaseAdmin,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/admin";
import { optimizeProductImage } from "@/lib/image-optimize";

function extensionFromNameOrMime(file: File): string {
  const fromName = file.name.match(/\.(jpe?g|png|webp|gif)$/i)?.[0];
  if (fromName) return fromName.toLowerCase().replace("jpeg", "jpg");
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  return ".jpg";
}

export async function uploadProductImage(file: File) {
  const supabase = getSupabaseAdmin();

  // Plain copy — never pass SharedArrayBuffer views into Node/Sharp.
  const ab = await file.arrayBuffer();
  const input = Buffer.from(new Uint8Array(ab));

  let optimized;
  try {
    optimized = await optimizeProductImage(input, file.type || "image/jpeg");
  } catch (err) {
    console.error("[storage] optimize failed, using original:", err);
    const ext = extensionFromNameOrMime(file);
    optimized = {
      buffer: input,
      contentType: file.type || "image/jpeg",
      extension: ext.startsWith(".") ? ext : `.${ext}`,
      originalBytes: input.length,
      optimizedBytes: input.length,
    };
  }

  const filename = `prod-${Date.now()}${optimized.extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filename, optimized.buffer, {
      contentType: optimized.contentType,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filename);

  return {
    image_url: data.publicUrl,
    originalBytes: optimized.originalBytes,
    optimizedBytes: optimized.optimizedBytes,
  };
}

/** Extract storage object path from a public URL or legacy /uploads path. */
export function storagePathFromUrl(imageUrl: string): string | null {
  if (imageUrl.startsWith("/uploads/")) {
    return imageUrl.replace(/^\/uploads\//, "");
  }
  const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(imageUrl.slice(idx + marker.length));
}

export async function purgeDeletedImages(olderThanDays = 3) {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: rows, error } = await supabase
    .from("deleted_images")
    .select("id, image_path")
    .lte("deleted_at", cutoff);

  if (error) throw new Error(error.message);

  let removed = 0;
  for (const row of rows ?? []) {
    const objectPath = storagePathFromUrl(row.image_path);
    if (objectPath) {
      const { error: removeError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .remove([objectPath]);
      if (!removeError) removed += 1;
    }
    await supabase.from("deleted_images").delete().eq("id", row.id);
  }

  return { queued: rows?.length ?? 0, removed };
}
