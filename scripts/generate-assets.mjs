import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const outDir = resolve(process.cwd(), "resources");
mkdirSync(outDir, { recursive: true });

const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="60%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <g transform="translate(512 570)">
    <path d="M0 -280 C -170 -140, -300 -25, -300 115 C -300 245, -180 320, -75 270 C -65 335, -155 385, -205 415 L 205 415 C 155 385, 65 335, 75 270 C 180 320, 300 245, 300 115 C 300 -25, 170 -140, 0 -280 Z" fill="#f59e0b" stroke="#fbbf24" stroke-width="10"/>
  </g>
</svg>
`;

const ICON_FG_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <g transform="translate(512 540) scale(0.75)">
    <path d="M0 -280 C -170 -140, -300 -25, -300 115 C -300 245, -180 320, -75 270 C -65 335, -155 385, -205 415 L 205 415 C 155 385, 65 335, 75 270 C 180 320, 300 245, 300 115 C 300 -25, 170 -140, 0 -280 Z" fill="#f59e0b" stroke="#fbbf24" stroke-width="10"/>
  </g>
</svg>
`;

const SPLASH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="60%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </radialGradient>
  </defs>
  <rect width="2732" height="2732" fill="url(#bg)"/>
  <g transform="translate(1366 1200)">
    <path d="M0 -320 C -190 -160, -340 -30, -340 130 C -340 280, -200 360, -90 305 C -80 380, -180 435, -230 470 L 230 470 C 180 435, 80 380, 90 305 C 200 360, 340 280, 340 130 C 340 -30, 190 -160, 0 -320 Z" fill="#f59e0b" stroke="#fbbf24" stroke-width="12"/>
  </g>
  <text x="1366" y="2000" font-family="Georgia, serif" font-size="180" font-weight="700" fill="#f8fafc" text-anchor="middle" letter-spacing="8">CoincheScore</text>
</svg>
`;

async function main() {
  await sharp(Buffer.from(ICON_SVG))
    .resize(1024, 1024)
    .png()
    .toFile(resolve(outDir, "icon.png"));

  await sharp(Buffer.from(ICON_FG_SVG))
    .resize(1024, 1024)
    .png()
    .toFile(resolve(outDir, "icon-foreground.png"));

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0x02, g: 0x2c, b: 0x22, alpha: 1 },
    },
  })
    .png()
    .toFile(resolve(outDir, "icon-background.png"));

  await sharp(Buffer.from(SPLASH_SVG))
    .resize(2732, 2732)
    .png()
    .toFile(resolve(outDir, "splash.png"));

  await sharp(Buffer.from(SPLASH_SVG))
    .resize(2732, 2732)
    .png()
    .toFile(resolve(outDir, "splash-dark.png"));

  console.log("Assets generated in", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
