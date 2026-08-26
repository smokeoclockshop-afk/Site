'use client';

import { useEffect, useRef } from 'react';

/**
 * Counts a number up into an element's textContent (not React state, so it never
 * re-renders the tree) once `active` flips true. Respects reduced-motion by
 * jumping straight to the target.
 */
export function useCountUp(
  target: number,
  active: boolean,
  opts: { from?: number; duration?: number; format?: (n: number) => string } = {},
) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = opts.from ?? 0;
  const duration = opts.duration ?? 1200;
  const formatOpt = opts.format;

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const format = formatOpt ?? ((n: number) => String(Math.round(n)));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = format(target);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      el.textContent = format(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, from, duration, formatOpt]);

  return ref;
}
