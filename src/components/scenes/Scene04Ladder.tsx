'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { LadderItem, SiteContent } from '@/lib/content';
import { Slot } from '@/components/ui/Slot';
import { OrderButton } from '@/components/order/OrderButton';
import { useMediaQuery } from '@/components/shared/useMediaQuery';
import { SmokeWall } from '@/components/effects/SmokeWall';

type Data = SiteContent['home']['ladder'];

/* Cards fully materialize once their center crosses 55vw; deep in the fog (86vw+)
   they are invisible. The right ~48vw of the stage is the smoke wall. */
const FOG_START = 0.86;
const FOG_END = 0.55;

function Heading({ data }: { data: Data }) {
  return (
    <div>
      <p className="kicker">{data.kicker}</p>
      <h2 className="display mt-2 text-onyx text-[clamp(1.9rem,3.2vw,3rem)]">{data.title}</h2>
    </div>
  );
}

function CtaFor({ item, className }: { item: LadderItem; className?: string }) {
  if (item.action === 'smoker') {
    return (
      <Link
        href="/smoker"
        className={cn(
          'inline-flex items-center justify-center rounded-[2px] bg-saffron-500 px-5 py-2.5 text-sm font-semibold text-onyx transition-colors hover:bg-saffron-400',
          className,
        )}
      >
        {item.cta}
      </Link>
    );
  }
  return (
    <OrderButton
      source={item.action === 'custom' ? 'ladder-custom' : `ladder:${item.name}`}
      payload={{ product: item.name }}
      variant="saffron"
      className={className}
    >
      {item.cta}
    </OrderButton>
  );
}

function CardBody({ item }: { item: LadderItem }) {
  return (
    <>
      <div className="relative shrink-0 overflow-hidden">
        {/* Flagship is wide-screen; the rest are taller so equal-height cards
            don't end up with a hole between specs and price. */}
        <Slot id={item.slot} className={item.flagship ? 'aspect-[16/10]' : 'aspect-[4/3]'} />
        {item.flagship && (
          <span className="spec absolute right-3 top-3 bg-roast-900/65 px-2 py-1 text-saffron-300 backdrop-blur-sm">
            наступний № 014
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <h3 className="display text-[1.35rem] text-onyx lg:leading-tight">{item.name}</h3>
        <ul className="mt-2 space-y-1">
          {item.specs.map((s) => (
            <li key={s} className="flex items-baseline gap-2 text-sm text-onyx">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-saffron-500" />
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4">
          <p className="spec text-lg text-saffron-600">{item.price}</p>
          {item.perMonth && <p className="spec mt-0.5 text-walnut">{item.perMonth}</p>}
          <div className="mt-3">
            <CtaFor item={item} className="w-full" />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * One card on the conveyor. Deep in the fog wall it is an almost invisible
 * ghost; as the track pulls it left, a turbulence-displacement SVG filter
 * un-warps it — the card literally condenses out of swirling smoke into a
 * solid object (amplitude and blur decay with the materialize progress).
 */
function ConveyorCard({ item, trackX }: { item: LadderItem; trackX: MotionValue<number> }) {
  const elRef = useRef<HTMLElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const baseCenter = useRef(0);
  const vwRef = useRef(1);
  const filterId = `matz-${item.slot.replace(/\W/g, '-')}`;

  /* Imperative motion values: derived transforms would evaluate BEFORE the
     card position is measured (initial p=1 for everything) and not refresh
     until the first scroll — these are synced right after measuring instead. */
  const opacity = useMotionValue(0);
  const scale = useMotionValue(0.93);
  const y = useMotionValue(34);

  const prog = (tx: number) => {
    const c = (baseCenter.current + tx) / (vwRef.current || 1);
    return Math.min(1, Math.max(0, (FOG_START - c) / (FOG_START - FOG_END)));
  };

  /* Drive the SVG filter imperatively — and drop it entirely once solid, so a
     materialized card costs nothing while the track keeps moving. */
  const applyFx = (p: number) => {
    const el = elRef.current;
    if (!el) return;
    /* Power curve: the ghost stays a faint shimmer deep in the smoke and only
       gains body once the turbulence starts settling — reads as condensation. */
    opacity.set(Math.pow(p, 2.4));
    scale.set(0.93 + p * 0.07);
    y.set((1 - p) * 34);
    const q = 1 - p;
    if (q < 0.01) {
      if (el.style.filter !== 'none') el.style.filter = 'none';
      return;
    }
    if (!el.style.filter.includes(filterId)) el.style.filter = `url(#${filterId})`;
    dispRef.current?.setAttribute('scale', (q * q * 220).toFixed(1));
    blurRef.current?.setAttribute('stdDeviation', (q * 7).toFixed(2));
  };

  useEffect(() => {
    const measure = () => {
      const el = elRef.current;
      const track = el?.parentElement;
      if (!el || !track) return;
      const er = el.getBoundingClientRect();
      const tr = track.getBoundingClientRect();
      // Both rects share the track transform, so their difference is transform-free.
      baseCenter.current = tr.left - trackX.get() + (er.left - tr.left) + er.width / 2;
      vwRef.current = window.innerWidth;
      applyFx(prog(trackX.get()));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackX]);

  /* No extra global bursts here: their plumes rise far above the section, and
     the smoke wall + turbulence unwarp already carry the materialization. */
  useMotionValueEvent(trackX, 'change', (tx) => applyFx(prog(tx)));

  return (
    <>
      {/* Static fractal-noise field; only the displacement amplitude animates,
          so the warp reads as smoke turbulence settling into shape. */}
      <svg aria-hidden className="absolute size-0 overflow-hidden">
        <filter id={filterId} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.017" numOctaves="3" seed="7" result="noise" />
          <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="0" result="soft" />
          <feDisplacementMap ref={dispRef} in="soft" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <motion.article
        ref={elRef}
        style={{ opacity, scale, y }}
        className={cn(
          'flex shrink-0 flex-col border border-onyx/12 bg-parchment-50 p-2 shadow-[0_30px_60px_-30px_rgb(28_24_20/0.35)]',
          item.flagship ? 'w-[min(29vw,52vh)]' : 'w-[min(21vw,40vh)]',
        )}
      >
        <CardBody item={item} />
      </motion.article>
    </>
  );
}

/**
 * Desktop: the pinned conveyor. Cards ride left as you scroll; the right half
 * of the stage is a layered smoke wall (haze gradients + drifting blobs +
 * particle plumes on the global canvas) that the next card materializes from.
 */
function DesktopSmokeConveyor({ data }: { data: Data }) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const maxX = useRef(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (v) => -v * maxX.current);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      maxX.current = Math.max(0, track.scrollWidth - window.innerWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <section id="ladder" ref={ref} className="relative z-10 h-[320vh] bg-parchment-200">
      {/* overflow-x-clip: exiting cards are clipped, but the smoke may spill
          VERTICALLY over the neighbouring sections. */}
      <div className="sticky top-0 flex h-dvh flex-col overflow-x-clip pt-[var(--header-h)]">
        <SmokeWall />
        {/* Header row inside the pinned frame — the title can never hide. */}
        <div className="px-[6vw] pt-4">
          <Heading data={data} />
        </div>

        <div className="relative flex-1">
          {/* The conveyor itself: the wrapper centers it, the track stretches
              cards to equal height (CTA rows bottom-aligned via mt-auto). */}
          <div className="relative z-10 flex h-full items-center">
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex items-stretch gap-[4vw] pl-[8vw] pr-[46vw]"
            >
              {data.items.map((item) => (
                <ConveyorCard key={item.name} item={item} trackX={x} />
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

function StackedCard({ item, reduce }: { item: LadderItem; reduce: boolean }) {
  const anim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 40, filter: 'blur(8px)' },
        whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
      };
  return (
    <motion.article {...anim} className="flex flex-col border border-onyx/12 bg-parchment-50 p-2.5">
      <CardBody item={item} />
    </motion.article>
  );
}

export function Scene04Ladder({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop && !reduce) return <DesktopSmokeConveyor data={data} />;

  return (
    <section id="ladder" className="bg-parchment-200 py-16">
      <div className="px-5 sm:px-8">
        <Heading data={data} />
      </div>
      <div className="mt-8 space-y-6 px-5 sm:px-8">
        {data.items.map((item) => (
          <StackedCard key={item.name} item={item} reduce={!!reduce} />
        ))}
      </div>
    </section>
  );
}
