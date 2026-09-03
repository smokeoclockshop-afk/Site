import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Locale } from '@/i18n/routing';

/* ─────────────────────────── Content model ───────────────────────────
   Long-form, localized page copy lives in content/site/{locale}.json.
   Structural data (products, queue, workshop) lives in lib/. All UI strings
   come from here — components never hardcode copy. */

export interface Spec {
  label: string;
  value: string;
}

export interface LadderItem {
  slot: string;
  name: string;
  /** One-line hook under the name. */
  tagline?: string;
  specs: string[];
  price: string;
  perMonth?: string;
  cta: string;
  href?: string;
  /** 'smoker' links to /smoker, 'catalog' deep-links to the product sheet in /vyroby, 'custom' opens the order modal. */
  action: 'smoker' | 'catalog' | 'custom';
  /** Catalog product slug (used by the 'catalog' action). */
  slug?: string;
  flagship?: boolean;
}

export interface ProcessStep {
  time: string;
  name: string;
  text: string;
  /** Short mono "value fact" chip, e.g. "точність 0,1 мм". */
  fact: string;
  slot: string;
}

export interface QuizStep {
  q: string;
  /** Each option is a photo tile: label + image path from public/media. */
  options: { label: string; img: string }[];
}

/** One side of the "restaurant vs your backyard" receipt duel. */
export interface EconReceipt {
  title: string;
  items: { label: string; value: string }[];
  note: string;
  totalLabel: string;
  total: number;
}

export interface ProductCategory {
  slug: string;
  label: string;
  /** One line under the group heading. */
  blurb: string;
}

/** A catalog product (cover = media slot, extra photos = paths under /public). */
export interface Product {
  slug: string;
  name: string;
  /** ProductCategory slug. */
  category: string;
  /** One-line hook shown on the card. */
  tagline: string;
  /** 2–3 sentences for the product sheet. */
  description: string;
  /** "What matters" bullets for the product sheet. */
  bullets: string[];
  /** Label/value pairs: the first three are shown on the card. */
  specs: Spec[];
  /** Human price string ("від 25 000 ₴" or "ціна за запитом"). */
  price: string;
  priceNote?: string;
  /** True when the price is on request (the CTA reads "Дізнатись ціну"). */
  onRequest?: boolean;
  badge?: string;
  /** Cover media slot (4:3 parchment tile). */
  slot: string;
  /** Extra gallery photos (paths under /public), cover excluded. */
  gallery: string[];
  /** 'smoker' also links to the /smoker page; 'order' opens the order modal. */
  action: 'smoker' | 'order';
  /** Wide, featured card at the top of its group. */
  featured?: boolean;
}

/** One smoker model on /smoker (the page switches between them). */
export interface SmokerModel {
  slug: string;
  name: string;
  /** Short name for the switcher tab. */
  short: string;
  badge?: string;
  tagline: string;
  description: string;
  forWhom: string;
  price: string;
  perMonth?: string;
  onRequest?: boolean;
  status?: string;
  cta: string;
  /** Show the add-on configurator (only models with a fixed base price). */
  configurator?: boolean;
  /** Cover media slot (4:3 parchment tile). */
  cover: string;
  /** Gallery paths under /public (cover first). */
  gallery: string[];
  specs: Spec[];
  highlights: string[];
}

/** Animated mini-scene inside a "Для бізнесу" benefit tile. */
export type BenefitScene =
  | { type: 'receipt'; title: string; lines: { label: string; value: string }[]; note: string }
  | { type: 'gauge'; from: string; to: string; marks: string[]; count: number; countLabel: string }
  | { type: 'social'; chips: { icon: 'camera' | 'heart' | 'pin' | 'users'; text: string }[] }
  | { type: 'checklist'; items: string[] };

export interface Faq {
  q: string;
  a: string;
}

export interface SiteContent {
  home: {
    hero: {
      title: string;
      utp: string[];
      cta1: string;
      cta2: string;
      tempStart: number;
      tempEnd: number;
      nowInShop: string;
      readyCaption: string;
      /** Label of the scroll-down capsule. */
      scrollHint: string;
    };
    showcase: {
      title: string;
      text: string;
      play: string;
      cta: string;
    };
    features: {
      kicker: string;
      title: string;
      hint: string;
      items: { slot: string; label: string; title: string; text: string }[];
    };
    ladder: {
      kicker: string;
      title: string;
      lead: string;
      items: LadderItem[];
      /** End card of the conveyor: link to the full catalog + custom pitch. */
      allCta: string;
      allNote: string;
      customTitle: string;
      customText: string;
      customCta: string;
    };
    process: { kicker: string; title: string; intro: string; steps: ProcessStep[] };
    dishes: {
      kicker: string;
      title: string;
      lead: string;
      open: string;
      cta: string;
      ctaNote: string;
      modalIngredients: string;
      /** Badge next to the ingredients heading: all amounts are per 1 kg of meat. */
      perKg: string;
      modalSteps: string;
      modalTip: string;
      metaTime: string;
      metaTemp: string;
      metaWood: string;
      metaYield: string;
      items: {
        slot: string;
        name: string;
        teaser: string;
        time: string;
        temp: string;
        wood: string;
        serves: string;
        ingredients: string[];
        steps: string[];
        tip: string;
      }[];
    };
    queue: {
      kicker: string;
      title: string;
      lead: string;
      boardTitle: string;
      statusDone: string;
      statusNow: string;
      statusFree: string;
      claimHint: string;
      builtLabel: string;
      queueLabel: string;
      windowLabel: string;
      cta: string;
      note: string;
      plate: string;
    };
    economics: {
      kicker: string;
      title: string;
      lead: string;
      receiptOut: EconReceipt;
      receiptHome: EconReceipt;
      stamp: string;
      stampPercent: string;
      stampPercentLabel: string;
      dishTitle: string;
      dishes: { slot: string; icon: 'ribs' | 'brisket' | 'pork' | 'wings'; name: string; out: string; home: string; factor: string }[];
      monthly: {
        title: string;
        out: { value: number; label: string };
        home: { value: number; label: string };
        percent: string;
        /** Honest split of the "home" figure — meat plus the smoker installment. */
        breakdown: { meat: string; payment: string };
        /** Why a month looks less dramatic than one evening (the installment). */
        explain: string;
        nights: number;
        nightsLabel: string;
        payback: string;
      };
      sourceNote: string;
      cta: string;
      ctaHint: string;
    };
    quiz: {
      kicker: string;
      title: string;
      stepLabel: string;
      back: string;
      steps: QuizStep[];
      resultKicker: string;
      formName: string;
      formPhone: string;
      formChannel: string;
      channels: string[];
      submit: string;
      successTitle: string;
      successBody: string;
    };
    breathers: string[];
    b2bTeaser: { kicker: string; text: string; cta: string };
    recipes: {
      kicker: string;
      title: string;
      lead: string;
      /** 11-12 slides: what a smoker can actually cook and why it beats regular cooking. */
      items: { img: string; tag: string; name: string; text: string }[];
    };
    finalCta: { title: string; cta: string; sla: string; phoneLabel: string };
  };
  products: {
    kicker: string;
    title: string;
    intro: string;
    /** Trust line under the intro ("Сталь 4 мм · Довічна гарантія · …"). */
    note: string;
    allLabel: string;
    /** Ukrainian plural forms for the item counter: ["виріб", "вироби", "виробів"]. */
    countForms: [string, string, string];
    categories: ProductCategory[];
    items: Product[];
    /** "Didn't find yours?" custom-work plate at the end of the catalog. */
    custom: { kicker: string; title: string; text: string; cta: string };
    /** Product sheet (modal) microcopy. */
    sheet: {
      close: string;
      specs: string;
      includes: string;
      order: string;
      askPrice: string;
      details: string;
      leadTime: string;
      smokerPage: string;
      prev: string;
      next: string;
      photo: string;
    };
    seoText: string;
  };
  smoker: {
    kicker: string;
    title: string;
    intro: string;
    switcherLabel: string;
    models: SmokerModel[];
    optionsTitle: string;
    /** Shown instead of the configurator for models priced on request. */
    optionsNote: string;
    summaryLabel: string;
    options: { id: string; label: string; price: number }[];
    /** Interactive hotspots over the flagship render. */
    anatomy: {
      kicker: string;
      title: string;
      /** Same call to action, phrased for touch screens. */
      titleTouch: string;
      lead: string;
      hotspots: { x: number; y: number; label: string; text: string }[];
    };
    /** Silhouette lineup of the four body shapes; `items` follow the `models` order. */
    design: { kicker: string; title: string; lead: string; pickCta: string; selectedLabel: string; items: { slug: string; note: string; detail: string }[] };
    /** Draggable strip of real-life photos. */
    work: { kicker: string; title: string; lead: string; dragHint: string; items: { src: string; alt: string; caption: string }[] };
    cookedTitle: string;
    cookedCta: string;
    cooked: { img: string; title: string; note: string }[];
    faqTitle: string;
    faq: Faq[];
    crossSellTitle: string;
    crossSell: { slot: string; name: string; from: string }[];
    warranty: string;
    finalTitle: string;
    finalCta: string;
    labels: { prev: string; next: string; close: string; open: string; specs: string; forWhom: string; highlights: string; photos: string };
  };
  master: {
    kicker: string;
    title: string;
    milestones: { year: string; fact: string }[];
    story: string[];
    counters: Spec[];
    /** "In the workshop" photo block: panorama + welding strip. */
    workshop: {
      title: string;
      lead: string;
      panoramaCaption: string;
      photos: { slot: string; caption: string }[];
    };
    signTitle: string;
    signText: string;
    /** Caption under the ambient workshop video. */
    videoCaption: string;
    stamp: string;
    cta: string;
  };
  /** "Для бізнесу" — hero, benefits, offer, lead form. */
  b2b: {
    kicker: string;
    title: string;
    lead: string;
    cta1: string;
    cta2: string;
    heroStats: { value: string; label: string }[];
    benefits: {
      kicker: string;
      title: string;
      lead: string;
      items: { title: string; text: string; stat: string; statLabel: string; points: string[]; img: string; alt: string; scene: BenefitScene }[];
    };
    offer: {
      kicker: string;
      title: string;
      lead: string;
      /** Engraved-plate text. */
      stamp: string;
      items: { title: string; text: string }[];
      why: { title: string; text: string }[];
      formats: { name: string; text: string; term: string }[];
      cta: string;
    };
    formKicker: string;
    formTitle: string;
    formLead: string;
    formSteps: string[];
    formCompany: string;
    formTask: string;
    formBudget: string;
    budgets: string[];
    submit: string;
    logosNote: string;
  };
  contact: {
    kicker: string;
    title: string;
    intro: string;
    formTitle: string;
    workshopTitle: string;
    hours: string;
    showMap: string;
  };
  order: {
    title: string;
    subtitle: string;
    name: string;
    phone: string;
    comment: string;
    channelLabel: string;
    channels: string[];
    orWrite: string;
    submit: string;
    sending: string;
    successTitle: string;
    successBody: string;
    errorText: string;
    phoneError: string;
  };
  stickyBar: { price: string; cta: string };
  common: {
    orderCta: string;
    madeInUa: string;
    installmentLine: string;
    deliveryLine: string;
    ownWorkshop: string;
  };
}

const CONTENT_DIR = join(process.cwd(), 'content');

function readJson<T>(dir: string, locale: Locale): T {
  const localized = join(CONTENT_DIR, dir, `${locale}.json`);
  const fallback = join(CONTENT_DIR, dir, 'ua.json');
  const path = existsSync(localized) ? localized : fallback;
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

const siteCache = new Map<Locale, SiteContent>();
export function getSiteContent(locale: Locale): SiteContent {
  const hit = siteCache.get(locale);
  if (hit) return hit;
  const data = readJson<SiteContent>('site', locale);
  siteCache.set(locale, data);
  return data;
}
