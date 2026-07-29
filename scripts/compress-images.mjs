/**
 * One-time compressor for product photos in public/assets/Image
 * Usage: node scripts/compress-images.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public", "assets", "Image");
const MAX_WIDTH = 900;
const QUALITY = 72;

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return null;

  const input = await fs.promises.readFile(filePath);
  const before = input.length;

  let pipeline = sharp(input).rotate().resize({
    width: MAX_WIDTH,
    height: MAX_WIDTH,
    fit: "inside",
    withoutEnlargement: true,
  });

  let buffer;
  if (ext === ".png") {
    buffer = await pipeline.png({ compressionLevel: 9, quality: QUALITY }).toBuffer();
  } else {
    buffer = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
  }

  if (buffer.length >= before) {
    return { file: path.basename(filePath), before, after: before, skipped: true };
  }

  await fs.promises.writeFile(filePath, buffer);
  return {
    file: path.basename(filePath),
    before,
    after: buffer.length,
    skipped: false,
  };
}

async function main() {
  if (!fs.existsSync(DIR)) {
    console.error("Missing folder:", DIR);
    process.exit(1);
  }

  const files = (await fs.promises.readdir(DIR)).filter((f) =>
    /\.(jpe?g|png|webp)$/i.test(f),
  );

  let saved = 0;
  for (const file of files) {
    const result = await compressFile(path.join(DIR, file));
    if (!result) continue;
    const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
    if (result.skipped) {
      console.log(`skip  ${result.file} (${kb(result.before)})`);
    } else {
      saved += result.before - result.after;
      console.log(
        `ok    ${result.file}  ${kb(result.before)} → ${kb(result.after)}`,
      );
    }
  }
  console.log(`\nSaved ~${(saved / 1024 / 1024).toFixed(1)} MB total`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
