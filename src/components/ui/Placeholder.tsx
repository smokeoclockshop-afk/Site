import { cn } from '@/lib/utils';
import { Ornament } from './Ornament';

type Tone = 'dark' | 'ember';

/**
 * Lightweight framed slot for cases where a labelled block is wanted without a
 * media file. Most imagery uses <Slot> (lib/media). Kept for incidental fills.
 */
export function Placeholder({
  label,
  tone = 'dark',
  className,
  showMark = true,
}: {
  label?: string;
  tone?: Tone;
  className?: string;
  showMark?: boolean;
}) {
  const bg = tone === 'ember' ? 'bg-ember-500/10 text-smoke-50' : 'bg-coal-800 text-smoke-300';

  return (
    <div className={cn('grain relative flex items-center justify-center overflow-hidden', bg, className)}>
      <div className="pointer-events-none absolute inset-4 border border-[color:rgb(44_44_44/0.14)]" aria-hidden />
      {showMark && (
        <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
          <Ornament className="size-4" />
          {label && (
            <p className="max-w-[18ch] font-display text-lg leading-tight tracking-[0.08em] uppercase">{label}</p>
          )}
        </div>
      )}
    </div>
  );
}
