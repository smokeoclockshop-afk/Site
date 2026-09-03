/**
 * Media slot registry — the ONLY place a component learns where an image lives.
 * Every visual on the site references a slot id; nothing hardcodes a path.
 *
 * Every slot starts as a generated SVG placeholder in /public/placeholders
 * (see scripts/gen-placeholders.mjs). Real files live in /public/media and are
 * wired in through the REAL map at the bottom of this file — components never
 * change when a photo is swapped: edit the `src` (and `videoSrc` for video
 * slots) there.
 *
 * Keep the id list in sync with scripts/gen-placeholders.mjs.
 */

export interface MediaSlot {
  src: string;
  alt: string;
  /** CSS aspect-ratio, e.g. "16/9" — reserves space, zero CLS. */
  aspect: string;
  /** What to shoot to replace it (surfaces into PLACEHOLDERS.md). */
  note: string;
  kind?: 'image' | 'video';
  /** Real video source, once supplied (video slots). */
  videoSrc?: string;
}

const P = '/placeholders';

function slot(
  id: string,
  aspect: string,
  alt: string,
  note: string,
  kind: 'image' | 'video' = 'image',
): [string, MediaSlot] {
  return [id, { src: `${P}/${id}.svg`, alt, aspect, note, kind }];
}

/** The 12 catalog products: slug → cover-slot alt text. Order = catalog order. */
export const PRODUCT_SLUGS = [
  'offset',
  'octagon',
  'universal',
  'mini',
  'valiza',
  'trikutnyk',
  'grillpich',
  'mangal-custom',
  'kazan',
  'kazan-pich',
  'shampury',
  'firetools',
] as const;

const PRODUCT_ALT: Record<(typeof PRODUCT_SLUGS)[number], string> = {
  offset: 'Класичний офсетний смокер',
  octagon: 'Восьмигранний офсетний смокер',
  universal: 'Універсальний смокер-гриль',
  mini: 'Універсальний міні',
  valiza: 'Мангал-валіза',
  trikutnyk: 'Мангал розбірний «Трикутник»',
  grillpich: 'Стаціонарний гриль-піч',
  'mangal-custom': 'Мангал-гриль з індивідуальним дизайном',
  kazan: 'Казан чавунний',
  'kazan-pich': 'Піч для казана та мангал 2в1',
  shampury: 'Шампури з індивідуальним дизайном',
  firetools: 'Аксесуари для вогнища',
};

export const MEDIA: Record<string, MediaSlot> = Object.fromEntries([
  // ── Scene 1 — Hero ──────────────────────────────────────────────
  slot('ph.hero.poster', '16/9', 'Офсетний смокер із реберцями в диму', 'Кадр відкритого смокера з м’ясом усередині, ≥1920px', 'image'),
  slot('ph.hero.video', '16/9', 'Офсетний смокер у роботі', 'Відео 8–15 с: відкритий смокер, м’ясо, дим, без звуку, 16:9', 'video'),

  // ── Scene 2 — Showcase (video card) ─────────────────────────────
  slot('ph.showcase.poster', '16/9', 'Готування на смокері', 'Постер нарізки: ребра/брискет у диму', 'image'),
  slot('ph.showcase.video', '16/9', 'Нарізка: що вміє смокер', 'Фоновий беззвучний луп 20 с із фільму', 'video'),
  slot('ph.showcase.film', '16/9', 'Фільм «Час диму»', 'Повний монтаж 1:46 зі звуком для лайтбоксу', 'video'),

  // ── Scene 3 — Anatomy (layered) ─────────────────────────────────
  slot('ph.anatomy.smokerBody', '3/2', 'Корпус смокера збоку', 'Корпус смокера збоку, темний однорідний фон, зі штатива (для накладання шарів)', 'image'),
  slot('ph.anatomy.smokerLid', '3/2', 'Відкрита кришка смокера', 'Відкрита кришка ОКРЕМИМ кадром, той самий ракурс і штатив', 'image'),
  slot('ph.anatomy.chamber', '3/2', 'Камера смокера зсередини', 'Камера зсередини з решіткою, той самий ракурс', 'image'),
  slot('ph.anatomy.brisketInside', '3/2', 'Брискет на решітці', 'Брискет на решітці всередині камери, марево жару', 'image'),
  slot('ph.anatomy.foodPlated', '3/2', 'Нарізаний брискет на дошці', 'Нарізаний брискет на дерев’яній дошці, вигляд ¾, темний фон', 'image'),
  slot('ph.anatomy.table', '3/1', 'Дерев’яна стільниця', 'Текстура дерев’яного столу / стільниці, темна', 'image'),
  slot('ph.anatomy.props', '1/1', 'Сервірування', 'Дрібний декор окремо: склянка, ніж, зелень (на прозорому/темному)', 'image'),

  // ── Scene 3 — Features scrollytelling ───────────────────────────
  slot('ph.feature.steel', '4/5', 'Жар у топці смокера', 'Вугілля/жар у смокері, макро', 'image'),
  slot('ph.feature.stable', '4/5', 'Смокер із врізним термометром у дворі', 'Смокер тримає температуру, рівний дим', 'image'),
  slot('ph.feature.thermo', '4/5', 'Термометр смокера', 'Врізний термометр у кришці, макро', 'image'),
  slot('ph.feature.space', '4/5', 'Решітка з нержавійки з м’ясом', 'Решітка з нержавіючої сталі, м’ясо готується', 'image'),
  slot('ph.feature.handles', '4/5', 'Дубова ручка кришки', 'Рука відкриває кришку за дерев’яну ручку', 'image'),
  slot('ph.feature.wheels', '4/5', 'Смокер збирають на березі озера', 'Відео: смокер збирається за хвилини без інструменту', 'video'),
  slot('ph.feature.paint', '4/5', 'Термофарба корпусу', 'Корпус у жарі — фарба тримає', 'image'),
  slot('ph.feature.warranty', '4/5', 'Майстер варить корпус', 'Зварювання корпусу — довічна гарантія', 'image'),
  slot('ph.feature.serial', '4/5', 'Гравіювання серійного номера', 'Серійний номер гравіюється на табличці', 'image'),
  slot('ph.feature.engrave', '4/5', 'Гравіювання іменної таблички на верстаті', 'Табличка з ім’ям / логотипом під гравером', 'image'),

  // ── Dishes scrollytelling (recipes) ─────────────────────────────
  slot('ph.dish.1', '4/5', 'Брискет по-техаськи', 'Нарізаний брискет крупно, соковитий зріз', 'image'),
  slot('ph.dish.2', '4/5', 'Реберця в смокері', 'Реберця в глазурі на решітці', 'image'),
  slot('ph.dish.3', '4/5', 'Пулд-порк', 'Розібране мясо / лопатка в руках', 'image'),
  slot('ph.dish.4', '4/5', 'Курка в димі', 'Копчена курка з хрусткою шкіркою', 'image'),
  slot('ph.dish.5', '4/5', 'Риба й морепродукти', 'Скумбрія / креветки з диму', 'image'),

  // ── Scene 4 — Product ladder + catalog covers (4:3, parchment tile) ──
  ...PRODUCT_SLUGS.map((s) => slot(`ph.product.${s}`, '4/3', PRODUCT_ALT[s], 'Предметне фото виробу на світлому фоні', 'image')),
  // legacy aliases kept for older references
  slot('ph.product.smoker', '4/3', 'Класичний офсетний смокер', 'Флагман-смокер, предметне фото', 'image'),
  slot('ph.product.chasha', '4/3', 'Мангал розбірний «Трикутник»', 'Предметне фото', 'image'),
  slot('ph.product.mangal', '4/3', 'Мангал-валіза', 'Предметне фото', 'image'),
  slot('ph.product.custom', '4/3', 'Шампури з індивідуальним дизайном', 'Приклад кастомного виробу / гравіювання', 'image'),

  // ── Scene 5 — One day in the workshop (8 stages) ────────────────
  slot('ph.process.0730', '4/3', 'Креслення смокера на моніторі', '07:30 — креслення/розкрій', 'image'),
  slot('ph.process.0800', '4/3', 'Лазерна головка ріже лист сталі', '08:00 — лазерна різка', 'image'),
  slot('ph.process.1030', '4/3', 'Майстер катає обичайку на вальцях', '10:30 — вальці, згортання циліндра', 'image'),
  slot('ph.process.1300', '4/3', 'Майстер варить корпус топки, іскри', '13:00 — зварювання корпусу', 'image'),
  slot('ph.process.1530', '4/3', 'Жар у відкритій топці смокера', '15:30 — топка з вогнем, тяга', 'image'),
  slot('ph.process.1700', '4/3', 'Шліфування обичайки, сніп іскор', '17:00 — шліфування швів', 'image'),
  slot('ph.process.1830', '4/3', 'Термофарбування корпусу', '18:30 — фарбувальна камера', 'image'),
  slot('ph.process.2000', '4/3', 'Відкритий смокер із м’ясом на решітці', '20:00 — перший розпал, м’ясо', 'image'),

  // ── Recipe teasers ──────────────────────────────────────────────
  slot('ph.recipe.1', '16/9', 'Рецепт: брискет', 'Обкладинка відео рецепту (брискет)', 'image'),
  slot('ph.recipe.2', '16/9', 'Рецепт: реберця', 'Обкладинка відео рецепту (реберця)', 'image'),
  slot('ph.recipe.3', '16/9', 'Рецепт: коптильня', 'Обкладинка відео рецепту (різдвяне копчення)', 'image'),

  // ── /smoker — flagship gallery ──────────────────────────────────
  slot('ph.smoker.g01', '4/3', 'Смокер 530 — загальний вигляд', 'Флагман, головний кадр', 'image'),
  slot('ph.smoker.g02', '4/3', 'Смокер 530 — жар у топці', 'Фаєрбокс / топка', 'image'),
  slot('ph.smoker.g03', '4/3', 'Смокер 530 — вигляд збоку', 'Врізний термометр у кришці', 'image'),
  slot('ph.smoker.g04', '4/3', 'Смокер 530 — у дворі', 'Колеса та ніжки', 'image'),
  slot('ph.smoker.g05', '4/3', 'Смокер 530 — ручки й термометр', 'Дерев’яні ручки', 'image'),
  slot('ph.smoker.g06', '4/3', 'Смокер 530 — зварювання корпусу', 'Макро зварного шва', 'image'),
  slot('ph.smoker.g07', '4/3', 'Смокер 530 — м’ясо на решітці', 'Решітки / робоча площа', 'image'),
  slot('ph.smoker.g08', '4/3', 'Смокер 530 — димар', 'Димар', 'image'),
  slot('ph.smoker.g09', '4/3', 'Смокер 530 — у роботі вночі', 'У роботі з димом', 'image'),
  slot('ph.smoker.g10', '4/3', 'Смокер 530 — серійний номер', 'Серійна табличка / клеймо', 'image'),
  slot('ph.smoker.g11', '4/3', 'Смокер 530 — топка збоку', 'Деталь конструкції', 'image'),
  slot('ph.smoker.g12', '4/3', 'Смокер 530 — вигляд спереду', 'Вигляд ззаду', 'image'),
  slot('ph.smoker.video', '16/9', 'Смокер 530 — відео', 'Відео 60–90 с огляду флагмана', 'video'),

  // ── /maister ────────────────────────────────────────────────────
  slot('ph.master.portrait', '3/4', 'Майстер готує на смокері біля озера', 'Портрет майстра', 'image'),
  slot('ph.master.hello', '3/4', 'Майстер біля смокера вітається', 'Другий портрет майстра', 'image'),
  slot('ph.master.workshop', '21/9', 'Лазерний стіл у цеху', 'Цех загальним планом, панорамний кадр', 'image'),
  slot('ph.master.weldMacro', '1/1', 'Іскри зварювання', 'Макро зварного шва — «підпис майстра»', 'image'),
  slot('ph.master.weldVideo', '16/9', 'Майстер зачищає шви фаєрбокса', 'Відео: шліфування швів, іскри', 'video'),
  slot('ph.master.stage.1', '4/5', 'Вальцювання обичайки', 'Етап: вальці', 'image'),
  slot('ph.master.stage.2', '4/5', 'Зварювання: спалах дуги', 'Етап: зварювання', 'image'),
  slot('ph.master.stage.3', '4/5', 'Шліфування корпусу, іскри', 'Етап: зачистка', 'image'),
  slot('ph.master.stage.4', '4/5', 'Термофарбування корпусу', 'Етап: фарбування', 'image'),

  // ── /b2b ────────────────────────────────────────────────────────
  slot('ph.b2b.horeca', '4/3', 'HoReCa-смокер', 'Підсилений смокер для закладу / кейс', 'image'),
  slot('ph.b2b.glamping', '4/3', 'Смокер-гриль на природі', 'Фаєрпіт / смокер у глемпінгу', 'image'),
  slot('ph.b2b.gifts', '4/3', 'Шампури з гравіюванням', 'Іменні вироби з гравіюванням', 'image'),

  // ── /kontakty ───────────────────────────────────────────────────
  slot('ph.contact.workshop', '16/9', 'Наш цех: лазерний стіл і зварювальна дільниця', 'Фото цеху загальним планом', 'image'),
  slot('ph.contact.map', '16/9', 'Мапа проїзду', 'Статичний знімок мапи проїзду', 'image'),

  // ── SEO ─────────────────────────────────────────────────────────
  slot('ph.og.default', '1200/630', "Smoke O'Clock", 'OG-обкладинка: wordmark на вугіллі, 1200×630 JPG', 'image'),
]);

/* ── Real media ─────────────────────────────────────────────────────────
   Owner's footage (workshop, products, master) processed into /public/media
   (webp ≤1600px, H.264 mp4 ≤1080p, muted). A handful of slots still carry
   temporary Pexels stock (free license) where no owner shot exists yet —
   see PLACEHOLDERS.md for the list. To swap anything: drop the file into
   /public/media and change the path here. */
const REAL: Record<string, Partial<MediaSlot>> = {
  // hero: the owner's clip (blurred cut, made for text overlay)
  'ph.hero.poster': { src: '/media/hero-offset-blur.jpg' },
  'ph.hero.video': { videoSrc: '/media/hero-offset-blur.mp4' },

  // showcase — stock, unchanged by request
  'ph.showcase.poster': { src: '/media/showcase-poster-v3.jpg' },
  'ph.showcase.video': { videoSrc: '/media/showcase-loop-v3.mp4' }, // muted 20 s loop cut from the film
  'ph.showcase.film': { videoSrc: '/media/showcase-film-v3.mp4' }, // full 1:46 film with music (lightbox)

  // recipes (stock food photography until the owner's dish shots arrive)
  'ph.dish.1': { src: '/media/brisket-board.jpg' },
  'ph.dish.2': { src: '/media/dish-ribs.webp' },
  'ph.dish.3': { src: '/media/brisket-hands.jpg' },
  'ph.dish.4': { src: '/media/brisket-chicken-board.jpg' },
  'ph.dish.5': { src: '/media/skewers-mix.jpg' },

  // features — owner's shots
  'ph.feature.steel': { src: '/media/feature-steel.webp' },
  'ph.feature.stable': { src: '/media/feature-stable.webp' },
  'ph.feature.thermo': { src: '/media/meat-smoky-grill.jpg' },
  'ph.feature.space': { src: '/media/feature-grates.webp' },
  'ph.feature.handles': { src: '/media/smoker-rustic.jpg' },
  'ph.feature.wheels': { src: '/media/feature-modular.jpg', videoSrc: '/media/feature-modular.mp4', kind: 'video' },
  'ph.feature.paint': { src: '/media/process-1830.webp' },
  'ph.feature.warranty': { src: '/media/feature-warranty.webp' },
  'ph.feature.serial': { src: '/media/feature-serial.webp' },
  'ph.feature.engrave': { src: '/media/feature-engrave-v2.webp' },

  // products — covers (4:3 parchment tiles)
  ...Object.fromEntries(PRODUCT_SLUGS.map((s) => [`ph.product.${s}`, { src: `/media/products/${s}-1.webp` }])),
  'ph.product.smoker': { src: '/media/products/offset-1.webp' },
  'ph.product.chasha': { src: '/media/products/trikutnyk-1.webp' },
  'ph.product.mangal': { src: '/media/products/valiza-1.webp' },
  'ph.product.custom': { src: '/media/products/shampury-1.webp' },

  // process — owner's shots
  'ph.process.0730': { src: '/media/process-0730.webp' },
  'ph.process.0800': { src: '/media/process-0800-v2.webp' },
  'ph.process.1030': { src: '/media/process-1030-v2.webp' },
  'ph.process.1300': { src: '/media/process-1300-v2.webp' },
  'ph.process.1530': { src: '/media/process-1530-v2.webp' },
  'ph.process.1700': { src: '/media/process-1700-v2.webp' },
  'ph.process.1830': { src: '/media/process-1830.webp' },
  'ph.process.2000': { src: '/media/process-2000-v2.webp' },

  'ph.recipe.1': { src: '/media/brisket-chef.jpg' },
  'ph.recipe.2': { src: '/media/ribs-grill.jpg' },
  'ph.recipe.3': { src: '/media/meat-smoky-grill.jpg' },

  // /smoker gallery — owner's flagship shots
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return [`ph.smoker.g${n}`, { src: n === '07' ? '/media/smoker-offset-meat.webp' : `/media/smoker-g${n}.webp` }];
    }),
  ),

  // /maister
  'ph.master.portrait': { src: '/media/master-portrait.webp' },
  'ph.master.hello': { src: '/media/master-hello.webp' },
  'ph.master.workshop': { src: '/media/master-workshop.webp' },
  'ph.master.weldMacro': { src: '/media/master-weld-1.webp' },
  'ph.master.weldVideo': { src: '/media/master-grind.jpg', videoSrc: '/media/master-grind.mp4' },
  'ph.master.stage.1': { src: '/media/master-stage-1.webp' },
  'ph.master.stage.2': { src: '/media/master-stage-2.webp' },
  'ph.master.stage.3': { src: '/media/master-stage-3.webp' },
  'ph.master.stage.4': { src: '/media/master-stage-4.webp' },

  // /b2b
  'ph.b2b.horeca': { src: '/media/pig-roast-chef.jpg' },
  'ph.b2b.glamping': { src: '/media/b2b-glamping.webp' },
  'ph.b2b.gifts': { src: '/media/products/shampury-1.webp' },

  // /kontakty
  'ph.contact.workshop': { src: '/media/contact-workshop-v2.webp' },
};
for (const [id, patch] of Object.entries(REAL)) {
  const m = MEDIA[id];
  if (m) Object.assign(m, patch);
}

/** True once a real asset has been wired in (not a generated placeholder). */
export function isRealMedia(id: string): boolean {
  const m = MEDIA[id];
  return !!m && !m.src.includes('/placeholders/');
}

export function getSlot(id: string): MediaSlot {
  const m = MEDIA[id];
  if (!m) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[media] unknown slot: ${id}`);
    }
    return { src: `${P}/ph.hero.poster.svg`, alt: '', aspect: '16/9', note: '' };
  }
  return m;
}
