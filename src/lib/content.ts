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

export interface Review {
  name: string;
  serial: string;
  stars: number;
  text: string;
  /** Placeholder review — rendered with an "example" note until real ones land. */
  isExample?: boolean;
}

export interface LadderItem {
  slot: string;
  name: string;
  specs: string[];
  price: string;
  perMonth?: string;
  cta: string;
  href?: string;
  /** 'smoker' links to /smoker, 'catalog' opens the order modal, 'custom' too. */
  action: 'smoker' | 'catalog' | 'custom';
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

export interface ProductCard {
  slot: string;
  name: string;
  from: string;
  badge?: string;
  action: 'smoker' | 'catalog';
  slug?: string;
}

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
    ladder: { kicker: string; title: string; items: LadderItem[] };
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
    reviews: { kicker: string; title: string; items: Review[]; moreCta: string; exampleNote: string };
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
      dishes: { slot: string; name: string; out: string; home: string; factor: string }[];
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
    b2bTeaser: { text: string; cta: string };
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
    tabs: { slug: string; label: string }[];
    filterLabel: string;
    items: (ProductCard & { tab: string })[];
    seoText: string;
  };
  smoker: {
    name: string;
    tagline: string;
    price: string;
    perMonth: string;
    status: string;
    cta: string;
    galleryCount: number;
    options: { id: string; label: string; price: number }[];
    optionsTitle: string;
    summaryLabel: string;
    specs: Spec[];
    specsTitle: string;
    cookedTitle: string;
    cooked: { slot: string; title: string; href: string }[];
    faqTitle: string;
    faq: Faq[];
    crossSellTitle: string;
    crossSell: { slot: string; name: string; from: string }[];
    warranty: string;
    finalTitle: string;
    finalCta: string;
  };
  master: {
    kicker: string;
    title: string;
    milestones: { year: string; fact: string }[];
    story: string[];
    counters: Spec[];
    signTitle: string;
    signText: string;
    stamp: string;
    cta: string;
  };
  b2b: {
    kicker: string;
    title: string;
    intro: string;
    packages: { slot: string; name: string; includes: string[]; term: string; cta: string }[];
    formTitle: string;
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
    charityLine: string;
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
