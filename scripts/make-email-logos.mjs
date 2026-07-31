import sharp from "sharp";

const size = 256;
const yellow = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="128" cy="128" r="128" fill="#FFFF00"/>
  </svg>`,
);

const logo = await sharp("public/assets/logo.svg")
  .resize(170, 170, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await sharp(yellow)
  .composite([{ input: logo, gravity: "center" }])
  .png()
  .toFile("public/assets/logo-email.png");

console.log("email logo assets ready");
