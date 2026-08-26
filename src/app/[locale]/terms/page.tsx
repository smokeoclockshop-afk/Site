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
    path: '/terms',
    title: t('terms.title'),
    description: t('terms.description'),
    noIndex: true,
  });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tm, tl] = await Promise.all([getTranslations('meta'), getTranslations('legal')]);

  return (
    <LegalLayout
      title={tm('terms.title')}
      updatedLabel={tl('lastUpdated')}
      updatedDate="Липень 2026"
      intro={`Ці Умови користування регулюють використання вебсайту ${site.legalName}. Сторінка є загальним шаблоном і має бути переглянута юристом перед публікацією.`}
      sections={[
        {
          h: 'Користування сайтом',
          p: [
            'Ви можете користуватися сайтом для особистих цілей: переглядати вироби, дізнаватися про майстра і зв’язуватися з нами. Ви погоджуєтесь не зловживати сайтом і не перешкоджати його нормальній роботі.',
          ],
        },
        {
          h: 'Замовлення',
          p: [
            'Вироби виготовляються під замовлення. Ціни, строки виготовлення і наявність можуть змінюватися без попередження. Остаточні умови кожного замовлення узгоджуються індивідуально під час звернення.',
          ],
        },
        {
          h: 'Інтелектуальна власність',
          p: [
            `Контент цього сайту — тексти, зображення, дизайн виробів і бренд — є власністю ${site.legalName} або наших ліцензіарів і не може використовуватися без дозволу.`,
          ],
        },
        {
          h: 'Обмеження відповідальності',
          p: [
            'Сайт надається «як є». У межах, дозволених законом, ми не несемо відповідальності за непрямі чи випадкові збитки, пов’язані з користуванням сайтом.',
          ],
        },
        {
          h: 'Контакти',
          p: [`Питання щодо умов надсилайте на ${site.email}.`],
        },
      ]}
    />
  );
}
