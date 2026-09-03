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
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { site } from '@/lib/site';
import type { LadderItem, SiteContent } from '@/lib/content';
import { Slot } from '@/components/ui/Slot';
import { OrderButton } from '@/components/order/OrderButton';
import { useMediaQuery } from '@/components/shared/useMediaQuery';
import { SmokeWall } from '@/components/effects/SmokeWall';
import { Slider } from '@/components/ui/Slider';

type Data = SiteContent['home']['ladder'];

/* Cards fully materialize once their center crosses 55vw; deep in the fog (86vw+)
   they are invisible. The right ~48vw of the stage is the smoke wall. */
const FOG_START = 0.86;
const FOG_END = 0.55;

const pad = (n: number) => `№ ${String(n).padStart(3, '0')}`;

function Heading({ data }: { data: Data }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
      <div>
        <p className="kicker">{data.kicker}</p>
        <h2 className="display mt-2 text-onyx text-[clamp(1.9rem,3.2vw,3rem)]">{data.title}</h2>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-espresso">{data.lead}</p>
    </div>
  );
}

function CtaFor({ item, className }: { item: LadderItem; className?: string }) {
  if (item.action === 'smoker') {
    return (
      <Link
        href="/smoker"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[2px] bg-saffron-500 px-5 py-2.5 text-sm font-semibold text-onyx transition-colors hover:bg-saffron-400',
          className,
        )}
      >
        {item.cta}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    );
  }
  if (item.action === 'catalog' && item.slug) {
    return (
      <Link
        href={{ pathname: '/vyroby', query: { p: item.slug } }}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[2px] border border-onyx/25 px-5 py-2.5 text-sm font-semibold text-onyx transition-colors hover:bg-onyx hover:text-parchment-50',
          className,
        )}
      >
        {item.cta}
        <ArrowRight className="size-4" aria-hidden />
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
        {/* Product tiles are pre-composed on parchment, so the object floats on
            the card instead of sitting in a white box. */}
        <Slot id={item.slot} className="aspect-[4/3] bg-parchment-50" />
        {item.flagship && (
          <>
            <span className="spec absolute left-3 top-3 bg-onyx px-2 py-1 text-parchment-50">Флагман</span>
            <span className="spec absolute right-3 top-3 text-saffron-600">
              вільне місце: {pad(site.queue.inProgress + 1)}
            </span>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <h3 className={cn('display text-onyx', item.flagship ? 'text-[1.6rem] leading-tight' : 'text-[1.3rem] leading-tight')}>
          {item.name}
        </h3>
        {item.tagline && <p className="mt-1.5 text-sm leading-relaxed text-espresso">{item.tagline}</p>}
        <ul className="mt-3 space-y-1">
          {item.specs.map((s) => (
            <li key={s} className="flex items-baseline gap-2 text-sm text-onyx">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-saffron-500" />
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-auto border-t border-onyx/12 pt-3.5">
          <p className={cn('spec text-lg', item.price.startsWith('ціна') ? 'text-espresso' : 'text-saffron-600')}>{item.price}</p>
          {item.perMonth && <p className="spec mt-0.5 text-walnut">{item.perMonth}</p>}
          <div className="mt-3">
            <CtaFor item={item} className="w-full" />
          </div>
        </div>
      </div>
    </>
  );
}

/** The conveyor's last card: dark steel plate → full catalog + custom pitch. */
function EndCardBody({ data }: { data: Data }) {
  return (
    <div
      data-dark-bg
      className="flex h-full flex-col justify-between bg-[#2b2620] p-5 text-parchment-50"
      style={{
        backgroundImage:
          'repeating-linear-gradient(105deg, rgb(255 255 255 / 0.013) 0 2px, transparent 2px 5px), radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 0.05), transparent 55%)',
      }}
    >
      <div>
        <p className="kicker text-saffron-300">{data.kicker}</p>
        <Link href="/vyroby" className="group/all mt-3 block">
          <span className="display block text-[clamp(1.5rem,2.2vw,2.1rem)] leading-tight text-parchment-50 transition-colors group-hover/all:text-saffron-300">
            {data.allCta}
          </span>
          <span className="mt-2 inline-flex items-center gap-2 text-sm text-parchment-100/75">
            {data.allNote}
            <ArrowRight className="size-4 text-saffron-300 transition-transform duration-300 group-hover/all:translate-x-1" aria-hidden />
          </span>
        </Link>
      </div>
      <div className="mt-8 border-t border-parchment-50/12 pt-5">
        <p className="display text-xl text-parchment-50">{data.customTitle}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-parchment-100/75">{data.customText}</p>
        <OrderButton source="ladder-custom" variant="ghostLight" className="mt-4 w-full px-4 py-2.5">
          {data.customCta}
        </OrderButton>
      </div>
    </div>
  );
}

/**
 * One card on the conveyor. Deep in the fog wall it is an almost invisible
 * ghost; as the track pulls it left, a turbulence-displacement SVG filter
 * un-warps it — the card literally condenses out of swirling smoke into a
 * solid object (amplitude and blur decay with the materialize progress).
 */
function ConveyorCard({
  id,
  wide,
  dark,
  trackX,
  children,
}: {
  id: string;
  wide?: boolean;
  dark?: boolean;
  trackX: MotionValue<number>;
  children: React.ReactNode;
}) {
  const elRef = useRef<HTMLElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const baseCenter = useRef(0);
  const vwRef = useRef(1);
  const filterId = `matz-${id.replace(/\W/g, '-')}`;

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
          'flex shrink-0 flex-col border shadow-[0_30px_60px_-30px_rgb(28_24_20/0.35)]',
          dark ? 'border-onyx/40 bg-[#2b2620]' : 'border-onyx/12 bg-parchment-50 p-2',
          wide ? 'w-[min(30vw,54vh)]' : 'w-[min(22.5vw,42vh)]',
        )}
      >
        {children}
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
  const n = data.items.length + 1;

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
    <section id="ladder" ref={ref} style={{ height: `${180 + n * 30}vh` }} className="relative z-10 bg-parchment-200">
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
              className="flex items-stretch gap-[3.5vw] pl-[8vw] pr-[46vw]"
            >
              {data.items.map((item) => (
                <ConveyorCard key={item.slug ?? item.name} id={item.slug ?? item.name} wide={item.flagship} trackX={x}>
                  <CardBody item={item} />
                </ConveyorCard>
              ))}
              <ConveyorCard id="all-products" dark trackX={x}>
                <EndCardBody data={data} />
              </ConveyorCard>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Phone card: photo, name, three spec chips, price and a small CTA — nothing that needs scrolling. */
function MobileCard({ item }: { item: LadderItem }) {
  return (
    <article className="flex flex-col border border-onyx/12 bg-parchment-50 p-2">
      <div className="relative overflow-hidden">
        <Slot id={item.slot} className="aspect-[4/3] bg-parchment-50" />
        {item.flagship && <span className="spec absolute left-2 top-2 bg-onyx px-2 py-1 text-[10px] text-parchment-50">Флагман</span>}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
        <h3 className="display text-[1.15rem] leading-tight text-onyx">{item.name}</h3>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {item.specs.map((sp) => (
            <li key={sp} className="border border-onyx/12 bg-parchment-100 px-2 py-0.5 text-[11px] text-onyx">
              {sp}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4">
          <p className={cn('spec whitespace-nowrap text-[15px]', item.price.startsWith('ціна') ? 'text-espresso' : 'text-saffron-600')}>{item.price}</p>
          {item.flagship ? (
            <p className="spec mt-0.5 whitespace-nowrap text-[10px] text-walnut">вільне місце: {pad(site.queue.inProgress + 1)}</p>
          ) : (
            item.perMonth && <p className="spec mt-0.5 truncate text-[10px] text-walnut">{item.perMonth}</p>
          )}
          <CtaFor item={item} className="mt-3 w-full px-3 py-2 text-xs" />
        </div>
      </div>
    </article>
  );
}

/** Phone end card: catalog link + custom pitch in the same compact footprint. */
function MobileEndCard({ data }: { data: Data }) {
  return (
    <article
      data-dark-bg
      className="flex flex-col justify-between border border-onyx/40 bg-[#2b2620] p-5 text-parchment-50"
      style={{
        backgroundImage:
          'repeating-linear-gradient(105deg, rgb(255 255 255 / 0.013) 0 2px, transparent 2px 5px), radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 0.05), transparent 55%)',
      }}
    >
      <div>
        <p className="kicker text-saffron-300">{data.kicker}</p>
        <Link href="/vyroby" className="group/all mt-3 block">
          <span className="display block text-2xl leading-tight text-parchment-50">{data.allCta}</span>
          <span className="mt-2 inline-flex items-center gap-2 text-sm text-parchment-100/75">
            {data.allNote}
            <ArrowRight className="size-4 shrink-0 text-saffron-300" aria-hidden />
          </span>
        </Link>
      </div>
      <div className="mt-6 border-t border-parchment-50/12 pt-4">
        <p className="text-sm font-semibold text-parchment-50">{data.customTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-parchment-100/70">{data.customText}</p>
        <OrderButton source="ladder-custom" variant="ghostLight" className="mt-3 w-full px-4 py-2 text-xs">
          {data.customCta}
        </OrderButton>
      </div>
    </article>
  );
}

/** Phones / reduced motion: a swipe strip; the next card rolls in out of a smoke bank on the right. */
function MobileConveyor({ data, reduce }: { data: Data; reduce: boolean }) {
  return (
    <section id="ladder" className="relative overflow-hidden bg-parchment-200 py-16">
      <div className="px-5 sm:px-8">
        <Heading data={data} />
      </div>
      <Slider
        className="mt-8 pl-5 sm:pl-8"
        controlsClassName="pr-5 sm:pr-8"
        peek
        slideClassName="w-[78%] sm:w-[52%]"
        labels={{ prev: 'Попередній виріб', next: 'Наступний виріб' }}
        edge={
          !reduce && (
            /* Same billow simulation as the desktop conveyor, thinned for a
               phone: it hangs on the right with an organic edge, no gradient line. */
            <div className="pointer-events-none absolute inset-0 z-10">
              <SmokeWall density={0.4} sizeScale={0.55} className="h-[calc(100%+8vh)]" />
            </div>
          )
        }
        slides={[...data.items.map((item) => <MobileCard key={item.slug ?? item.name} item={item} />), <MobileEndCard key="all" data={data} />]}
      />
    </section>
  );
}

export function Scene04Ladder({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop && !reduce) return <DesktopSmokeConveyor data={data} />;
  return <MobileConveyor data={data} reduce={!!reduce} />;
}
