/**
 * Site-wide constants. Single source of truth for brand, workshop, contacts.
 * Smoke O'Clock is a Ukrainian maker of hand-built thick-steel offset smokers.
 *
 * TODO(owner): every value marked TODO is a working placeholder — confirm the
 * real phone, messengers, workshop address, prices and counters before launch.
 */

export interface Workshop {
  slug: string;
  name: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  /** tel: href, digits only with country code. */
  phoneHref: string;
  geo: { lat: number; lng: number };
}

export const site = {
  name: "Smoke O'Clock",
  legalName: "Smoke O'Clock",
  tagline: 'Час диму',
  category: 'Виробник', // GBP category
  priceRange: '₴₴₴',
  domain: 'smoke-oclock.shop',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smoke-oclock.shop',
  founded: 2024, // TODO(owner)
  founder: 'Майстер', // TODO(owner): real name for /maister + clip stamp
  email: 'hello@smokeoclock.ua', // TODO(owner)
  /** % of every sale donated to the Armed Forces of Ukraine. TODO(owner). */
  charityPercent: 5,
  /** Google reviews — hidden until real reviews exist. */
  rating: { value: 0, count: 0, source: 'Google' },
  /** Messenger contact points. TODO(owner): confirm handles/links. */
  messengers: {
    telegram: 'https://t.me/smokeoclock', // TODO(owner)
    viber: 'viber://chat?number=%2B380663471237',
    instagram: 'https://www.instagram.com/smokeoclock', // TODO(owner)
  },
  social: {
    instagram: 'https://www.instagram.com/smokeoclock', // TODO(owner)
    youtube: 'https://www.youtube.com/@smokeoclock', // TODO(owner)
  },
  /** Single production workshop. TODO(owner): confirm real address + geo. */
  workshop: {
    slug: 'novyi-rozdil',
    name: 'Цех',
    /** No street published — the owner lists the town only. */
    street: '',
    city: 'м. Новий Розділ',
    region: 'Львівська обл.',
    postalCode: '81652',
    countryCode: 'UA',
    phone: '+380 66 347 12 37',
    phoneHref: '+380663471237',
    geo: { lat: 49.4736, lng: 24.1361 },
  } as Workshop,
  /** Live queue state — updated by hand in this file (no backend). TODO(owner). */
  queue: {
    /** Smokers welded and delivered so far. */
    built: 13,
    /** Serial number currently on the bench. */
    inProgress: 14,
    /** Free slots in the nearest production window. */
    freeSlots: 2,
    /** Nearest window, human text. */
    window: 'серпень',
  },
  /** schema.org openingHours format. */
  hoursSchema: ['Mo-Sa 09:00-19:00'],
} as const;

export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const workshop = site.workshop;
