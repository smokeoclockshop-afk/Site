import type { MetadataRoute } from 'next';
import { getPathname } from '@/i18n/navigation';
import { localeMeta } from '@/i18n/locale-meta';
import { routing } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/site';

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/smoker', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/vyroby', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/maister', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/b2b', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/kontakty', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/cookie-policy', priority: 0.2, changeFrequency: 'yearly' },
  ];

  const now = new Date();

  return entries.map(({ path, priority, changeFrequency }) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[localeMeta[locale].lang] = absoluteUrl(getPathname({ locale, href: path }));
    }
    languages['x-default'] = absoluteUrl(
      getPathname({ locale: routing.defaultLocale, href: path }),
    );
    return {
      url: absoluteUrl(getPathname({ locale: routing.defaultLocale, href: path })),
      lastModified: now,
      changeFrequency,
      priority,
      alternates: { languages },
    };
  });
}
