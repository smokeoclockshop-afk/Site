'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { triggerBurst } from '@/components/effects/burst';

/**
 * "Struck into metal" stamp: quick scale-down + fade-in with a hard easing and
 * a spark burst on impact. Used for verdicts and form-success confirmations.
 */
export function StampText({
  children,
  className,
  onImpact = true,
}: {
  children: React.ReactNode;
  className?: string;
  onImpact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!onImpact || reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    triggerBurst(r.left + r.width / 2, r.top + r.height / 2, 'sparks');
  }, [onImpact, reduce]);

  return (
    <motion.div
      ref={ref}
      className={cn('display struck text-ember-500', className)}
      initial={reduce ? false : { scale: 1.15, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.9, 0, 0.1, 1] }}
    >
      {children}
    </motion.div>
  );
}
