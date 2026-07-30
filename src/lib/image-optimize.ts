import sharp from "sharp";

/** Hard cap for admin uploads (before compression). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Longest edge — enough for product cards / retina, drops unused megapixels. */
const MAX_EDGE = 2000;

/**
 * High visual quality for web product photos.
 * 92 + 4:4:4 is effectively lossless for storefront use.
 */
const JPEG_QUALITY = 92;
const WEBP_QUALITY = 92;

export type OptimizedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  originalBytes: number;
  optimizedBytes: number;
};

/**
 * Auto-compress product uploads while keeping visual quality high.
 * - Rotates from EXIF
 * - Caps dimensions at MAX_EDGE (no upscaling)
 * - Photos → high-quality JPEG
 * - Images with transparency → lossless PNG
 * Falls back to the original bytes if compression would make the file larger
 * and no resize was needed.
 */
export async function optimizeProductImage(
  input: Buffer,
  mimeType: string,
): Promise<OptimizedImage> {
  const originalBytes = input.length;
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();

  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const needsResize = width > MAX_EDGE || height > MAX_EDGE;
  const hasAlpha = Boolean(meta.hasAlpha);

  const pipeline = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  let buffer: Buffer;
  let contentType: string;
  let extension: string;

  if (hasAlpha) {
    // Lossless — no quality loss for logos / graphics with transparency
    buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    contentType = "image/png";
    extension = ".png";
  } else if (mimeType === "image/webp") {
    buffer = await pipeline
      .webp({ quality: WEBP_QUALITY, effort: 5 })
      .toBuffer();
    contentType = "image/webp";
    extension = ".webp";
  } else {
    // Photos / opaque images — high-quality JPEG (visually near-lossless on web)
    buffer = await pipeline
      .jpeg({
        quality: JPEG_QUALITY,
        mozjpeg: true,
        chromaSubsampling: "4:4:4",
      })
      .toBuffer();
    contentType = "image/jpeg";
    extension = ".jpg";
  }

  // Prefer original only when we didn't need to resize and compression grew the file
  if (!needsResize && buffer.length >= originalBytes) {
    const extFromMime =
      mimeType === "image/png"
        ? ".png"
        : mimeType === "image/webp"
          ? ".webp"
          : mimeType === "image/gif"
            ? ".gif"
            : ".jpg";
    return {
      buffer: input,
      contentType: mimeType || "image/jpeg",
      extension: extFromMime,
      originalBytes,
      optimizedBytes: originalBytes,
    };
  }

  return {
    buffer,
    contentType,
    extension,
    originalBytes,
    optimizedBytes: buffer.length,
  };
}
