/**
 * Generates on-brand SVG placeholders into /public/placeholders for every media
 * slot (see src/lib/media.ts — keep the id list in sync). Run once; commit the
 * output:  node scripts/gen-placeholders.mjs
 *
 * Each placeholder reads as an intentional slot: coal gradient + mill-scale
 * noise + hairline frame + mono caption (id · note · aspect). A few slots also
 * get a recognizable silhouette so scene composition reads before real photos.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'public', 'placeholders');
mkdirSync(OUT, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id, aspect, label, note  — mirror of src/lib/media.ts
const SLOTS = [
  ['ph.hero.poster', '16/9', 'HERO', 'відкритий смокер із м’ясом · 16:9 · ≥1920px'],
  ['ph.hero.video', '16/9', 'HERO VIDEO', 'відкритий смокер · 8–15 с · без звуку'],
  ['ph.showcase.poster', '16/9', 'ВІТРИНА', 'постер нарізки'],
  ['ph.showcase.video', '16/9', 'ВІТРИНА VIDEO', 'нарізка 15–25 с'],
  ['ph.dish.1', '4/5', 'БРИСКЕТ', 'нарізаний, зріз'],
  ['ph.dish.2', '4/5', 'РЕБЕРЦЯ', 'глазур, решітка'],
  ['ph.dish.3', '4/5', 'ПУЛД-ПОРК', 'розібране мясо'],
  ['ph.dish.4', '4/5', 'КУРКА', 'хрустка шкірка'],
  ['ph.dish.5', '4/5', 'РИБА', 'скумбрія · креветки'],
  ['ph.feature.steel', '4/5', 'ЖАР', 'вугілля в камері'],
  ['ph.feature.stable', '4/5', 'ДИМ', 'рівний дим'],
  ['ph.feature.thermo', '4/5', 'ТЕРМОМЕТР', 'врізний, макро'],
  ['ph.feature.space', '4/5', 'РЕШІТКА', 'повна камера'],
  ['ph.feature.handles', '4/5', 'РУЧКА', 'дуб, макро'],
  ['ph.feature.wheels', '4/5', 'КОЛЕСА', 'смокер у русі'],
  ['ph.feature.paint', '4/5', 'ФАРБА', 'корпус у жарі'],
  ['ph.feature.warranty', '4/5', 'ШОВ', 'зварний шов'],
  ['ph.feature.serial', '4/5', 'КЛЕЙМО', 'табличка майстра'],
  ['ph.feature.engrave', '4/5', 'ГРАВІЮВАННЯ', 'іменна табличка'],
  ['ph.anatomy.smokerBody', '3/2', 'КОРПУС', 'корпус збоку · шар', 'smoker'],
  ['ph.anatomy.smokerLid', '3/2', 'КРИШКА', 'відкрита кришка · шар', 'lid'],
  ['ph.anatomy.chamber', '3/2', 'КАМЕРА', 'камера зсередини · шар'],
  ['ph.anatomy.brisketInside', '3/2', 'БРИСКЕТ', 'на решітці · шар'],
  ['ph.anatomy.foodPlated', '3/2', 'ПОДАЧА', 'брискет на дошці · шар', 'food'],
  ['ph.anatomy.table', '3/1', 'СТІЛ', 'дерев’яна стільниця'],
  ['ph.anatomy.props', '1/1', 'ДЕКОР', 'склянка · ніж · зелень'],
  ['ph.product.smoker', '4/3', 'СМОКЕР 530', 'предметне фото', 'smoker'],
  ['ph.product.chasha', '4/3', 'ЧАША Ø90', 'предметне фото', 'chasha'],
  ['ph.product.mangal', '4/3', 'МАНГАЛ', 'предметне фото', 'mangal'],
  ['ph.product.custom', '4/3', 'КАСТОМ', 'приклад виробу'],
  ['ph.process.0730', '4/3', '07:30 РОЗКРІЙ', 'креслення · розкрій'],
  ['ph.process.0800', '4/3', '08:00 РІЗКА', 'лазер · іскри'],
  ['ph.process.1030', '4/3', '10:30 ВАЛЬЦІ', 'вальцювання обичайки'],
  ['ph.process.1300', '4/3', '13:00 ШВИ', 'зварювання корпусу'],
  ['ph.process.1530', '4/3', '15:30 ФАЄРБОКС', 'топка · тяга'],
  ['ph.process.1700', '4/3', '17:00 ЗАЧИСТКА', 'шліфування швів'],
  ['ph.process.1830', '4/3', '18:30 ФАРБА', 'термофарбування'],
  ['ph.process.2000', '4/3', '20:00 РОЗПАЛ', 'вогневий тест · клеймо'],
  ...Array.from({ length: 6 }, (_, i) => [`ph.review.${i + 1}`, '1/1', `ВІДГУК ${i + 1}`, 'фото від клієнта']),
  ['ph.recipe.1', '16/9', 'РЕЦЕПТ', 'брискет'],
  ['ph.recipe.2', '16/9', 'РЕЦЕПТ', 'реберця'],
  ['ph.recipe.3', '16/9', 'РЕЦЕПТ', 'коптильня'],
  ...Array.from({ length: 12 }, (_, i) => [`ph.smoker.g${String(i + 1).padStart(2, '0')}`, '4/3', `ГАЛЕРЕЯ ${i + 1}`, 'смокер 530', i === 0 ? 'smoker' : null]),
  ['ph.smoker.video', '16/9', 'ВІДЕО', 'огляд 60–90 с'],
  ['ph.master.portrait', '3/4', 'МАЙСТЕР', 'портрет'],
  ['ph.master.workshop', '21/9', 'ЦЕХ', 'панорама'],
  ['ph.master.weldMacro', '1/1', 'ШОВ', 'макро'],
  ['ph.b2b.horeca', '4/3', 'HORECA', 'кейс'],
  ['ph.b2b.glamping', '4/3', 'ГЛЕМПІНГ', 'кейс'],
  ['ph.b2b.gifts', '4/3', 'ПОДАРУНКИ', 'іменні вироби'],
  ['ph.contact.workshop', '16/9', 'ЦЕХ', 'зовні'],
  ['ph.contact.map', '16/9', 'МАПА', 'проїзд'],
  ['ph.og.default', '1200/630', "SMOKE O'CLOCK", 'OG 1200×630'],
];

function silhouette(kind, W, H) {
  const cx = W / 2;
  const cy = H / 2;
  const stroke = 'stroke="#2c2c2c" stroke-opacity="0.2" stroke-width="2" fill="#cbbca7"';
  if (kind === 'smoker') {
    const bw = W * 0.52, bh = H * 0.34, bx = cx - bw / 2 + W * 0.04, by = cy - bh / 2;
    return `
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${bh / 2}" ${stroke}/>
      <rect x="${bx - W * 0.14}" y="${by + bh * 0.18}" width="${W * 0.16}" height="${bh * 0.7}" rx="6" ${stroke}/>
      <rect x="${bx + bw * 0.72}" y="${by - H * 0.16}" width="${W * 0.05}" height="${H * 0.18}" ${stroke}/>
      <circle cx="${bx + bw * 0.3}" cy="${by + bh + H * 0.05}" r="${H * 0.05}" ${stroke}/>
      <circle cx="${bx + bw * 0.7}" cy="${by + bh + H * 0.05}" r="${H * 0.05}" ${stroke}/>
      <rect x="${bx - W * 0.16}" y="${by + bh + H * 0.09}" width="${bw * 0.9}" height="${H * 0.03}" ${stroke}/>`;
  }
  if (kind === 'lid') {
    const bw = W * 0.52, bh = H * 0.34, bx = cx - bw / 2, by = cy;
    return `<path d="M ${bx} ${by} A ${bw / 2} ${bh / 1.4} 0 0 1 ${bx + bw} ${by} Z" ${stroke}/>
      <rect x="${cx - W * 0.05}" y="${by - H * 0.06}" width="${W * 0.1}" height="${H * 0.04}" rx="4" ${stroke}/>`;
  }
  if (kind === 'chasha') {
    const r = Math.min(W, H) * 0.26;
    return `<path d="M ${cx - r} ${cy - r * 0.2} A ${r} ${r} 0 0 0 ${cx + r} ${cy - r * 0.2} Z" ${stroke}/>`;
  }
  if (kind === 'mangal') {
    const bw = W * 0.42, bh = H * 0.2, bx = cx - bw / 2, by = cy - bh / 2;
    return `<path d="M ${bx} ${by} L ${bx + bw} ${by} L ${bx + bw * 0.88} ${by + bh} L ${bx + bw * 0.12} ${by + bh} Z" ${stroke}/>
      <line x1="${bx + bw * 0.14}" y1="${by + bh}" x2="${bx + bw * 0.06}" y2="${by + bh + H * 0.22}" stroke="#2c2c2c" stroke-opacity="0.2" stroke-width="2"/>
      <line x1="${bx + bw * 0.86}" y1="${by + bh}" x2="${bx + bw * 0.94}" y2="${by + bh + H * 0.22}" stroke="#2c2c2c" stroke-opacity="0.2" stroke-width="2"/>`;
  }
  if (kind === 'food') {
    const bw = W * 0.5, bh = H * 0.12, bx = cx - bw / 2, by = cy + H * 0.06;
    let slices = '';
    for (let i = 0; i < 6; i++) {
      slices += `<rect x="${bx + W * 0.06 + i * (bw * 0.14)}" y="${by - H * 0.14}" width="${bw * 0.1}" height="${H * 0.12}" rx="3" fill="#b39a78" stroke="#2c2c2c" stroke-opacity="0.15"/>`;
    }
    return `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" ${stroke}/>${slices}`;
  }
  return '';
}

for (const [id, aspect, label, note, kind] of SLOTS) {
  const [aw, ah] = aspect.split('/').map(Number);
  const W = 800;
  const H = Math.round((W * ah) / aw);
  const sil = kind ? silhouette(kind, W, H) : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e8dccb"/>
      <stop offset="1" stop-color="#d0c3ae"/>
    </linearGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" filter="url(#n)" opacity="0.05"/>
  <rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="#2c2c2c" stroke-opacity="0.12" stroke-width="1.5"/>
  <rect x="10" y="10" width="46" height="4" fill="#c07f3d"/>
  ${sil}
  <text x="${W / 2}" y="${H / 2 - 6}" fill="#2c2c2c" fill-opacity="0.6" font-family="Georgia,serif" font-size="26" font-weight="600" letter-spacing="2" text-anchor="middle">${esc(label)}</text>
  <text x="${W / 2}" y="${H / 2 + 24}" fill="#7a6f60" font-family="system-ui,sans-serif" font-size="14" text-anchor="middle">${esc(note)}</text>
  <text x="${W / 2}" y="${H - 22}" fill="#978e81" fill-opacity="0.8" font-family="system-ui,sans-serif" font-size="12" text-anchor="middle">${esc(id)} · ${esc(aspect)}</text>
</svg>`;
  writeFileSync(join(OUT, `${id}.svg`), svg, 'utf8');
}

console.log(`Wrote ${SLOTS.length} placeholders to public/placeholders`);
