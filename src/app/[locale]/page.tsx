import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/content';
import { Scene01Hero } from '@/components/scenes/Scene01Hero';
import { Scene02Showcase } from '@/components/scenes/Scene02Showcase';
import { Scene03Features } from '@/components/scenes/Scene03Features';
import { SceneDishes } from '@/components/scenes/SceneDishes';
import { Scene04Ladder } from '@/components/scenes/Scene04Ladder';
import { Scene05Process } from '@/components/scenes/Scene05Process';
import { Scene06Queue } from '@/components/scenes/Scene06Queue';
import { Scene08Economics } from '@/components/scenes/Scene08Economics';
import { Scene09Quiz } from '@/components/scenes/Scene09Quiz';
import { Scene10FinalCta } from '@/components/scenes/Scene10FinalCta';
import { B2bTeaser } from '@/components/scenes/Interludes';
import { SceneCanCook } from '@/components/scenes/SceneCanCook';
import { StickyCtaBar } from '@/components/order/StickyCtaBar';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({
    locale,
    path: '/',
    title: t('home.title'),
    description: t('home.description'),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { home, stickyBar } = getSiteContent(locale);

  return (
    <>
      {/* Act I — Прогрів */}
      <Scene01Hero data={home.hero} />
      <Scene02Showcase data={home.showcase} />
      <Scene03Features data={home.features} />
      <SceneDishes data={home.dishes} />

      {/* Act II — Пропозиція */}
      <Scene05Process data={home.process} />
      <Scene04Ladder data={home.ladder} />
      <Scene06Queue data={home.queue} />
      <Scene08Economics data={home.economics} />

      {/* Act III — Дія */}
      <Scene09Quiz data={home.quiz} />
      <B2bTeaser data={home.b2bTeaser} />
      <SceneCanCook data={home.recipes} />
      <Scene10FinalCta data={home.finalCta} />

      <StickyCtaBar price={stickyBar.price} cta={stickyBar.cta} source="sticky-home" threshold={1400} />
    </>
  );
}
