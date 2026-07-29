import path from "path";
import {
  getSupabaseAdmin,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/admin";

export async function uploadProductImage(file: File) {
  const supabase = getSupabaseAdmin();
  const ext = path.extname(file.name) || ".jpg";
  const filename = `prod-${Date.now()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filename, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filename);

  return data.publicUrl;
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
