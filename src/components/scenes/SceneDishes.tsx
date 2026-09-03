'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Thermometer,
  TreePine,
  Users,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSlot } from '@/lib/media';
import type { SiteContent } from '@/lib/content';
import { OrderButton } from '@/components/order/OrderButton';
import { track } from '@/lib/analytics';

/* eslint-disable @next/next/no-img-element */

type Data = SiteContent['home']['dishes'];
type Dish = Data['items'][number];
type Dir = 1 | -1;

const EASE = [0.22, 1, 0.36, 1] as const;
const WIPE = [0.76, 0, 0.24, 1] as const;

function Heading({ data }: { data: Data }) {
  return (
    <>
      <p className="kicker">{data.kicker}</p>
      <h2 className="display mt-3 text-onyx text-[clamp(1.9rem,3vw,2.9rem)]">
        {data.title.split('\n').map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </h2>
      <p className="mt-3 max-w-md leading-relaxed text-espresso lg:text-[15px]">{data.lead}</p>
    </>
  );
}

/** time / temp / wood chips with icons — shown over the slide photo. */
function FactChips({ dish }: { dish: Dish }) {
  const facts: [LucideIcon, string][] = [
    [Clock, dish.time],
    [Thermometer, dish.temp],
    [TreePine, dish.wood],
  ];
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {facts.map(([Icon, f]) => (
        <span
          key={f}
          className="spec inline-flex items-center gap-1.5 border border-parchment-50/25 bg-roast-900/40 px-2.5 py-1 text-parchment-100"
        >
          <Icon className="size-3.5 text-saffron-300" aria-hidden />
          {f}
        </span>
      ))}
    </div>
  );
}

/** Icon stat tiles under the modal banner: time, temp, wood, yield. */
function MetaGrid({ dish, labels }: { dish: Dish; labels: Data }) {
  const tiles: [LucideIcon, string, string][] = [
    [Clock, labels.metaTime, dish.time],
    [Thermometer, labels.metaTemp, dish.temp],
    [TreePine, labels.metaWood, dish.wood],
    [Users, labels.metaYield, dish.serves],
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-onyx/12 bg-onyx/12 sm:grid-cols-4">
      {tiles.map(([Icon, label, value]) => (
        <div key={label} className="flex flex-col items-center gap-1 bg-parchment-50 px-2 py-3.5 text-center">
          <Icon className="size-[18px] text-saffron-600" aria-hidden />
          <span className="spec text-walnut/80">{label}</span>
          <span className="text-sm font-semibold leading-snug text-onyx">{value}</span>
        </div>
      ))}
    </div>
  );
}

/** The emphasized, animated «open recipe» trigger: saffron block + periodic shine sweep. */
function RecipeButton({ label, onClick }: { label: string; onClick: () => void }) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-[2px] bg-saffron-500 px-5 py-3 text-sm font-semibold text-onyx shadow-[0_14px_32px_-10px_rgb(212_150_83/0.65)] transition-colors hover:bg-saffron-400"
    >
      <BookOpen className="size-4 transition-transform duration-300 group-hover:-rotate-6" aria-hidden />
      {label}
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-16 w-12 -skew-x-12 bg-parchment-50/45 blur-[6px]"
          animate={{ x: [0, 340] }}
          transition={{ duration: 1.3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.4 }}
        />
      )}
    </button>
  );
}

/** Full recipe in a popup: photo banner on top, long scrollable step-by-step body below. */
function RecipeModal({ dish, labels, onClose }: { dish: Dish; labels: Data; onClose: () => void }) {
  const media = getSlot(dish.slot);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    window.dispatchEvent(new Event('smoke:pause'));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new Event('smoke:resume'));
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-80 flex items-end justify-center sm:items-center sm:p-6"
      data-no-burst
    >
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-roast-900/70 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={dish.name}
        initial={{ opacity: 0, y: 24, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.99 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden bg-parchment-50"
      >
        {/* Wide photo banner — the dish breathes instead of being squeezed into a side column */}
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-60">
          <img src={media.src} alt={media.alt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-roast-900/90 via-roast-900/25 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute end-3 top-3 z-10 grid size-9 cursor-pointer place-items-center rounded-full bg-roast-900/50 text-parchment-100 backdrop-blur-sm transition-colors hover:bg-roast-900/80 hover:text-parchment-50"
          >
            <X className="size-5" aria-hidden />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:px-8 sm:py-6">
            <h3 className="display text-3xl text-parchment-50 sm:text-4xl">{dish.name}</h3>
          </div>
        </div>

        {/* Scrollable recipe body */}
        <div data-lenis-prevent className="overflow-y-auto p-5 sm:p-8">
          <MetaGrid dish={dish} labels={labels} />
          <p className="mt-5 leading-relaxed text-espresso">{dish.teaser}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="kicker flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-saffron-600" aria-hidden />
              {labels.modalIngredients}
            </p>
            <span className="spec border border-saffron-500/30 bg-saffron-500/10 px-2 py-0.5 text-saffron-600">
              {labels.perKg}
            </span>
          </div>
          <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {dish.ingredients.map((ing) => (
              <li key={ing} className="flex items-baseline gap-2.5 text-sm leading-relaxed text-onyx">
                <span aria-hidden className="size-1.5 shrink-0 translate-y-[-1px] rounded-full bg-saffron-500" />
                {ing}
              </li>
            ))}
          </ul>

          <p className="kicker mt-9 flex items-center gap-2">
            <ChefHat className="size-4 text-saffron-600" aria-hidden />
            {labels.modalSteps}
          </p>
          <ol className="mt-4">
            {dish.steps.map((s, i) => (
              <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="spec grid size-8 place-items-center border border-saffron-500/40 bg-saffron-500/10 text-saffron-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {i < dish.steps.length - 1 && <span aria-hidden className="mt-1.5 w-px flex-1 bg-onyx/12" />}
                </div>
                <p className="pt-1.5 text-sm leading-relaxed text-onyx">{s}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 border-l-2 border-saffron-500 bg-saffron-500/8 p-4 sm:p-5">
            <p className="spec flex items-center gap-2 text-saffron-600">
              <Flame className="size-4" aria-hidden />
              {labels.modalTip}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-onyx">{dish.tip}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CtaBlock({ data }: { data: Data }) {
  return (
    <div className="mt-8 border-t border-onyx/12 pt-6 text-center lg:mt-6 lg:pt-5">
      <OrderButton source="dishes" variant="saffron">{data.cta}</OrderButton>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-espresso lg:text-[13px]">{data.ctaNote}</p>
    </div>
  );
}

function ArrowBtn({ dir, onClick, label }: { dir: Dir; onClick: () => void; label: string }) {
  const Icon = dir === -1 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-parchment-50/35 bg-roast-900/35 text-parchment-50 backdrop-blur-sm transition-all duration-300 hover:border-saffron-400 hover:bg-saffron-500 hover:text-onyx active:scale-95 lg:size-12',
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

export function SceneDishes({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const [[active, dir], setSlide] = useState<[number, Dir]>([0, 1]);
  const n = data.items.length;

  const go = (d: Dir) => setSlide(([i]) => [(i + d + n) % n, d]);
  const goTo = (i: number) => setSlide(([prev]) => (i === prev ? [prev, 1] : [i, i > prev ? 1 : -1]));

  const dish = data.items[active];
  const media = getSlot(dish.slot);
  const D = (d: number) => (reduce ? 0 : d);

  /* Pre-warm all slide photos so arrow clicks wipe instantly. */
  useEffect(() => {
    data.items.forEach((it) => {
      const im = new Image();
      im.src = getSlot(it.slot).src;
    });
  }, [data.items]);

  function onOpen(i: number) {
    setOpen(i);
    track('recipe_open', { dish: data.items[i].name });
  }

  return (
    <>
      {/* Section is taller than the viewport on desktop only to create a short sticky
          "hold" while scrolling past — the visible block itself is exactly one screen. */}
      <section id="dishes" className="relative bg-parchment-200 lg:h-[150vh]">
        <div className="grid lg:sticky lg:top-0 lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
        {/* LEFT — manual slider: arrows, swipe, horizontal curtain-wipe */}
        <motion.div
          className="relative h-[64vh] touch-pan-y select-none overflow-hidden bg-roast-900 sm:h-[72vh] lg:h-auto"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) go(1);
            else if (info.offset.x > 70) go(-1);
          }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={media.src}
              className="absolute inset-0"
              initial={{ clipPath: dir === 1 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0%)' }}
              exit={{ scale: 1.05, transition: { duration: D(0.9), ease: 'easeOut' } }}
              transition={{ duration: D(0.65), ease: WIPE }}
            >
              <motion.img
                src={media.src}
                alt={media.alt}
                draggable={false}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: D(1.1), ease: EASE }}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence initial={false}>
            <motion.div
              key={`edge-${media.src}`}
              className="absolute inset-y-0 z-10 w-0.5 bg-saffron-400/90"
              initial={{ left: dir === 1 ? '100%' : '0%', opacity: 1 }}
              animate={{ left: dir === 1 ? '0%' : '100%', opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: D(0.65), ease: WIPE, opacity: { times: [0, 0.85, 1], duration: D(0.65) } }}
            />
          </AnimatePresence>

          <span className="spec absolute left-5 top-5 z-20 rounded-[2px] bg-roast-900/60 px-2.5 py-1.5 text-parchment-100/90 backdrop-blur-sm lg:left-6 lg:top-[calc(var(--header-h)+1rem)]">
            {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>

          {/* Classic slider arrows, vertically centered at the edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-4 lg:px-5">
            <ArrowBtn dir={-1} onClick={() => go(-1)} label="Попередня страва" />
            <ArrowBtn dir={1} onClick={() => go(1)} label="Наступна страва" />
          </div>

          {/* Dish caption + the animated recipe button */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-roast-900/90 via-roast-900/50 to-transparent p-6 pt-24 sm:p-7 lg:p-10 lg:pt-28">
            <div key={active} className="mx-auto max-w-xl px-12 text-center lg:px-14">
              <div className="overflow-hidden">
                <motion.h3
                  initial={{ y: '112%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: D(0.55), ease: EASE, delay: D(0.12) }}
                  className="display text-parchment-50 text-[clamp(1.5rem,2.2vw,2.2rem)]"
                >
                  {dish.name}
                </motion.h3>
              </div>
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: '60%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: D(0.5), ease: EASE, delay: D(0.24) }}
                  className="mt-2 leading-relaxed text-parchment-100/85 max-lg:text-sm"
                >
                  {dish.teaser}
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: D(0.45), ease: EASE, delay: D(0.34) }}
                className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:gap-4"
              >
                <FactChips dish={dish} />
                <RecipeButton label={data.open} onClick={() => onOpen(active)} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — parchment panel: heading, dish list, the no-pressure CTA */}
        <div className="flex flex-col justify-center bg-parchment-100 px-5 py-14 sm:px-8 lg:py-6 lg:pt-[calc(var(--header-h)+0.75rem)] lg:pl-12 lg:pr-[max(1.5rem,calc((100vw-1440px)/2+3rem))]">
          <Heading data={data} />
          <ol className="mt-5 divide-y divide-onyx/12 max-lg:hidden">
            {data.items.map((it, i) => {
              const on = i === active;
              return (
                <li key={it.name}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={on}
                    className="group flex w-full cursor-pointer items-baseline gap-4 py-[0.6rem] text-left"
                  >
                    <span className={cn('spec w-7 shrink-0 transition-colors duration-300', on ? 'text-saffron-600' : 'text-walnut/70 group-hover:text-walnut')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'text-[15px] transition-all duration-300 lg:text-base',
                        on ? 'translate-x-1 font-semibold text-onyx' : 'text-espresso/75 group-hover:translate-x-0.5 group-hover:text-onyx',
                      )}
                    >
                      {it.name}
                    </span>
                    <span aria-hidden className={cn('ml-auto h-px shrink-0 transition-all duration-500', on ? 'w-10 bg-saffron-500' : 'w-0 bg-onyx/25 group-hover:w-5')} />
                  </button>
                </li>
              );
            })}
          </ol>
          <CtaBlock data={data} />
        </div>
        </div>
      </section>

      <AnimatePresence>
        {open !== null && (
          <RecipeModal dish={data.items[open]} labels={data} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
