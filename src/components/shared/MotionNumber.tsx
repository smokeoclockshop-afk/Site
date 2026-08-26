'use client';

import { useRef } from 'react';
import { useMotionValueEvent, type MotionValue } from 'motion/react';

/**
 * Renders a MotionValue<number> as formatted text, writing directly to the DOM
 * node on change (no re-render). Use for scroll-driven counters.
 */
export function MotionNumber({
  value,
  format,
  className,
}: {
  value: MotionValue<number>;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = format ?? ((n: number) => String(Math.round(n)));
  useMotionValueEvent(value, 'change', (v) => {
    if (ref.current) ref.current.textContent = fmt(v);
  });
  return (
    <span ref={ref} className={className}>
      {fmt(value.get())}
    </span>
  );
}
