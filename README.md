# Amrit Palace — Website

A faithful rebuild of [amritpalace.com](https://amritpalace.com) (Indian fine-dining, Ocala &
Gainesville, FL), constructed in the **same architecture as `pikfine-website`** and styled from
the **Refero "Amrit Palace" design system** (warm parchment canvas, single saffron accent,
whisper-weight display serif, sharp editorial geometry — no shadows, no gradients).

## Stack

- **Next.js 16** (App Router, Turbopack) · React 19 · TypeScript
- **Tailwind CSS v4** (`@theme` design tokens in `src/app/globals.css`)
- **next-intl** — 4 locales: `en` (default), `ua`, `pl`, `cs`
- **motion** (Framer Motion) · **lucide-react** icons
- Fonts via `next/font/google`: **Cormorant** (display) + **Manrope** (body); **Playfair Display**
  for Ukrainian Cyrillic (Cormorant has no Cyrillic cut). These are free substitutes for the
  original's commercial TT Ramillas + Satoshi.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run optimize-images   # asset-src/** -> public/images/**.webp
```

## Structure

```
src/
  app/[locale]/            home, menu, catering, gift-cards, about, contact, legal, 404, catch-all
  app/api/lead/            contact / catering lead intake
  app/{manifest,robots,sitemap}.ts, icon.png
  components/{layout,home,menu,reserve,contact,legal,seo,ui}/
  i18n/                    routing · request · navigation · locale-meta
  lib/                     site (brand/locations) · content · menu · seo · utils
content/
  site/{en,ua,pl,cs}.json  long-form page copy
  menu/{en,ua,pl,cs}.json  the full menu
messages/{en,ua,pl,cs}.json  UI microcopy (nav, buttons, footer, meta …)
scripts/                   optimize-images.mjs · generate-assets.mjs
```

- **Brand / locations** are the single source of truth in `src/lib/site.ts`.
- **Design tokens** live in `src/app/globals.css` (`--color-parchment-*`, `--color-saffron-*`,
  `--color-onyx`, `--color-roast-*`, `.display`, `.kicker`, `.hairline`).

## Handoff notes / TODO (the "правки" phase)

1. **Photography** — every image slot currently renders an art-directed `<Placeholder>`. Drop real
   originals under `asset-src/**`, run `npm run optimize-images`, then replace `<Placeholder>` with
   `<Image src="/images/…">`. The design leads with dark, atmospheric food photography.
2. **Booking / ordering URLs** — the OpenTable and Toast links in `src/lib/site.ts`
   (`reserveUrl`, `orderUrl`, `giftCardUrl`) are best-guess slugs; confirm the real venue URLs.
3. **Content translations** — `content/site` and `content/menu` exist for `en`; `ua`/`pl`/`cs`
   currently fall back to English (chrome is already fully localized). Add the localized JSON files
   to complete the translation.
4. **Legal copy** — privacy / terms / cookie pages use generic templates; replace with real policy.
5. **Geo coordinates** for each location in `site.ts` are approximate.
6. **Lead form** — `src/app/api/lead/route.ts` validates and logs; wire it to an email/CRM provider.

Only content marked "ideal copy" so far; the base site is complete, builds clean, and is ready for
these refinements.
