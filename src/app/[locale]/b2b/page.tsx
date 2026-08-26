import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check } from 'lucide-react';
import { routing, type Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Slot } from '@/components/ui/Slot';
import { Reveal } from '@/components/ui/Reveal';
import { OrderButton } from '@/components/order/OrderButton';
import { LeadForm } from '@/components/forms/LeadForm';
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd';

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
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: 'Головна', path: '/' }, { name: b2b.title, path: '/b2b' }])} />
      <section className="pt-[calc(var(--header-h)+3rem)] pb-16">
        <Container>
          <p className="kicker">{b2b.kicker}</p>
          <h1 className="display struck mt-3 text-[clamp(2.5rem,6vw,4.5rem)] text-smoke-50">{b2b.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-smoke-300">{b2b.intro}</p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {b2b.packages.map((p) => (
              <Reveal key={p.name} className="grain relative flex flex-col border border-[color:rgb(44_44_44/0.12)] bg-coal-800">
                <Slot id={p.slot} className="relative z-10" />
                <div className="relative z-10 flex flex-1 flex-col p-6">
                  <h2 className="display text-2xl text-smoke-50">{p.name}</h2>
                  <ul className="mt-4 space-y-2">
                    {p.includes.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-sm text-smoke-300">
                        <Check className="mt-0.5 size-4 shrink-0 text-ember-500" aria-hidden />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex-1" />
                  <p className="spec text-ash-500">{p.term}</p>
                  <div className="mt-4">
                    <OrderButton source={`b2b:${p.name}`} payload={{ product: p.name }} variant="ghost" className="w-full">
                      {p.cta}
                    </OrderButton>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-coal-900 py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 className="display text-2xl text-smoke-50">{b2b.formTitle}</h2>
            <div className="mt-6">
              <LeadForm source="b2b" order={order} b2b={b2b} />
            </div>
          </div>
          <p className="mt-14 text-center text-sm text-ash-500">{b2b.logosNote}</p>
        </Container>
      </section>
    </>
  );
}
