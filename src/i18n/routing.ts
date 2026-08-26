import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Launch locale is Ukrainian at the domain root. EN/PL/CS message + content
  // files are kept on disk for the export phase but are not routed yet.
  locales: ['ua'],
  defaultLocale: 'ua',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
