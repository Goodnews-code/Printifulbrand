/** Hard cap for admin uploads. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Longest edge when Sharp is available (local / hosts that support it). */
const MAX_EDGE = 2000;
const JPEG_QUALITY = 92;
const WEBP_QUALITY = 92;

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
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") return ".jpg";
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

function shouldSkipSharp() {
  // Netlify Functions often block SharedArrayBuffer (Sharp workers fail).
  return (
    process.env.NETLIFY === "true" ||
    process.env.SKIP_IMAGE_OPTIMIZE === "true" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

/**
 * Optionally compress product uploads.
 * On Netlify / restricted hosts, Sharp is skipped and the original file is kept.
 */
export async function optimizeProductImage(
  input: Buffer,
  mimeType: string,
): Promise<OptimizedImage> {
  const originalBytes = input.length;

  if (shouldSkipSharp()) {
    return passthrough(input, mimeType, originalBytes);
  }

  try {
    // Dynamic import — avoids loading Sharp (and SAB workers) when skipped.
    const sharpMod = await import("sharp");
    const sharp = sharpMod.default;
    try {
      sharp.concurrency(1);
      sharp.cache(false);
    } catch {
      // ignore
    }

    const image = sharp(input, {
      failOn: "none",
      sequentialRead: true,
    }).rotate();
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
      "[image-optimize] Sharp unavailable — uploading original:",
      err instanceof Error ? err.message : err,
    );
    return passthrough(input, mimeType, originalBytes);
  }
}
