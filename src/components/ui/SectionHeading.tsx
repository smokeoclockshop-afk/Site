import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

/**
 * Standard section opener: a mono ember "shopmark" kicker, condensed display
 * title, optional subtitle. Centered by default; align="start" for editorial
 * columns. tone 'light' on dark sections, 'dark' on paper sections.
 */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = 'center',
  tone = 'light',
  as: Tag = 'h2',
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'center' | 'start';
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  const centered = align === 'center';
  const titleColor = tone === 'light' ? 'text-smoke-50' : 'text-onyx';
  const subColor = tone === 'light' ? 'text-smoke-300' : 'text-coal-800/80';

  return (
    <Reveal className={cn('max-w-2xl', centered ? 'mx-auto text-center' : 'text-start', className)}>
      {kicker && (
        <p className={cn('kicker mb-5 flex items-center gap-3', centered && 'justify-center')}>
          <span aria-hidden className="h-px w-8 bg-ember-500/70" />
          {kicker}
          {centered && <span aria-hidden className="h-px w-8 bg-ember-500/70" />}
        </p>
      )}
      <Tag className={cn('display struck text-[clamp(2.2rem,5vw,4rem)]', titleColor)}>{title}</Tag>
      {subtitle && (
        <p className={cn('mx-auto mt-6 max-w-xl leading-relaxed', subColor, !centered && 'mx-0')}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
