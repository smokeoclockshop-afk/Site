'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { triggerBurst } from '@/components/effects/burst';

/**
 * A steel nameplate whose text engraves itself left-to-right when scrolled into
 * view, throwing sparks off the tip of the "graver". Used in the queue scene and
 * on /maister (with the wordmark). Reveal is a growing clip rect (robust; no
 * getPointAtLength on <text>), with sparks sampled at the leading edge.
 */
export function EngravedPlate({
  text,
  className,
  sparks = true,
}: {
  text: string;
  className?: string;
  sparks?: boolean;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!play) return;
    const rect = rectRef.current;
    if (!rect) return;
    if (reduce) {
      rect.setAttribute('width', '600');
      return;
    }
    let raf = 0;
    let t0 = 0;
    let lastSpark = 0;
    const dur = 1600;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      rect.setAttribute('width', String(p * 600));
      if (sparks && t - lastSpark > 120) {
        lastSpark = t;
        const box = wrapRef.current?.getBoundingClientRect();
        if (box) {
          triggerBurst(box.left + p * box.width, box.top + box.height * 0.52, 'sparks');
        }
      }
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play, reduce, sparks]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        'grain relative flex items-center justify-center overflow-hidden border border-parchment-50/15 bg-roast-800 px-8 py-7',
        className,
      )}
    >
      {/* rivets */}
      {[
        'left-2 top-2',
        'right-2 top-2',
        'left-2 bottom-2',
        'right-2 bottom-2',
      ].map((pos) => (
        <span key={pos} className={cn('absolute size-1.5 rounded-full bg-ember-600/80', pos)} aria-hidden />
      ))}
      <svg viewBox="0 0 600 120" className="relative z-10 w-full" role="img" aria-label={text}>
        <defs>
          <clipPath id={`engrave-${text.replace(/\W/g, '')}`}>
            <rect ref={rectRef} x="0" y="0" width="0" height="120" />
          </clipPath>
        </defs>
        <text
          x="300"
          y="80"
          textAnchor="middle"
          fontFamily="var(--font-mono-stack)"
          fontSize="58"
          fontWeight="600"
          letterSpacing="2"
          fill="none"
          stroke="rgb(239 234 227 / 0.22)"
          strokeWidth="1"
        >
          {text}
        </text>
        <text
          x="300"
          y="80"
          textAnchor="middle"
          fontFamily="var(--font-mono-stack)"
          fontSize="58"
          fontWeight="600"
          letterSpacing="2"
          fill="var(--color-ember-500)"
          clipPath={`url(#engrave-${text.replace(/\W/g, '')})`}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
