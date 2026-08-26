'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getSlot, isRealMedia } from '@/lib/media';
import type { SiteContent } from '@/lib/content';
import { MotionNumber } from '@/components/shared/MotionNumber';
import { track } from '@/lib/analytics';

/* eslint-disable @next/next/no-img-element */

type Data = SiteContent['home']['hero'];

function Vignette() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(115% 80% at 50% 32%, transparent 42%, rgba(18,16,14,0.55) 82%, rgba(18,16,14,0.85) 100%)',
      }}
    />
  );
}

function Thermometer({ fill, temp }: { fill: import('motion/react').MotionValue<number>; temp: import('motion/react').MotionValue<number> }) {
  const scaleY = useTransform(fill, [0, 1], [0.02, 1]);
  return (
    <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
      <span className="spec text-ember-400">
        <MotionNumber value={temp} format={(n) => `${Math.round(n)} °C`} />
      </span>
      <div className="relative h-56 w-2 overflow-hidden rounded-full bg-parchment-50/15">
        <motion.div
          className="absolute inset-x-0 bottom-0 origin-bottom rounded-full bg-saffron-500"
          style={{ height: '100%', scaleY }}
        />
      </div>
      <div className="flex flex-col gap-8 text-[10px] text-parchment-100/55">
        {['110°', '60°', '20°'].map((t) => (
          <span key={t} className="spec">{t}</span>
        ))}
      </div>
    </div>
  );
}

export function Scene01Hero({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hi, setHi] = useState(0);
  const poster = getSlot('ph.hero.poster');
  const video = getSlot('ph.hero.video');

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const temp = useTransform(scrollYProgress, [0, 0.6], [data.tempStart, data.tempEnd]);
  const fill = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.75, 1], ['0vh', '-12vh']);
  const titleOpacity = useTransform(scrollYProgress, [0.75, 1], [1, 0.35]);
  const blurPx = useTransform(scrollYProgress, [0.75, 1], [0, 6]);
  const titleFilter = useMotionTemplate`blur(${blurPx}px)`;
  const readyOpacity = useTransform(scrollYProgress, [0.8, 0.95], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const step = p < 0.62 ? 0 : p < 0.67 ? 1 : p < 0.72 ? 2 : 3;
    setHi((prev) => (prev === step ? prev : step));
  });

  const hasRealPoster = isRealMedia('ph.hero.poster');
  const Background = (
    <>
      {/* Designed "forge" backdrop — used until a real poster/video is wired in,
          so no placeholder captions ever bleed behind the headline. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 118%, rgba(232,114,31,0.45) 0%, rgba(194,87,15,0.12) 35%, transparent 62%), linear-gradient(180deg, #171412 0%, #12100e 55%, #0d0b0a 100%)',
        }}
      />
      {/* Breathing forge glow — the coals pulse slowly, like a live fire. */}
      <div
        aria-hidden
        className="absolute inset-0 motion-safe:animate-[forge-breathe_7s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(70% 45% at 50% 112%, rgba(232,114,31,0.3) 0%, rgba(194,87,15,0.1) 45%, transparent 70%)',
        }}
      />
      <div className="grain absolute inset-0" />
      {hasRealPoster && (
        <img src={poster.src} alt={poster.alt} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
      )}
      {video.videoSrc && (
        <video
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
          poster={hasRealPoster ? poster.src : undefined}
          src={video.videoSrc}
          muted
          loop
          playsInline
          autoPlay
          preload="none"
        />
      )}
      {/* Dark scrim — keeps the headline readable without muting the footage. */}
      {(hasRealPoster || video.videoSrc) && (
        <div aria-hidden className="absolute inset-0 bg-roast-900/45" />
      )}
      <Vignette />
    </>
  );

  const Utp = (
    <p className="spec mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-parchment-100/85">
      {data.utp.map((part, i) => (
        <span key={part} className="flex items-center gap-3">
          {i > 0 && <span className="text-saffron-400/70">·</span>}
          <span className={cn('transition-colors duration-300', hi > i && 'text-saffron-300')}>{part}</span>
        </span>
      ))}
    </p>
  );

  const Ctas = (
    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/smoker"
        onClick={() => track('cta_hero_click', { which: 'primary' })}
        className="inline-flex items-center rounded-[2px] bg-saffron-500 px-7 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-saffron-600"
      >
        {data.cta1}
      </Link>
      <a
        href="#process"
        onClick={() => track('cta_hero_click', { which: 'process' })}
        className="inline-flex items-center rounded-[2px] border border-parchment-50/40 px-7 py-3.5 text-sm font-semibold text-parchment-50 transition-colors hover:bg-parchment-50 hover:text-onyx"
      >
        {data.cta2}
      </a>
    </div>
  );

  // Reduced-motion / static branch — one screen, no pin.
  if (reduce) {
    return (
      <section ref={ref} data-dark-bg className="relative flex min-h-dvh items-center justify-center overflow-hidden text-center">
        {Background}
        <div className="relative z-10 px-6">
          <h1 className="display text-parchment-50 text-[clamp(3.5rem,11vw,9.5rem)]">{data.title}</h1>
          {Utp}
          {Ctas}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} data-dark-bg className="relative h-[160vh] md:h-[220vh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden text-center">
        {Background}
        <Thermometer fill={fill} temp={temp} />

        <div className="absolute left-6 top-[calc(var(--header-h)+1rem)] z-10 hidden sm:block">
          <span className="spec text-parchment-100/70">{data.nowInShop}</span>
        </div>

        <motion.div
          className="relative z-10 px-6"
          style={{ y: titleY, opacity: titleOpacity, filter: titleFilter }}
        >
          <h1 className="display text-parchment-50 text-[clamp(3rem,11vw,9.5rem)]">{data.title}</h1>
          {Utp}
          {Ctas}
        </motion.div>

        <motion.p
          style={{ opacity: readyOpacity }}
          className="spec absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-parchment-100/55"
        >
          {data.readyCaption} ↓
        </motion.p>
      </div>
    </section>
  );
}
