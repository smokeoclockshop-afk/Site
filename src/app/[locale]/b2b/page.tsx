import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/content';
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd';
import { B2bView } from '@/components/b2b/B2bView';

type Props = { params: Promise<{ locale: Locale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, path: '/b2b', title: t('b2b.title'), description: t('b2b.description') });
}

export default async function B2bPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { b2b, order } = getSiteContent(locale);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: 'Головна', path: '/' }, { name: b2b.kicker, path: '/b2b' }])} />
      <B2bView data={b2b} order={order} />
    </>
  );
}
