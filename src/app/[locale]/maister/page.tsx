import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/content';
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd';
import { MasterView } from '@/components/master/MasterView';

type Props = { params: Promise<{ locale: Locale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, path: '/maister', title: t('master.title'), description: t('master.description') });
}

export default async function MasterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { master } = getSiteContent(locale);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: 'Головна', path: '/' }, { name: master.title, path: '/maister' }])} />
      <MasterView data={master} />
    </>
  );
}
