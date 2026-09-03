import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/content';
import { JsonLd, breadcrumbJsonLd, productListJsonLd } from '@/components/seo/JsonLd';
import { CatalogView } from '@/components/catalog/CatalogView';

type Props = { params: Promise<{ locale: Locale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, path: '/vyroby', title: t('products.title'), description: t('products.description') });
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { products } = getSiteContent(locale);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: 'Головна', path: '/' }, { name: products.title, path: '/vyroby' }])} />
      <JsonLd data={productListJsonLd(products, locale)} />
      <CatalogView data={products} />
    </>
  );
}
