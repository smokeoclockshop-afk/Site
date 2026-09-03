import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Clock, MapPin, Phone } from 'lucide-react';
import { routing, type Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/content';
import { site } from '@/lib/site';
import { Container } from '@/components/ui/Container';
import { Slot } from '@/components/ui/Slot';
import { MessengerRow } from '@/components/order/MessengerRow';
import { LeadForm } from '@/components/forms/LeadForm';
import { JsonLd, breadcrumbJsonLd } from '@/components/seo/JsonLd';

type Props = { params: Promise<{ locale: Locale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, path: '/kontakty', title: t('contact.title'), description: t('contact.description') });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { contact, order } = getSiteContent(locale);
  const w = site.workshop;
  const addressLine = [w.street, w.city, w.region].filter(Boolean).join(', ');
  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent([w.street, w.city].filter(Boolean).join(', '))}`;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: 'Головна', path: '/' }, { name: contact.title, path: '/kontakty' }])} />
      <section className="pt-[calc(var(--header-h)+3rem)] pb-20">
        <Container>
          <p className="kicker">{contact.kicker}</p>
          <h1 className="display struck mt-3 text-[clamp(2.5rem,6vw,4.5rem)] text-smoke-50">{contact.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-smoke-300">{contact.intro}</p>

          <MessengerRow place="contact" big className="mt-8" />

          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="display text-2xl text-smoke-50">{contact.formTitle}</h2>
              <div className="mt-6">
                <LeadForm source="contact" order={order} />
              </div>
            </div>

            <div>
              <h2 className="display text-2xl text-smoke-50">{contact.workshopTitle}</h2>
              <Slot id="ph.contact.workshop" className="mt-6" rounded />
              <ul className="mt-6 space-y-3 text-smoke-300">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-ember-500" aria-hidden />
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-ember-400">
                    {addressLine}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0 text-ember-500" aria-hidden />
                  <a href={`tel:${w.phoneHref}`} className="spec hover:text-ember-400" dir="ltr">{w.phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="size-5 shrink-0 text-ember-500" aria-hidden />
                  <span>{contact.hours}</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
