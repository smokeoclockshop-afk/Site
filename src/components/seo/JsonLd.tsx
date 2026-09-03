import { getPathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { absoluteUrl, site } from '@/lib/site';
import { getSlot } from '@/lib/media';
import type { SiteContent } from '@/lib/content';

/** Renders a JSON-LD script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll('</', '<\\/'),
      }}
    />
  );
}

/** Sitewide entity graph: the maker Organization + the production LocalBusiness. */
export function organizationJsonLd() {
  const org = {
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: absoluteUrl('/icon.png'),
    sameAs: [site.social.instagram, site.social.youtube],
  };

  const w = site.workshop;
  const business = {
    '@type': ['LocalBusiness', 'Store'],
    '@id': `${site.url}/#business`,
    name: site.name,
    parentOrganization: { '@id': `${site.url}/#organization` },
    url: site.url,
    image: absoluteUrl('/og-default.jpg'),
    telephone: w.phone,
    priceRange: site.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: w.street,
      addressLocality: w.city,
      addressRegion: w.region,
      postalCode: w.postalCode,
      addressCountry: w.countryCode,
    },
    geo: { '@type': 'GeoCoordinates', latitude: w.geo.lat, longitude: w.geo.lng },
    openingHours: site.hoursSchema,
  };

  return { '@context': 'https://schema.org', '@graph': [org, business] };
}

export function productJsonLd({
  name,
  description,
  price,
  image,
  path,
  locale,
}: {
  name: string;
  description: string;
  /** Price in UAH. */
  price: number;
  image: string;
  path: string;
  locale: Locale;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: absoluteUrl(image),
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'UAH',
      price,
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(getPathname({ locale, href: path })),
      seller: { '@id': `${site.url}/#organization` },
    },
  };
}

/** The catalog as an ItemList of Products; offers only where a real price exists. */
export function productListJsonLd(products: SiteContent['products'], locale: Locale) {
  const url = absoluteUrl(getPathname({ locale, href: '/vyroby' }));
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: products.title,
    numberOfItems: products.items.length,
    itemListElement: products.items.map((p, i) => {
      const digits = p.price.replace(/[^\d]/g, '');
      const price = p.onRequest || !digits ? undefined : Number(digits);
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          description: p.tagline,
          image: absoluteUrl(getSlot(p.slot).src),
          url: `${url}?p=${p.slug}`,
          brand: { '@type': 'Brand', name: site.name },
          ...(price
            ? {
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'UAH',
                  price,
                  availability: 'https://schema.org/PreOrder',
                  url: `${url}?p=${p.slug}`,
                  seller: { '@id': `${site.url}/#organization` },
                },
              }
            : {}),
        },
      };
    }),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(locale: Locale, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(getPathname({ locale, href: item.path })),
    })),
  };
}
