import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const outDir = resolve(process.cwd(), "resources");
mkdirSync(outDir, { recursive: true });

const FEATURE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500">
  <defs>
    <radialGradient id="bg" cx="30%" cy="50%" r="90%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="60%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>

  <!-- Big spade on the left -->
  <g transform="translate(210 260)">
    <path d="M0 -170 C -100 -80, -180 -15, -180 70 C -180 155, -105 195, -45 165 C -40 205, -95 240, -125 260 L 125 260 C 95 240, 40 205, 45 165 C 105 195, 180 155, 180 70 C 180 -15, 100 -80, 0 -170 Z" fill="#f59e0b" stroke="#fbbf24" stroke-width="6"/>
  </g>

  <!-- Decorative small suits on right -->
  <g transform="translate(870 90)" opacity="0.15">
    <text font-family="Georgia, serif" font-size="80" fill="#f8fafc" text-anchor="middle">♥</text>
  </g>
  <g transform="translate(910 190)" opacity="0.12">
    <text font-family="Georgia, serif" font-size="70" fill="#f8fafc" text-anchor="middle">♦</text>
  </g>
  <g transform="translate(850 300)" opacity="0.13">
    <text font-family="Georgia, serif" font-size="90" fill="#f8fafc" text-anchor="middle">♣</text>
  </g>

  <!-- Title & subtitle -->
  <text x="440" y="205" font-family="Georgia, serif" font-size="68" font-weight="700" fill="#f8fafc">CoincheScore</text>
  <text x="440" y="255" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="400" fill="#fbbf24" letter-spacing="2">Coinche &amp; Belote</text>
  <text x="440" y="315" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="300" fill="#f8fafc" opacity="0.75">Compteur de points · Gratuit · Sans pub</text>
</svg>
`;

async function main() {
  await sharp(Buffer.from(FEATURE_SVG))
    .resize(1024, 500)
    .png()
    .toFile(resolve(outDir, "feature-graphic.png"));

  console.log("Feature graphic generated:", resolve(outDir, "feature-graphic.png"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
