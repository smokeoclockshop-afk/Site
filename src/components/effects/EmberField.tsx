'use client';

import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import { cn } from '@/lib/utils';
import { SmokeEngine, type SmokeVariant } from './particles';

/**
 * Scoped ambient-smoke canvas that fills its (relative) parent. Wisps rise from
 * the bottom edge; optionally repelled by the cursor. `variant` picks the tint:
 * 'light' (pale smoke for dark sections) or 'dark' (soot for light sections).
 * Mounts/pauses via IntersectionObserver; skipped entirely under reduced-motion.
 */
export function EmberField({
  rate = 16,
  repel = false,
  variant = 'light',
  className,
}: {
  rate?: number | MotionValue<number>;
  repel?: boolean;
  variant?: SmokeVariant;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const isNum = typeof rate === 'number';
    const engine = new SmokeEngine(canvas, {
      ambientRate: isNum ? rate : rate.get(),
      ambientVariant: variant,
      sizeTo: 'parent',
      poolSize: 128,
    });
    engine.resize();
    engine.start();
    const unsubRate = isNum ? undefined : rate.on('change', (v) => engine.setAmbientRate(v));

    let rt = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = window.setTimeout(() => engine.resize(), 150);
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let onMove: ((e: PointerEvent) => void) | null = null;
    if (repel) {
      onMove = (e) => {
        const r = canvas.getBoundingClientRect();
        engine.setRepeller(e.clientX - r.left, e.clientY - r.top, 110, 5200);
      };
      window.addEventListener('pointermove', onMove, { passive: true });
    }

    // Pause when scrolled well out of view.
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? engine.start() : engine.stop()),
      { rootMargin: '80% 0px' },
    );
    io.observe(canvas);

    return () => {
      clearTimeout(rt);
      ro.disconnect();
      io.disconnect();
      if (onMove) window.removeEventListener('pointermove', onMove);
      unsubRate?.();
      engine.destroy();
    };
  }, [rate, repel, variant]);

  return <canvas ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />;
}
