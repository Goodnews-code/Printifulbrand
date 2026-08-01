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

// Netlify / some serverless hosts disallow SharedArrayBuffer (sharp workers).
try {
  sharp.concurrency(1);
  sharp.cache(false);
} catch {
  // ignore — older sharp builds
}

export type OptimizedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  originalBytes: number;
  optimizedBytes: number;
};

function extensionFromMime(mimeType: string) {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".jpg";
}

function passthrough(
  input: Buffer,
  mimeType: string,
  originalBytes: number,
): OptimizedImage {
  return {
    buffer: input,
    contentType: mimeType || "image/jpeg",
    extension: extensionFromMime(mimeType),
    originalBytes,
    optimizedBytes: originalBytes,
  };
}

/**
 * Auto-compress product uploads while keeping visual quality high.
 * Falls back to the original bytes if Sharp fails (e.g. SharedArrayBuffer
 * blocked on the host) or if compression would enlarge the file.
 */
export async function optimizeProductImage(
  input: Buffer,
  mimeType: string,
): Promise<OptimizedImage> {
  const originalBytes = input.length;

  try {
    const image = sharp(input, { failOn: "none", sequentialRead: true }).rotate();
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
      buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      contentType = "image/png";
      extension = ".png";
    } else if (mimeType === "image/webp") {
      buffer = await pipeline
        .webp({ quality: WEBP_QUALITY, effort: 4 })
        .toBuffer();
      contentType = "image/webp";
      extension = ".webp";
    } else {
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

    if (!needsResize && buffer.length >= originalBytes) {
      return passthrough(input, mimeType, originalBytes);
    }

    return {
      buffer,
      contentType,
      extension,
      originalBytes,
      optimizedBytes: buffer.length,
    };
  } catch (err) {
    console.error(
      "[image-optimize] Sharp failed — uploading original:",
      err instanceof Error ? err.message : err,
    );
    return passthrough(input, mimeType, originalBytes);
  }
}
