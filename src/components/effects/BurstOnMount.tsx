'use client';

import { useEffect } from 'react';
import { triggerBurst } from './burst';

/** Fires a few smoke/spark bursts near the viewport center on mount (404 flair). */
export function BurstOnMount({ count = 3 }: { count?: number }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    let n = 0;
    const id = window.setInterval(() => {
      triggerBurst(cx + (n - count / 2) * 60, cy - 40, 'both');
      if (++n >= count) clearInterval(id);
    }, 180);
    return () => clearInterval(id);
  }, [count]);
  return null;
}
