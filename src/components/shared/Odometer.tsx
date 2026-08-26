'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Per-character vertical roll. Each character cell swaps its glyph with a
 * short upward flip when the string changes — a lightweight odometer used for
 * the workshop clock and the configurator total. Monospaced so cells don't jump.
 */
export function Odometer({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  const chars = value.split('');

  return (
    <span className={cn('inline-flex font-mono tabular-nums', className)} aria-label={value}>
      {chars.map((ch, i) => (
        <span key={i} className="relative inline-block overflow-hidden" style={{ height: '1em' }} aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch + i}
              className="inline-block"
              initial={reduce ? false : { y: '100%' }}
              animate={{ y: '0%' }}
              exit={reduce ? { opacity: 0 } : { y: '-100%' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
