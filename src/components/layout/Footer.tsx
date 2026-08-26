import { Clock, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site } from '@/lib/site';
import { Wordmark } from '@/components/ui/Wordmark';
import { Rule } from '@/components/ui/Ornament';
import { MessengerRow } from '@/components/order/MessengerRow';

export async function Footer() {
  const [t, tn] = await Promise.all([getTranslations('footer'), getTranslations('nav')]);

  const discover = [
    ['/smoker', tn('smoker')],
    ['/vyroby', tn('products')],
    ['/maister', tn('master')],
    ['/b2b', tn('b2b')],
    ['/kontakty', tn('contact')],
  ] as const;

  return (
    <footer data-dark-bg className="relative overflow-hidden bg-roast-900 text-parchment-100/75">
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="flex flex-col items-center">
          <Wordmark tone="light" tagline />
          <p className="mt-5 max-w-md text-center text-sm leading-relaxed text-parchment-100/65">
            {t('blurb')}
          </p>
        </div>

        <Rule tone="light" className="my-12" />

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label={t('discover')}>
            <h2 className="kicker mb-5 text-parchment-100/50">{t('discover')}</h2>
            <ul className="space-y-2.5 text-sm">
              {discover.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-parchment-100/75 transition-colors hover:text-saffron-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2">
            <h2 className="kicker mb-5 text-parchment-100/50">{t('visit')}</h2>
            <ul className="space-y-2.5 text-sm text-parchment-100/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-saffron-500" aria-hidden />
                <span>{site.workshop.street}, {site.workshop.city}, {site.workshop.region}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-saffron-500" aria-hidden />
                <a href={`tel:${site.workshop.phoneHref}`} className="spec transition-colors hover:text-saffron-300" dir="ltr">
                  {site.workshop.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-saffron-500" aria-hidden />
                <span>{t('hours')}</span>
              </li>
            </ul>
            <MessengerRow place="footer" className="mt-5" tone="dark" />
          </div>

          <div>
            <h2 className="kicker mb-5 text-parchment-100/50">{t('actions')}</h2>
            <p className="text-sm leading-relaxed text-parchment-100/75">{t('charity')}</p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-parchment-50/12 pt-6 text-xs text-parchment-100/50 sm:flex-row">
          <p>© 2026 {site.name}. {t('rights')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="transition-colors hover:text-saffron-300">{t('privacyPolicy')}</Link>
            <Link href="/terms" className="transition-colors hover:text-saffron-300">{t('terms')}</Link>
            <Link href="/cookie-policy" className="transition-colors hover:text-saffron-300">{t('cookiePolicy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
