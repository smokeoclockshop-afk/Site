import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { btn } from '@/components/ui/button-styles';
import { Ornament } from '@/components/ui/Ornament';
import { BurstOnMount } from '@/components/effects/BurstOnMount';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <section className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-coal-950 px-6 text-center">
      <BurstOnMount count={3} />
      <div className="relative z-10 flex flex-col items-center">
        <p className="kicker">404</p>
        <Ornament className="mt-5 size-4" />
        <h1 className="display struck mt-5 text-5xl text-smoke-50 sm:text-6xl">{t('title')}</h1>
        <p className="mt-5 max-w-md leading-relaxed text-smoke-300">{t('body')}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className={btn('primary')}>{t('cta')}</Link>
          <Link href="/vyroby" className={btn('ghost')}>Вироби</Link>
        </div>
      </div>
    </section>
  );
}
