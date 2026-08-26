import type { Locale } from './routing';

/** Per-locale metadata: BCP-47 codes for SEO, text direction, native names. */
export const localeMeta: Record<
  Locale,
  {
    /** Correct hreflang / html lang value (ISO 639-1). */
    lang: string;
    /** Open Graph locale. */
    ogLocale: string;
    dir: 'ltr' | 'rtl';
    /** Native language name for the switcher. */
    nativeName: string;
    /** Short label for compact switcher. */
    short: string;
  }
> = {
  ua: { lang: 'uk', ogLocale: 'uk_UA', dir: 'ltr', nativeName: 'Українська', short: 'UA' },
};
