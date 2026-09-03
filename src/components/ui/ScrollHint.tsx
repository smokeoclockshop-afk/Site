'use client';

import { motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** "Scroll down" capsule: a porthole with chevrons streaming down + a label. */
export function ScrollHint({ label, className, tone = 'dark' }: { label: string; className?: string; tone?: 'dark' | 'light' }) {
  const reduce = useReducedMotion();
  const onDark = tone === 'dark';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full border py-2 pl-2.5 pr-5 backdrop-blur-md',
        onDark ? 'border-parchment-50/15 bg-roast-900/55 text-parchment-50' : 'border-onyx/15 bg-parchment-50/70 text-onyx',
        className,
      )}
    >
      <span className={cn('relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full', onDark ? 'bg-parchment-50/10' : 'bg-onyx/8')}>
        {(reduce ? [0] : [0, 0.8]).map((delay) => (
          <motion.span
            key={delay}
            className="absolute grid place-items-center"
            animate={reduce ? undefined : { y: [-14, 14], opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <ChevronDown className={cn('size-4', onDark ? 'text-saffron-300' : 'text-saffron-600')} aria-hidden />
          </motion.span>
        ))}
      </span>
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </div>
  );
}
