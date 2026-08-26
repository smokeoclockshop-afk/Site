/**
 * Asset pipeline (mirrors the pikfine architecture):
 *   asset-src/**\/*.(png|jpg|jpeg)  ->  public/images/**\/*.webp  (max 2000w, q80)
 * Drop high-res originals under asset-src/ (e.g. asset-src/dishes/butter-chicken.jpg,
 * asset-src/hero/hero.jpg, asset-src/gallery/1.jpg) and run `npm run optimize-images`.
 * Then replace the <Placeholder> slots with <Image src="/images/..."> in the components.
 * No-ops gracefully when asset-src/ is absent.
 */
import { readdirSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'asset-src');
const OUT = join(root, 'public', 'images');

if (!existsSync(SRC)) {
  console.log('asset-src/ not found — nothing to optimize. Add originals there and re-run.');
  process.exit(0);
}

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) files.push(...walk(abs));
    else if (/\.(png|jpe?g)$/i.test(name)) files.push(abs);
  }
  return files;
}

const originals = walk(SRC);
if (originals.length === 0) {
  console.log('asset-src/ is empty — nothing to optimize.');
  process.exit(0);
}

let count = 0;
for (const src of originals) {
  const rel = relative(SRC, src).replace(extname(src), '.webp');
  const dest = join(OUT, rel);
  mkdirSync(dirname(dest), { recursive: true });
  await sharp(src)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(dest);
  count++;
}
console.log(`Optimized ${count} image(s) into public/images/.`);
