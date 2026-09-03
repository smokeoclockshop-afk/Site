'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Touch-first slider built on native scroll-snap: swipe on phones, arrows and
 * dots for everyone else. Slides are plain children; with `peek` the next card
 * shows its edge so the strip reads as a strip. `edge` renders over the right
 * side of the viewport (smoke, gradients) without blocking scrolling.
 */
export function Slider({
  slides,
  className,
  slideClassName,
  peek = false,
  tone = 'light',
  labels = { prev: 'Попередній слайд', next: 'Наступний слайд' },
  edge,
  controlsClassName,
  onChange,
}: {
  slides: ReactNode[];
  className?: string;
  slideClassName?: string;
  /** Extra classes for the arrows/dots row (e.g. right padding on a bleeding strip). */
  controlsClassName?: string;
  peek?: boolean;
  tone?: 'light' | 'dark';
  labels?: { prev: string; next: string };
  edge?: ReactNode;
  onChange?: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const n = slides.length;

  /** Width of one snap step (slide + gap). */
  const step = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 1;
    const second = first.nextElementSibling as HTMLElement | null;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / step())));
        setIndex((prev) => {
          if (prev !== i) onChange?.(i);
          return i;
        });
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
    };
  }, [n, step, onChange]);

  const go = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(n - 1, i));
    track.scrollTo({ left: target * step(), behavior: 'smooth' });
  };

  const dark = tone === 'dark';

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <div
          ref={trackRef}
          data-lenis-prevent
          className={cn('no-scrollbar flex snap-x snap-mandatory items-start gap-4 overflow-x-auto overscroll-x-contain scroll-smooth', peek ? 'pr-[18%]' : '')}
          style={{ scrollbarWidth: 'none' }}
        >
          {slides.map((s, i) => (
            <div key={i} className={cn('shrink-0 snap-center', peek ? 'w-[82%]' : 'w-full', slideClassName)}>
              {s}
            </div>
          ))}
        </div>
        {edge}
      </div>

      {/* Controls */}
      <div className={cn('mt-4 flex items-center justify-between gap-4', controlsClassName)}>
        <div className="flex gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => go(index + dir)}
              aria-label={dir === -1 ? labels.prev : labels.next}
              disabled={dir === -1 ? index === 0 : index === n - 1}
              className={cn(
                'grid size-11 cursor-pointer place-items-center rounded-full border transition-colors disabled:cursor-default disabled:opacity-35',
                dark
                  ? 'border-parchment-50/30 text-parchment-50 hover:border-saffron-400 hover:bg-saffron-500 hover:text-onyx'
                  : 'border-onyx/20 text-onyx hover:border-saffron-500 hover:bg-saffron-500',
              )}
            >
              {dir === -1 ? <ChevronLeft className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5" aria-hidden>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => go(i)}
              className={cn('h-1.5 cursor-pointer rounded-full transition-all duration-300', i === index ? 'w-6 bg-saffron-500' : dark ? 'w-1.5 bg-parchment-50/30' : 'w-1.5 bg-onyx/20')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
