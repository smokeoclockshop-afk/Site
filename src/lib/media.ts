/**
 * Media slot registry — the ONLY place a component learns where an image lives.
 * Every visual on the site references a slot id; nothing hardcodes a path.
 *
 * Right now every `src` points to a generated SVG placeholder in
 * /public/placeholders (see scripts/gen-placeholders.mjs). When the owner
 * supplies real photography/video, drop files in /public/media and edit the
 * `src` (and add `videoSrc` for video slots) here — components don't change.
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

export const MEDIA: Record<string, MediaSlot> = Object.fromEntries([
  // ── Scene 1 — Hero ──────────────────────────────────────────────
  slot('ph.hero.poster', '16/9', 'Відкритий смокер із м’ясом', 'Кадр відкритого смокера з м’ясом усередині, ≥1920px', 'image'),
  slot('ph.hero.video', '16/9', 'Відкритий смокер у роботі', 'Відео 8–15 с: відкритий смокер, м’ясо, дим, без звуку, 16:9', 'video'),

  // ── Scene 2 — Showcase (video card) ─────────────────────────────
  slot('ph.showcase.poster', '16/9', 'Готування на смокері', 'Постер нарізки: ребра/брискет у диму', 'image'),
  slot('ph.showcase.video', '16/9', 'Нарізка: що вміє смокер', 'Монтаж 15–25 с: готується → результат → люди смакують', 'video'),

  // ── Scene 3 — Anatomy (layered) ─────────────────────────────────
  slot('ph.anatomy.smokerBody', '3/2', 'Корпус смокера збоку', 'Корпус смокера збоку, темний однорідний фон, зі штатива (для накладання шарів)', 'image'),
  slot('ph.anatomy.smokerLid', '3/2', 'Відкрита кришка смокера', 'Відкрита кришка ОКРЕМИМ кадром, той самий ракурс і штатив', 'image'),
  slot('ph.anatomy.chamber', '3/2', 'Камера смокера зсередини', 'Камера зсередини з решіткою, той самий ракурс', 'image'),
  slot('ph.anatomy.brisketInside', '3/2', 'Брискет на решітці', 'Брискет на решітці всередині камери, марево жару', 'image'),
  slot('ph.anatomy.foodPlated', '3/2', 'Нарізаний брискет на дошці', 'Нарізаний брискет на дерев’яній дошці, вигляд ¾, темний фон', 'image'),
  slot('ph.anatomy.table', '3/1', 'Дерев’яна стільниця', 'Текстура дерев’яного столу / стільниці, темна', 'image'),
  slot('ph.anatomy.props', '1/1', 'Сервірування', 'Дрібний декор окремо: склянка, ніж, зелень (на прозорому/темному)', 'image'),

  // ── Scene 3 — Features scrollytelling ───────────────────────────
  slot('ph.feature.steel', '4/5', 'Жар у камері смокера', 'Вугілля/жар у смокері, макро', 'image'),
  slot('ph.feature.stable', '4/5', 'Рівний дим над смокером', 'Смокер тримає температуру, рівний дим', 'image'),
  slot('ph.feature.thermo', '4/5', 'Термометр смокера', 'Врізний термометр у кришці, макро', 'image'),
  slot('ph.feature.space', '4/5', 'Повна решітка м’яса', 'Повна камера: брискет + реберця', 'image'),
  slot('ph.feature.handles', '4/5', 'Дубова ручка кришки', 'Рука відкриває кришку за дерев’яну ручку', 'image'),
  slot('ph.feature.wheels', '4/5', 'Смокер на колесах', 'Смокер котять по подвір’ю', 'image'),
  slot('ph.feature.paint', '4/5', 'Термофарба корпусу', 'Корпус у жарі — фарба тримає', 'image'),
  slot('ph.feature.warranty', '4/5', 'Зварний шов', 'Шов крупним планом — довічна гарантія', 'image'),
  slot('ph.feature.serial', '4/5', 'Клеймо майстра', 'Майстер біля виробу / серійна табличка', 'image'),
  slot('ph.feature.engrave', '4/5', 'Іменне гравіювання', 'Гравійована табличка / шампури з іменем', 'image'),

  // ── Dishes scrollytelling (recipes) ─────────────────────────────
  slot('ph.dish.1', '4/5', 'Брискет по-техаськи', 'Нарізаний брискет крупно, соковитий зріз', 'image'),
  slot('ph.dish.2', '4/5', 'Реберця 3-2-1', 'Реберця в глазурі на решітці', 'image'),
  slot('ph.dish.3', '4/5', 'Пулд-порк', 'Розібране мясо / лопатка в руках', 'image'),
  slot('ph.dish.4', '4/5', 'Курка в димі', 'Копчена курка з хрусткою шкіркою', 'image'),
  slot('ph.dish.5', '4/5', 'Риба й морепродукти', 'Скумбрія / креветки з диму', 'image'),

  // ── Scene 4 — Product ladder + catalog ──────────────────────────
  slot('ph.product.smoker', '4/3', 'Офсетний смокер 530', 'Флагман-смокер на темному фоні, предметне фото', 'image'),
  slot('ph.product.chasha', '4/3', 'Чаша для вогнища', 'Чаша для вогнища на темному фоні', 'image'),
  slot('ph.product.mangal', '4/3', 'Розбірний мангал', 'Мангал-валіза на темному фоні', 'image'),
  slot('ph.product.custom', '4/3', 'Кастомний виріб', 'Приклад кастомного виробу / гравіювання', 'image'),

  // ── Scene 5 — One day in the workshop (8 stages) ────────────────
  slot('ph.process.0730', '4/3', 'Креслення і розкрій', '07:30 — креслення/розкрій, цех загальним планом', 'image'),
  slot('ph.process.0800', '4/3', 'Лазерна різка', '08:00 — лазерна різка, іскри', 'image'),
  slot('ph.process.1030', '4/3', 'Вальцювання обичайки', '10:30 — вальці, згортання циліндра', 'image'),
  slot('ph.process.1300', '4/3', 'Зварювання корпусу', '13:00 — зварювання швів, крупний план', 'image'),
  slot('ph.process.1530', '4/3', 'Фаєрбокс і тяга', '15:30 — топка/димар у роботі', 'image'),
  slot('ph.process.1700', '4/3', 'Зачистка і шліфування', '17:00 — шліфування швів, іскри', 'image'),
  slot('ph.process.1830', '4/3', 'Термофарбування', '18:30 — пофарбований корпус', 'image'),
  slot('ph.process.2000', '4/3', 'Перший розпал', '20:00 — вогневий тест, клеймо', 'image'),

  // ── Scene 7 — Social proof ──────────────────────────────────────
  slot('ph.review.1', '1/1', 'Відгук клієнта', 'Фото готового м’яса / виробу від клієнта', 'image'),
  slot('ph.review.2', '1/1', 'Відгук клієнта', 'Фото готового м’яса / виробу від клієнта', 'image'),
  slot('ph.review.3', '1/1', 'Відгук клієнта', 'Фото готового м’яса / виробу від клієнта', 'image'),
  slot('ph.review.4', '1/1', 'Відгук клієнта', 'Фото готового м’яса / виробу від клієнта', 'image'),
  slot('ph.review.5', '1/1', 'Відгук клієнта', 'Фото готового м’яса / виробу від клієнта', 'image'),
  slot('ph.review.6', '1/1', 'Відгук клієнта', 'Фото готового м’яса / виробу від клієнта', 'image'),

  // ── Recipe teasers ──────────────────────────────────────────────
  slot('ph.recipe.1', '16/9', 'Рецепт: брискет', 'Обкладинка відео рецепту (брискет)', 'image'),
  slot('ph.recipe.2', '16/9', 'Рецепт: реберця', 'Обкладинка відео рецепту (реберця)', 'image'),
  slot('ph.recipe.3', '16/9', 'Рецепт: коптильня', 'Обкладинка відео рецепту (різдвяне копчення)', 'image'),

  // ── /smoker — flagship gallery ──────────────────────────────────
  slot('ph.smoker.g01', '4/3', 'Смокер 530 — загальний вигляд', 'Флагман, головний кадр', 'image'),
  slot('ph.smoker.g02', '4/3', 'Смокер 530 — топка', 'Фаєрбокс / топка', 'image'),
  slot('ph.smoker.g03', '4/3', 'Смокер 530 — термометр', 'Врізний термометр у кришці', 'image'),
  slot('ph.smoker.g04', '4/3', 'Смокер 530 — колеса', 'Колеса та ніжки', 'image'),
  slot('ph.smoker.g05', '4/3', 'Смокер 530 — ручки', 'Дерев’яні ручки', 'image'),
  slot('ph.smoker.g06', '4/3', 'Смокер 530 — зварний шов', 'Макро зварного шва', 'image'),
  slot('ph.smoker.g07', '4/3', 'Смокер 530 — решітки', 'Решітки / робоча площа', 'image'),
  slot('ph.smoker.g08', '4/3', 'Смокер 530 — димар', 'Димар', 'image'),
  slot('ph.smoker.g09', '4/3', 'Смокер 530 — у роботі', 'У роботі з димом', 'image'),
  slot('ph.smoker.g10', '4/3', 'Смокер 530 — серійна табличка', 'Серійна табличка / клеймо', 'image'),
  slot('ph.smoker.g11', '4/3', 'Смокер 530 — деталь', 'Деталь конструкції', 'image'),
  slot('ph.smoker.g12', '4/3', 'Смокер 530 — ззаду', 'Вигляд ззаду', 'image'),
  slot('ph.smoker.video', '16/9', 'Смокер 530 — відео', 'Відео 60–90 с огляду флагмана', 'video'),

  // ── /maister ────────────────────────────────────────────────────
  slot('ph.master.portrait', '3/4', 'Портрет майстра', 'Портрет майстра, паралакс, темний фон', 'image'),
  slot('ph.master.workshop', '21/9', 'Цех', 'Цех загальним планом, панорамний кадр', 'image'),
  slot('ph.master.weldMacro', '1/1', 'Макро зварного шва', 'Макро зварного шва — «підпис майстра»', 'image'),

  // ── /b2b ────────────────────────────────────────────────────────
  slot('ph.b2b.horeca', '4/3', 'HoReCa-смокер', 'Підсилений смокер для закладу / кейс', 'image'),
  slot('ph.b2b.glamping', '4/3', 'Смокер для глемпінгу', 'Фаєрпіт / смокер у глемпінгу', 'image'),
  slot('ph.b2b.gifts', '4/3', 'Корпоративні подарунки', 'Іменні вироби з гравіюванням', 'image'),

  // ── /kontakty ───────────────────────────────────────────────────
  slot('ph.contact.workshop', '16/9', 'Наш цех', 'Фото цеху зовні / вивіска', 'image'),
  slot('ph.contact.map', '16/9', 'Мапа проїзду', 'Статичний знімок мапи проїзду', 'image'),

  // ── SEO ─────────────────────────────────────────────────────────
  slot('ph.og.default', '1200/630', "Smoke O'Clock", 'OG-обкладинка: wordmark на вугіллі, 1200×630 JPG', 'image'),
]);

/* ── Temporary stock media (Pexels, free license) ──────────────────────
   Downloaded into /public/media so the site reads as "alive" before the
   owner's real workshop footage arrives. Replacing with real material =
   drop files into /public/media and adjust the paths below (see
   PLACEHOLDERS.md). The anatomy-scene layers intentionally stay as
   blueprint silhouettes — that scene is built from stacked cut-out layers. */
const STOCK: Record<string, { src?: string; videoSrc?: string }> = {
  'ph.hero.poster': { src: '/media/hero-open-smoker.jpg' },
  'ph.hero.video': { videoSrc: '/media/hero-open-smoker.mp4' },

  'ph.showcase.poster': { src: '/media/showcase-poster.jpg' },
  'ph.showcase.video': { videoSrc: '/media/showcase.mp4' },

  'ph.dish.1': { src: '/media/brisket-board.jpg' },
  'ph.dish.2': { src: '/media/ribs-smoking.jpg' },
  'ph.dish.3': { src: '/media/brisket-hands.jpg' },
  'ph.dish.4': { src: '/media/brisket-chicken-board.jpg' },
  'ph.dish.5': { src: '/media/skewers-mix.jpg' },

  'ph.feature.steel': { src: '/media/grill-burning.jpg' },
  'ph.feature.stable': { src: '/media/steam-bbq.jpg' },
  'ph.feature.thermo': { src: '/media/meat-smoky-grill.jpg' },
  'ph.feature.space': { src: '/media/ribs-smoking.jpg' },
  'ph.feature.handles': { src: '/media/smoker-rustic.jpg' },
  'ph.feature.wheels': { src: '/media/grill-yard.jpg' },
  'ph.feature.paint': { src: '/media/grill-flames.jpg' },
  'ph.feature.warranty': { src: '/media/weld-sparks-close.jpg' },
  'ph.feature.serial': { src: '/media/weld-dark-portrait.jpg' },
  'ph.feature.engrave': { src: '/media/skewers-mix.jpg' },

  'ph.product.smoker': { src: '/media/smoker-rustic.jpg' },
  'ph.product.chasha': { src: '/media/firepit-metal.jpg' },
  'ph.product.mangal': { src: '/media/grill-flames.jpg' },
  'ph.product.custom': { src: '/media/weld-sparks-close.jpg' },

  'ph.process.0730': { src: '/media/weld-workshop-wide.jpg' },
  'ph.process.0800': { src: '/media/weld-action.jpg' },
  'ph.process.1030': { src: '/media/weld-shop.jpg' },
  'ph.process.1300': { src: '/media/weld-hands.jpg' },
  'ph.process.1530': { src: '/media/weld-worker.jpg' },
  'ph.process.1700': { src: '/media/weld-night-beams.jpg' },
  'ph.process.1830': { src: '/media/smoker-rustic.jpg' },
  'ph.process.2000': { src: '/media/grill-burning.jpg' },

  'ph.review.1': { src: '/media/brisket-board.jpg' },
  'ph.review.2': { src: '/media/ribs-tongs.jpg' },
  'ph.review.3': { src: '/media/brisket-hands.jpg' },
  'ph.review.4': { src: '/media/ribs-smoking.jpg' },
  'ph.review.5': { src: '/media/brisket-chicken-board.jpg' },
  'ph.review.6': { src: '/media/brisket-slicing.jpg' },

  'ph.recipe.1': { src: '/media/brisket-chef.jpg' },
  'ph.recipe.2': { src: '/media/ribs-grill.jpg' },
  'ph.recipe.3': { src: '/media/meat-smoky-grill.jpg' },

  'ph.smoker.g01': { src: '/media/smoker-rustic.jpg' },
  'ph.smoker.g02': { src: '/media/grill-flames.jpg' },
  'ph.smoker.g03': { src: '/media/steam-bbq.jpg' },
  'ph.smoker.g04': { src: '/media/grill-yard.jpg' },
  'ph.smoker.g05': { src: '/media/weld-hands.jpg' },
  'ph.smoker.g06': { src: '/media/weld-sparks-close.jpg' },
  'ph.smoker.g07': { src: '/media/meat-strips-smoke.jpg' },
  'ph.smoker.g08': { src: '/media/ribs-smoke-dark.jpg' },
  'ph.smoker.g09': { src: '/media/meat-cooked.jpg' },
  'ph.smoker.g10': { src: '/media/grill-burning.jpg' },
  'ph.smoker.g11': { src: '/media/skewers-mix.jpg' },
  'ph.smoker.g12': { src: '/media/hero-smoke.jpg' },

  'ph.master.portrait': { src: '/media/weld-dark-portrait.jpg' },
  'ph.master.workshop': { src: '/media/weld-workshop-wide.jpg' },
  'ph.master.weldMacro': { src: '/media/weld-worker.jpg' },

  'ph.b2b.horeca': { src: '/media/pig-roast-chef.jpg' },
  'ph.b2b.glamping': { src: '/media/firepit-night.jpg' },
  'ph.b2b.gifts': { src: '/media/skewers-mix.jpg' },

  'ph.contact.workshop': { src: '/media/weld-night-beams.jpg' },
};
for (const [id, patch] of Object.entries(STOCK)) {
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
