import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import { LegalLayout } from '@/components/legal/LegalLayout';

type Props = { params: Promise<{ locale: Locale }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({
    locale,
    path: '/cookie-policy',
    title: t('cookies.title'),
    description: t('cookies.description'),
    noIndex: true,
  });
}

export default async function CookiePolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tm, tl] = await Promise.all([getTranslations('meta'), getTranslations('legal')]);

  return (
    <LegalLayout
      title={tm('cookies.title')}
      updatedLabel={tl('lastUpdated')}
      updatedDate="Липень 2026"
      intro={`Ця Політика щодо cookie пояснює, як ${site.legalName} використовує файли cookie та подібні технології. Сторінка є загальним шаблоном і має бути переглянута перед публікацією.`}
      sections={[
        {
          h: 'Що таке cookie',
          p: [
            'Cookie — це невеликі текстові файли, що зберігаються на вашому пристрої й допомагають сайту працювати та запам’ятовувати ваші налаштування.',
          ],
        },
        {
          h: 'Як ми використовуємо cookie',
          p: [
            'Ми використовуємо необхідні cookie для роботи сайту та опціональні аналітичні cookie, щоб розуміти, як відвідувачі користуються сайтом, і покращувати його. Ми не використовуємо cookie для продажу ваших даних.',
          ],
        },
        {
          h: 'Керування cookie',
          p: [
            'Ви можете контролювати або видаляти cookie в налаштуваннях браузера. Вимкнення деяких cookie може вплинути на роботу частин сайту.',
          ],
        },
        {
          h: 'Контакти',
          p: [`Питання щодо політики надсилайте на ${site.email}.`],
        },
      ]}
    />
  );
}
