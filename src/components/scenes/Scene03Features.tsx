'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSlot } from '@/lib/media';
import type { SiteContent } from '@/lib/content';
import { useMediaQuery } from '@/components/shared/useMediaQuery';

type Data = SiteContent['home']['features'];

const EASE = [0.22, 1, 0.36, 1] as const;
const WIPE = [0.76, 0, 0.24, 1] as const;

/**
 * "Розберемо по швах" — the template's split section carried over as
 * scrollytelling: the left parchment panel (kicker + display heading + the
 * benefits list) pins while you scroll; rows light up one by one (hover gets
 * the same treatment), and the right half swaps a juicy context photo — or a
 * muted clip for slots that carry a video — with a curtain-wipe + masked
 * caption lines.
 */
function Heading({ data }: { data: Data }) {
  return (
    <>
      <p className="kicker">{data.kicker}</p>
      <h2 className="display mt-3 text-onyx text-[clamp(2rem,3.6vw,3.2rem)]">
        {data.title.split('\n').map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </h2>
    </>
  );
}

function DesktopPinned({ data }: { data: Data }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = data.items.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const idx = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  // Scroll owns the highlight and the right-side content; hover is only a
  // light, visually DIFFERENT affordance (CSS-only, never freezes the flow).
  const item = data.items[active];
  const media = getSlot(item.slot);

  /** Click a row → jump the window scroll to that row's segment of the pin. */
  function jumpTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.offsetTop;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / n) * span, behavior: 'smooth' });
  }

  return (
    <section ref={ref} style={{ height: `${n * 52 + 30}vh` }} className="relative bg-parchment-200">
      <div className="sticky top-0 grid h-dvh grid-cols-2 overflow-hidden">
        {/* LEFT — pinned parchment panel with the highlighting list */}
        <div className="flex flex-col justify-center bg-parchment-100 py-8 pl-[max(1.5rem,calc((100vw-1440px)/2+3rem))] pr-10">
          <Heading data={data} />
          <ol className="mt-7 divide-y divide-onyx/12">
            {data.items.map((it, i) => {
              const on = i === active;
              return (
                <li key={it.label}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={on}
                    className="group flex w-full cursor-pointer items-baseline gap-4 py-[0.65rem] text-left"
                  >
                    {/* Active (scroll) = saffron number + bold + saffron dash.
                        Hover = a clearly DIFFERENT, lighter cue: text darkens,
                        tiny slate dash — never steals the active treatment. */}
                    <span
                      className={cn(
                        'spec w-7 shrink-0 transition-colors duration-300',
                        on ? 'text-saffron-600' : 'text-walnut/70 group-hover:text-walnut',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'text-[15px] transition-all duration-300 lg:text-base',
                        on
                          ? 'translate-x-1 font-semibold text-onyx'
                          : 'text-espresso/75 group-hover:translate-x-0.5 group-hover:text-onyx',
                      )}
                    >
                      {it.label}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        'ml-auto h-px shrink-0 transition-all duration-500',
                        on ? 'w-10 bg-saffron-500' : 'w-0 bg-onyx/25 group-hover:w-5',
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* RIGHT — juicy context photo/clip with a curtain-wipe + masked caption */}
        <div className="relative overflow-hidden bg-roast-900">
          {/* Media stack: the new photo wipes down over the old one */}
          <AnimatePresence initial={false}>
            <motion.div
              key={media.src}
              className="absolute inset-0"
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              // The old photo stays beneath and slowly drifts while the new one
              // wipes down over it (also keeps it mounted for the wipe's length).
              exit={{ scale: 1.05, transition: { duration: 0.9, ease: 'easeOut' } }}
              transition={{ duration: 0.75, ease: WIPE }}
            >
              {media.videoSrc ? (
                <motion.video
                  src={media.videoSrc}
                  poster={media.src}
                  aria-label={media.alt}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  initial={{ scale: 1.12 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.2, ease: EASE }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <motion.img
                  src={media.src}
                  alt={media.alt}
                  initial={{ scale: 1.12 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.2, ease: EASE }}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Saffron wipe edge riding the reveal line */}
          <AnimatePresence initial={false}>
            <motion.div
              key={`edge-${media.src}`}
              className="absolute inset-x-0 z-10 h-0.5 bg-saffron-400/90"
              initial={{ top: '0%', opacity: 1 }}
              animate={{ top: '100%', opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: WIPE, opacity: { times: [0, 0.85, 1], duration: 0.75 } }}
            />
          </AnimatePresence>

          {/* Counter */}
          <span className="spec absolute right-6 top-[calc(var(--header-h)+1.25rem)] z-20 rounded-[2px] bg-roast-900/60 px-2.5 py-1.5 text-parchment-100/90 backdrop-blur-sm">
            {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>

          {/* Caption: gradient + line-masked title and text. Keyed remount (no
              exit queue) so rapid scrolling can never show a stale caption.
              Extra bottom padding keeps the text clear of the scroll badge. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-roast-900/90 via-roast-900/45 to-transparent p-7 pt-24 pb-32 lg:p-10 lg:pt-28 lg:pb-36">
            <div key={active}>
              <div className="overflow-hidden">
                <motion.h3
                  initial={{ y: '112%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.55, ease: EASE, delay: 0.15 }}
                  className="display text-parchment-50 text-[clamp(1.5rem,2.2vw,2.2rem)]"
                >
                  {item.title}
                </motion.h3>
              </div>
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: '60%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.28 }}
                  className="mt-3 max-w-md leading-relaxed text-parchment-100/85"
                >
                  {item.text}
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll-down hint — readable capsule on the seam: a porthole with
            chevrons streaming down + a clear label. Gone on the last item. */}
        <div
          aria-hidden={active >= n - 1}
          className={cn(
            'pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 transition-opacity duration-500',
            active >= n - 1 ? 'opacity-0' : 'opacity-100',
          )}
        >
          <div className="flex items-center gap-3 rounded-full border border-parchment-50/15 bg-roast-900/65 py-2.5 pl-3 pr-6 backdrop-blur-md">
            <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-parchment-50/10">
              {[0, 0.8].map((delay) => (
                <motion.span
                  key={delay}
                  className="absolute grid place-items-center"
                  animate={{ y: [-16, 16], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay }}
                >
                  <ChevronDown className="size-4 text-saffron-300" aria-hidden />
                </motion.span>
              ))}
            </span>
            <span className="text-sm font-semibold tracking-wide text-parchment-50">{data.hint}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Phones / reduced motion: one feature per screen, story-style. The photo (or
 * clip) fills a stage sized to the viewport, the caption sits on a dark
 * gradient at the bottom, seven progress segments run along the top. Swipe,
 * tap the edges, or use the arrows.
 */
function MobileStories({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const [[active, dir], setSlide] = useState<[number, 1 | -1]>([0, 1]);
  const n = data.items.length;
  const item = data.items[active];
  const media = getSlot(item.slot);
  const D = (d: number) => (reduce ? 0 : d);
  const go = (d: 1 | -1) => setSlide(([i]) => [Math.max(0, Math.min(n - 1, i + d)), d]);

  return (
    <section className="bg-parchment-200 py-14">
      <div className="px-5 sm:px-8">
        <Heading data={data} />
      </div>

      <div className="mt-6 px-5 sm:px-8">
        <motion.div
          role="group"
          aria-roledescription="слайд"
          aria-label={`${active + 1} / ${n} · ${item.label}`}
          className="relative touch-pan-y select-none overflow-hidden rounded-[3px] bg-roast-900"
          style={{ height: 'min(calc(100dvh - var(--header-h) - 6.5rem), 640px)' }}
          drag={reduce ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
        >
          {/* Media, wiping in from the swipe direction */}
          <AnimatePresence initial={false}>
            <motion.div
              key={media.src}
              className="absolute inset-0"
              initial={{ clipPath: dir === 1 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0%)' }}
              exit={{ scale: 1.05, transition: { duration: D(0.8), ease: 'easeOut' } }}
              transition={{ duration: D(0.6), ease: WIPE }}
            >
              {media.videoSrc ? (
                <video src={media.videoSrc} poster={media.src} muted loop autoPlay playsInline preload="metadata" aria-label={media.alt} className="h-full w-full object-cover" />
              ) : (
                <motion.img
                  src={media.src}
                  alt={media.alt}
                  draggable={false}
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: D(1.1), ease: EASE }}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Story progress */}
          <div className="absolute inset-x-3 top-3 z-20 flex gap-1" aria-hidden>
            {data.items.map((_, i) => (
              <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-parchment-50/25">
                <motion.span
                  className="block h-full origin-left bg-saffron-400"
                  initial={false}
                  animate={{ scaleX: i < active ? 1 : i === active ? 1 : 0 }}
                  transition={{ duration: i === active ? D(0.5) : 0, ease: EASE }}
                />
              </span>
            ))}
          </div>

          {/* Tap zones: left third back, right two thirds forward */}
          <button type="button" aria-label="Попередня перевага" onClick={() => go(-1)} className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer" />
          <button type="button" aria-label="Наступна перевага" onClick={() => go(1)} className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-pointer" />

          {/* Caption over the bottom gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-roast-900 via-roast-900/70 to-transparent px-5 pb-5 pt-28">
            <div key={active}>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: D(0.4), ease: EASE, delay: D(0.1) }}
                className="spec text-saffron-300"
              >
                {String(active + 1).padStart(2, '0')} · {item.label}
              </motion.p>
              <div className="overflow-hidden">
                <motion.h3
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: D(0.5), ease: EASE, delay: D(0.15) }}
                  className="display mt-1.5 text-[1.7rem] leading-tight text-parchment-50"
                >
                  {item.title}
                </motion.h3>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: D(0.45), ease: EASE, delay: D(0.28) }}
                className="mt-2.5 text-[13.5px] leading-relaxed text-parchment-100/88"
              >
                {item.text}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Controls under the stage */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => go(d)}
                disabled={d === -1 ? active === 0 : active === n - 1}
                aria-label={d === -1 ? 'Попередня перевага' : 'Наступна перевага'}
                className="grid size-11 cursor-pointer place-items-center rounded-full border border-onyx/20 text-onyx transition-colors hover:border-saffron-500 hover:bg-saffron-500 disabled:cursor-default disabled:opacity-35"
              >
                {d === -1 ? <ChevronLeft className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Scene03Features({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  if (isDesktop && !reduce) return <DesktopPinned data={data} />;
  return <MobileStories data={data} />;
}
