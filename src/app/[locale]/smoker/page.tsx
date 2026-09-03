import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/content';
import { getSlot } from '@/lib/media';
import { JsonLd, productJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd';
import { SmokerView } from '@/components/smoker/SmokerView';

type Props = { params: Promise<{ locale: Locale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, path: '/smoker', title: t('smoker.title'), description: t('smoker.description') });
}

export default async function SmokerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { smoker, stickyBar } = getSiteContent(locale);
  const flagship = smoker.models[0];
  const price = Number(flagship.price.replace(/\D/g, '')) || 0;

  return (
    <>
      {price > 0 && (
        <JsonLd data={productJsonLd({ name: flagship.name, description: flagship.tagline, price, image: getSlot(flagship.cover).src, path: '/smoker', locale })} />
      )}
      <JsonLd data={faqJsonLd(smoker.faq)} />
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: 'Головна', path: '/' }, { name: smoker.kicker, path: '/smoker' }])} />
      <SmokerView data={smoker} stickyBar={stickyBar} />
    </>
  );
}
