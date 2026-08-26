import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider, type Messages } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { localeMeta } from '@/i18n/locale-meta';
import { site } from '@/lib/site';
import { getSiteContent } from '@/lib/content';
import { playfair, manrope } from '../fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { PageTransition } from '@/components/layout/PageTransition';
import { OrderModalProvider } from '@/components/order/OrderModalContext';
import { OrderModal } from '@/components/order/OrderModal';
import { SmokeCursor } from '@/components/effects/SmokeCursor';
import { JsonLd, organizationJsonLd } from '@/components/seo/JsonLd';
import '../globals.css';

const fontVars = [playfair.variable, manrope.variable].join(' ');

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  applicationName: site.name,
  formatDetection: { telephone: false },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const meta = localeMeta[locale];
  const content = getSiteContent(locale as Locale);

  const all = await getMessages();
  const CLIENT_NS = ['nav', 'common'] as const;
  const clientMessages = Object.fromEntries(
    CLIENT_NS.filter((ns) => ns in all).map((ns) => [ns, all[ns as keyof typeof all]]),
  ) as Messages;

  return (
    <html lang={meta.lang} dir={meta.dir} className={fontVars}>
      <body className="min-h-dvh bg-parchment-200 text-onyx antialiased">
        <JsonLd data={organizationJsonLd()} />
        <NextIntlClientProvider messages={clientMessages}>
          <SmoothScroll />
          <SmokeCursor />
          <OrderModalProvider content={content.order}>
            <Header />
            <main>
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <OrderModal />
          </OrderModalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
