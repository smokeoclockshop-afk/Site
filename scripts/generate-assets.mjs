/**
 * Generates the brand placeholder assets the app references:
 *  - public/icon.png (512) + public/icon-192.png (192)  — PWA / schema logo
 *  - src/app/icon.png                                    — favicon (Next auto-detects)
 *  - public/og-default.jpg (1200×630)                    — default social card
 * Re-run after swapping in real brand artwork. Uses the editorial palette:
 * roast canvas, parchment ink, saffron accent.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ensure = (abs) => {
  mkdirSync(dirname(abs), { recursive: true });
  return abs;
};

const ROAST = '#292622';
const PARCH = '#f1eae0';
const SAFFRON = '#d49653';

function ornament(cx, cy, s, color, opacity = 1) {
  return `<path d="M${cx} ${cy - s} L${cx + s * 0.45} ${cy} L${cx} ${cy + s} L${cx - s * 0.45} ${cy} Z" fill="${color}" opacity="${opacity}"/>`;
}

const iconSvg = (size) => {
  const c = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${ROAST}"/>
    <rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.84}" height="${size * 0.84}" fill="none" stroke="${PARCH}" stroke-opacity="0.18" stroke-width="${size * 0.008}"/>
    ${ornament(c, size * 0.34, size * 0.12, SAFFRON)}
    <text x="${c}" y="${size * 0.64}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${size * 0.26}" fill="${PARCH}" letter-spacing="${size * 0.01}">A</text>
    <text x="${c}" y="${size * 0.8}" text-anchor="middle" font-family="Georgia, serif" font-size="${size * 0.075}" fill="${PARCH}" fill-opacity="0.65" letter-spacing="${size * 0.02}">PALACE</text>
  </svg>`;
};

const ogSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${ROAST}"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="${PARCH}" stroke-opacity="0.18" stroke-width="2"/>
  ${ornament(600, 210, 26, SAFFRON)}
  <text x="600" y="330" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="96" fill="${PARCH}" letter-spacing="10">AMRIT PALACE</text>
  <text x="600" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="${SAFFRON}" letter-spacing="8">FLAVORS THAT STAY</text>
  <text x="600" y="470" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="${PARCH}" fill-opacity="0.6" letter-spacing="6">AUTHENTIC INDIAN CUISINE · CENTRAL FLORIDA · EST. 1996</text>
</svg>`;

await sharp(Buffer.from(iconSvg(512))).png().toFile(ensure(join(root, 'public', 'icon.png')));
await sharp(Buffer.from(iconSvg(192))).png().toFile(ensure(join(root, 'public', 'icon-192.png')));
await sharp(Buffer.from(iconSvg(512))).png().toFile(ensure(join(root, 'src', 'app', 'icon.png')));
await sharp(Buffer.from(ogSvg())).jpeg({ quality: 88, mozjpeg: true }).toFile(ensure(join(root, 'public', 'og-default.jpg')));

console.log('Generated: icon.png, icon-192.png, src/app/icon.png, og-default.jpg');
