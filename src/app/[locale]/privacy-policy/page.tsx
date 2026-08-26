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
    path: '/privacy-policy',
    title: t('privacy.title'),
    description: t('privacy.description'),
    noIndex: true,
  });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tm, tl] = await Promise.all([
    getTranslations('meta'),
    getTranslations('legal'),
  ]);

  return (
    <LegalLayout
      title={tm('privacy.title')}
      updatedLabel={tl('lastUpdated')}
      updatedDate="Липень 2026"
      intro={`Ця Політика конфіденційності пояснює, як ${site.legalName} збирає, використовує та захищає вашу інформацію, коли ви користуєтеся нашим сайтом або замовляєте вироби. Сторінка є загальним шаблоном і має бути переглянута перед публікацією.`}
      sections={[
        {
          h: 'Яку інформацію ми збираємо',
          p: [
            'Ми збираємо дані, якими ви ділитеся: ім’я, телефон, а за потреби — месенджер чи ел. пошту, коли ви залишаєте заявку або звертаєтесь до нас. Також ми збираємо стандартні знеособлені дані користування (наприклад, переглянуті сторінки), щоб покращувати сайт.',
          ],
        },
        {
          h: 'Як ми використовуємо інформацію',
          p: [
            'Ми використовуємо ваші дані, щоб відповідати на звернення, опрацьовувати заявки й замовлення та покращувати сервіс. Ми не продаємо вашу особисту інформацію.',
          ],
        },
        {
          h: 'Сторонні сервіси',
          p: [
            'Для аналітики й реклами ми можемо використовувати сторонні сервіси (наприклад, Google, Meta). Їхнє використання ваших даних регулюється їхніми власними політиками конфіденційності.',
          ],
        },
        {
          h: 'Ваші права',
          p: [
            `Ви можете запросити доступ до своїх персональних даних, їх виправлення чи видалення, написавши на ${site.email}.`,
          ],
        },
      ]}
    />
  );
}
