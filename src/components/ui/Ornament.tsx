import { cn } from '@/lib/utils';

/**
 * Small ember spark glyph used as an editorial divider accent. The system's
 * single decorative flourish.
 */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn('size-3 text-ember-500', className)}
      fill="none"
    >
      <path d="M12 2 L14 12 L12 22 L10 12 Z" fill="currentColor" opacity="0.9" />
      <path d="M2 12 L12 10 L22 12 L12 14 Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/** Centered hairline rule with an ember spark in the middle. */
export function Rule({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const line = tone === 'dark' ? 'bg-[color:rgb(44_44_44/0.14)]' : 'bg-[color:rgb(28_25_22/0.18)]';
  return (
    <div className={cn('flex items-center justify-center gap-4', className)} aria-hidden>
      <span className={cn('h-px w-16 sm:w-24', line)} />
      <Ornament />
      <span className={cn('h-px w-16 sm:w-24', line)} />
    </div>
  );
}
