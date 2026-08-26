import { cn } from '@/lib/utils';

/**
 * Smoke O'Clock text wordmark. The apostrophe in "O'Clock" is rendered as a
 * pulsing ember dot — the brand's ember-as-glow motif. Text mark keeps the
 * launch light (swap for a real logo later).
 */
export function Wordmark({
  className,
  tone = 'light',
  tagline = false,
}: {
  className?: string;
  /** 'light' = smoke text on dark; 'dark' = coal text on light paper. */
  tone?: 'light' | 'dark';
  tagline?: boolean;
}) {
  const color = tone === 'light' ? 'text-parchment-50' : 'text-onyx';
  const taglineColor = tone === 'light' ? 'text-parchment-100/60' : 'text-walnut';
  return (
    <span className={cn('inline-flex flex-col leading-none', className)}>
      <span className={cn('display flex items-center text-xl font-bold tracking-tight sm:text-2xl', color)}>
        Smoke&nbsp;O
        <span
          aria-hidden
          className="mx-[0.08em] inline-block size-[0.42em] translate-y-[-0.15em] rounded-full bg-saffron-500 motion-safe:animate-[ember-pulse_2.4s_ease-in-out_infinite]"
        />
        Clock
      </span>
      {tagline && (
        <span className={cn('spec mt-1', taglineColor)}>Час диму · сталь 4 мм</span>
      )}
    </span>
  );
}
