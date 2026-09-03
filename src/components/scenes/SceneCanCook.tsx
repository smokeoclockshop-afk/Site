'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteContent } from '@/lib/content';

type Data = SiteContent['home']['recipes'];
type Dir = 1 | -1;

const EASE = [0.22, 1, 0.36, 1] as const;
const WIPE = [0.76, 0, 0.24, 1] as const;

function ArrowBtn({ dir, onClick, label }: { dir: Dir; onClick: () => void; label: string }) {
  const Icon = dir === -1 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-parchment-50/35 bg-roast-900/35 text-parchment-50 backdrop-blur-sm transition-all duration-300 hover:border-saffron-400 hover:bg-saffron-500 hover:text-onyx active:scale-95 lg:size-12"
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

/**
 * "What can a smoker actually cook" — a full-screen arrow slider with a short
 * sticky hold (same mini-pin as the dishes block), 12 appetizing slides that
 * sell what long smoke does better than any regular cooking.
 */
export function SceneCanCook({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const [[active, dir], setSlide] = useState<[number, Dir]>([0, 1]);
  const n = data.items.length;

  const go = (d: Dir) => setSlide(([i]) => [(i + d + n) % n, d]);
  const goTo = (i: number) => setSlide(([prev]) => (i === prev ? [prev, 1] : [i, i > prev ? 1 : -1]));

  const item = data.items[active];
  const D = (d: number) => (reduce ? 0 : d);

  /* Pre-warm all slide photos so arrow clicks wipe instantly. */
  useEffect(() => {
    data.items.forEach((it) => {
      const im = new Image();
      im.src = it.img;
    });
  }, [data.items]);

  return (
    <section id="cancook" className="relative bg-parchment-200 lg:h-[150vh]">
      {/* Short sticky hold: exactly one screen, released after ~half a scroll. */}
      <div className="grid lg:sticky lg:top-0 lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
        {/* LEFT — the slider */}
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
              key={item.img}
              className="absolute inset-0"
              initial={{ clipPath: dir === 1 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0%)' }}
              exit={{ scale: 1.05, transition: { duration: D(0.9), ease: 'easeOut' } }}
              transition={{ duration: D(0.65), ease: WIPE }}
            >
              <motion.img
                src={item.img}
                alt={item.name}
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
              key={`edge-${item.img}`}
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

          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-4 lg:px-5">
            <ArrowBtn dir={-1} onClick={() => go(-1)} label="Попередня страва" />
            <ArrowBtn dir={1} onClick={() => go(1)} label="Наступна страва" />
          </div>

          {/* Slide caption: tag, name and the "why it's cool" story */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-roast-900/95 via-roast-900/55 to-transparent p-6 pt-24 sm:p-7 lg:p-9 lg:pt-28">
            <div key={active} className="mx-auto max-w-xl px-10 text-center lg:px-12">
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: D(0.45), ease: EASE, delay: D(0.1) }}
                  className="kicker text-saffron-300"
                >
                  {item.tag}
                </motion.p>
              </div>
              <div className="overflow-hidden">
                <motion.h3
                  initial={{ y: '112%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: D(0.55), ease: EASE, delay: D(0.16) }}
                  className="display mt-1 text-parchment-50 text-[clamp(1.4rem,2vw,2rem)]"
                >
                  {item.name}
                </motion.h3>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: D(0.5), ease: EASE, delay: D(0.3) }}
                className="mt-2.5 text-sm leading-relaxed text-parchment-100/85 lg:text-[15px]"
              >
                {item.text}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — parchment panel: pitch + the full menu of 12 */}
        <div className="flex flex-col justify-center bg-parchment-100 px-5 py-12 sm:px-8 lg:py-6 lg:pt-[calc(var(--header-h)+0.5rem)] lg:pl-12 lg:pr-[max(1.5rem,calc((100vw-1440px)/2+3rem))]">
          <p className="kicker">{data.kicker}</p>
          <h2 className="display mt-2 text-onyx text-[clamp(1.7rem,2.5vw,2.5rem)]">
            {data.title.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-espresso lg:text-[15px]">{data.lead}</p>

          <ol className="mt-4 divide-y divide-onyx/10 max-lg:hidden">
            {data.items.map((it, i) => {
              const on = i === active;
              return (
                <li key={it.name}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={on}
                    className="group flex w-full cursor-pointer items-baseline gap-3 py-[0.32rem] text-left"
                  >
                    <span className={cn('spec w-6 shrink-0 text-[11px] transition-colors duration-300', on ? 'text-saffron-600' : 'text-walnut/60 group-hover:text-walnut')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'text-[13.5px] transition-all duration-300 lg:text-sm',
                        on ? 'translate-x-1 font-semibold text-onyx' : 'text-espresso/70 group-hover:translate-x-0.5 group-hover:text-onyx',
                      )}
                    >
                      {it.name}
                    </span>
                    <span aria-hidden className={cn('ml-auto h-px shrink-0 transition-all duration-500', on ? 'w-8 bg-saffron-500' : 'w-0 bg-onyx/25 group-hover:w-4')} />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
