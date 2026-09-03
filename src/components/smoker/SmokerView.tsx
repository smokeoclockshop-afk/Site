'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Expand, MoveHorizontal, ShieldCheck, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getSlot } from '@/lib/media';
import type { SiteContent, SmokerModel } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Slot } from '@/components/ui/Slot';
import { Reveal } from '@/components/ui/Reveal';
import { Odometer } from '@/components/shared/Odometer';
import { OrderButton } from '@/components/order/OrderButton';
import { StickyCtaBar } from '@/components/order/StickyCtaBar';
import { track } from '@/lib/analytics';

/* eslint-disable @next/next/no-img-element */

type Data = SiteContent['smoker'];
type Labels = Data['labels'];
type Photo = { src: string; alt: string };

const EASE = [0.22, 1, 0.36, 1] as const;
const fmt = new Intl.NumberFormat('uk-UA');
const digits = (s: string) => Number(s.replace(/\D/g, '')) || 0;
const pad = (n: number) => String(n).padStart(2, '0');

/* ── Tilt stage: the product leans with the cursor ─────────────────── */

function TiltStage({ children, disabled, className }: { children: React.ReactNode; disabled: boolean; className?: string }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 18, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 140, damping: 18, mass: 0.6 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 9);
    rx.set(-py * 9);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className={className} style={{ perspective: 1400 }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}>{children}</motion.div>
    </div>
  );
}

/* ── Lightbox ──────────────────────────────────────────────────────── */

function Lightbox({ photos, index, labels, onClose, onIndex }: { photos: Photo[]; index: number; labels: Labels; onClose: () => void; onIndex: (i: number) => void }) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const n = photos.length;

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = 'hidden';
    window.dispatchEvent(new Event('smoke:pause'));
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % n);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new Event('smoke:resume'));
      document.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [onClose, onIndex, index, n]);

  const p = photos[index];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-80 flex items-center justify-center bg-roast-900/92 p-4 sm:p-8"
      data-no-burst
    >
      <button aria-label={labels.close} onClick={onClose} className="absolute inset-0 cursor-default" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={p.alt}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
        className="relative z-10 w-full max-w-6xl"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-roast-800 sm:aspect-[3/2]">
          <AnimatePresence initial={false}>
            <motion.img
              key={p.src}
              src={p.src}
              alt={p.alt}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </AnimatePresence>
          {n > 1 && (
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => onIndex((index + dir + n) % n)}
                  aria-label={dir === -1 ? labels.prev : labels.next}
                  className="pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-parchment-50/35 bg-roast-900/40 text-parchment-50 backdrop-blur-sm transition-colors hover:border-saffron-400 hover:bg-saffron-500 hover:text-onyx"
                >
                  {dir === -1 ? <ChevronLeft className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-parchment-100/80">
          <span className="text-sm">{p.alt}</span>
          <span className="spec">{pad(index + 1)} / {pad(n)}</span>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className="absolute -top-12 right-0 grid size-10 cursor-pointer place-items-center text-parchment-100 transition-colors hover:text-parchment-50"
        >
          <X className="size-6" aria-hidden />
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── Model switcher ────────────────────────────────────────────────── */

function ModelSwitcher({ models, active, onPick, label }: { models: SmokerModel[]; active: number; onPick: (i: number) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {models.map((m, i) => {
        const on = i === active;
        const cover = getSlot(m.cover);
        return (
          <button
            key={m.slug}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onPick(i)}
            className={cn(
              'group relative flex cursor-pointer items-center gap-3 border p-2 pr-4 text-left transition-colors duration-300',
              on ? 'border-onyx/40' : 'border-onyx/12 hover:border-onyx/30',
            )}
          >
            {on && (
              <motion.span
                layoutId="smoker-tab-bg"
                className="absolute inset-0 bg-parchment-50"
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            )}
            <span className="relative size-14 shrink-0 overflow-hidden bg-parchment-50 sm:size-16">
              <img src={cover.src} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </span>
            <span className="relative min-w-0">
              <span className={cn('block truncate text-sm font-semibold transition-colors', on ? 'text-onyx' : 'text-espresso group-hover:text-onyx')}>{m.short}</span>
              <span className={cn('spec mt-0.5 block', m.onRequest ? 'text-walnut' : 'text-saffron-600')}>{m.price}</span>
            </span>
            {on && <motion.span layoutId="smoker-tab-line" className="absolute inset-x-0 bottom-0 h-0.5 bg-saffron-500" />}
          </button>
        );
      })}
    </div>
  );
}

/* ── Configurator (flagship) ───────────────────────────────────────── */

function Configurator({ data, opts, onToggle }: { data: Data; opts: Set<string>; onToggle: (id: string) => void }) {
  return (
    <div className="space-y-2">
      {data.options.map((o) => (
        <label
          key={o.id}
          className="flex cursor-pointer items-center justify-between gap-3 border border-onyx/14 px-4 py-3 transition-colors hover:border-onyx/25 has-[:checked]:border-saffron-500/60 has-[:checked]:bg-saffron-500/8"
        >
          <span className="flex items-center gap-3 text-sm text-onyx">
            <input type="checkbox" checked={opts.has(o.id)} onChange={() => onToggle(o.id)} className="size-4 accent-saffron-500" />
            {o.label}
          </span>
          <span className="spec text-walnut">+{fmt.format(o.price)} ₴</span>
        </label>
      ))}
    </div>
  );
}

/* ── Anatomy hotspots (flagship) ───────────────────────────────────── */

function Anatomy({ data, model, reduce }: { data: Data['anatomy']; model: SmokerModel; reduce: boolean }) {
  const [active, setActive] = useState(0);
  const cover = getSlot(model.cover);
  const spot = data.hotspots[active];

  return (
    <section className="bg-parchment-100 py-20">
      <Container>
        <Reveal>
          <p className="kicker">{data.kicker}</p>
          <h2 className="display mt-3 text-onyx text-[clamp(1.9rem,3.4vw,3rem)]">
            <span className="lg:hidden">{data.titleTouch}</span>
            <span className="hidden lg:inline">{data.title}</span>
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-espresso">{data.lead}</p>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-8">
          {/* Phones: the render stays pinned under the header while the list scrolls,
              so tapping a detail never means scrolling back up to see it. */}
          <div className="sticky top-[calc(var(--header-h)+0.5rem)] z-10 self-start bg-parchment-100 pb-3 lg:static lg:z-auto lg:pb-0">
          <Reveal>
            <div className="relative overflow-hidden border border-onyx/12 bg-parchment-50">
              <img src={cover.src} alt={cover.alt} className="aspect-[4/3] w-full object-cover" />
              {data.hotspots.map((h, i) => {
                const on = i === active;
                return (
                  <button
                    key={h.label}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-label={h.label}
                    aria-pressed={on}
                    className="group absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  >
                    {/* Only the active dot glows and pulses; the rest sit quietly on the render. */}
                    {on && !reduce && (
                      <motion.span
                        aria-hidden
                        className="absolute size-8 rounded-full bg-saffron-500/45"
                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                    <span
                      className={cn(
                        'relative grid place-items-center rounded-full border-2 border-parchment-50 text-[11px] font-bold shadow-[0_6px_16px_-6px_rgb(28_24_20/0.6)] transition-all duration-300',
                        on ? 'size-8 bg-saffron-500 text-onyx' : 'size-6 bg-onyx/75 text-parchment-50 group-hover:bg-onyx',
                      )}
                    >
                      {i + 1}
                    </span>
                  </button>
                );
              })}
              {/* Floating label near the active dot */}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className={cn('pointer-events-none absolute z-10 max-w-[220px] bg-onyx px-3 py-2 text-xs font-semibold text-parchment-50 shadow-lg', spot.x > 60 ? '-translate-x-full' : '')}
                  style={{ left: `calc(${spot.x}% + ${spot.x > 60 ? '-28px' : '28px'})`, top: `calc(${spot.y}% - 14px)` }}
                >
                  {spot.label}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
          </div>

          <ol className="divide-y divide-onyx/12">
            {data.hotspots.map((h, i) => {
              const on = i === active;
              return (
                <li key={h.label}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-expanded={on}
                    className="group flex w-full cursor-pointer items-start gap-4 py-3.5 text-left"
                  >
                    <span className={cn('spec mt-0.5 w-6 shrink-0 transition-colors', on ? 'text-saffron-600' : 'text-walnut/70')}>{pad(i + 1)}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-[15px] transition-all duration-300', on ? 'translate-x-1 font-semibold text-onyx' : 'text-espresso/70 group-hover:text-onyx')}>{h.label}</span>
                      <motion.span
                        initial={false}
                        animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }}
                        transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                        className="block overflow-hidden"
                      >
                        <span className="block pt-1.5 text-sm leading-relaxed text-espresso">{h.text}</span>
                      </motion.span>
                    </span>
                    <span aria-hidden className={cn('mt-3 h-px shrink-0 transition-all duration-500', on ? 'w-8 bg-saffron-500' : 'w-0 bg-onyx/25 group-hover:w-4')} />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/* ── Design lineup: the four body shapes side by side ──────────────── */

const LINEUP_WIDTHS = ['lg:w-[34%]', 'lg:w-[26%]', 'lg:w-[24%]', 'lg:w-[17%]'];

function DesignLineup({
  data,
  models,
  active,
  reduce,
}: {
  data: Data['design'];
  models: SmokerModel[];
  active: number;
  reduce: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  // Hover previews a shape, a click pins it; the page model itself is chosen
  // in the switcher up top — nothing here moves the page or reflows the hero.
  const shown = hover ?? pinned ?? active;
  const item = data.items[shown] ?? data.items[0];
  const model = models[shown] ?? models[0];
  const choose = (i: number) => setPinned(i);

  return (
    <section className="bg-parchment-50 py-20">
      <Container>
        <Reveal>
          <p className="kicker">{data.kicker}</p>
          <h2 className="display mt-3 text-onyx text-[clamp(1.9rem,3.4vw,3rem)]">{data.title}</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-espresso">{data.lead}</p>
        </Reveal>

        {/* Silhouettes on one floor line, sized roughly to scale */}
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 lg:flex lg:items-end lg:justify-between lg:gap-6" onMouseLeave={() => setHover(null)}>
          {models.map((m, i) => {
            const cover = getSlot(m.cover);
            const on = shown === i;
            return (
              <motion.button
                key={m.slug}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => choose(i)}
                aria-pressed={pinned === i}
                aria-label={`${data.pickCta}: ${m.name}`}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
                className={cn('group relative flex w-full cursor-pointer flex-col items-center text-center', LINEUP_WIDTHS[i])}
              >
                <motion.span
                  animate={{ opacity: hover === null || on ? 1 : 0.45, y: on && hover !== null ? -10 : 0, scale: on && hover !== null ? 1.03 : 1 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                  className="block w-full"
                >
                  <img src={cover.src} alt={cover.alt} loading="lazy" className="w-full object-contain" />
                </motion.span>
                <span className="mt-2 flex w-full flex-col items-center border-t border-onyx/15 pt-3">
                  <span className={cn('display text-[1.05rem] leading-tight transition-colors sm:text-lg', on ? 'text-onyx' : 'text-espresso/80')}>{m.short}</span>
                  <span className={cn('spec mt-1 transition-colors', on ? 'text-saffron-600' : 'text-walnut')}>{data.items[i]?.note}</span>
                  {on && <motion.span layoutId="lineup-line" className="mt-3 h-0.5 w-10 bg-saffron-500" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Design note for the highlighted shape */}
        <div className="mt-8 border border-onyx/12 bg-parchment-100 p-6 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={model.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"
            >
              <div>
                <p className="kicker">{item.note}</p>
                <h3 className="display mt-2 text-[clamp(1.4rem,2.4vw,2rem)] text-onyx">{model.name}</h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-espresso">{item.detail}</p>
              </div>
              <p className="spec text-walnut lg:justify-self-end">{data.selectedLabel}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}

/* ── Work strip (draggable) ────────────────────────────────────────── */

const TILTS = [-2, 1.5, -1, 2, -1.5, 1, -2, 1.5];

function WorkStrip({ data, reduce, onOpen }: { data: Data['work']; reduce: boolean; onOpen: (i: number) => void }) {
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <section className="overflow-hidden bg-roast-900 py-20 text-parchment-50" data-dark-bg>
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="kicker text-saffron-300">{data.kicker}</p>
            <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,3rem)] text-parchment-50">{data.title}</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-parchment-100/75">{data.lead}</p>
          </div>
          <span className="spec inline-flex items-center gap-2 text-parchment-100/60 max-lg:hidden">
            <MoveHorizontal className="size-4 text-saffron-300" aria-hidden />
            {data.dragHint}
          </span>
        </Reveal>
      </Container>
      <div ref={dragRef} className="mt-10 overflow-hidden pl-5 sm:pl-8 lg:pl-[max(2rem,calc((100vw-1440px)/2+3rem))]">
        <motion.div
          drag={reduce ? false : 'x'}
          dragConstraints={dragRef}
          dragElastic={0.08}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setTimeout(() => setDragging(false), 50)}
          className={cn('flex w-max gap-5 pr-10', reduce ? '' : 'cursor-grab active:cursor-grabbing')}
        >
          {data.items.map((it, i) => (
            <motion.figure
              key={it.src}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(i, 4) * 0.06 }}
              className="w-64 shrink-0 border border-parchment-50/12 bg-parchment-50 p-2 pb-3 sm:w-80"
              style={{ rotate: reduce ? 0 : TILTS[i % TILTS.length] }}
            >
              <button
                type="button"
                onClick={() => {
                  if (!dragging) onOpen(i);
                }}
                aria-label={it.alt}
                className="group relative block w-full cursor-pointer overflow-hidden"
              >
                <img src={it.src} alt={it.alt} draggable={false} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-roast-900/55 text-parchment-50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <Expand className="size-4" aria-hidden />
                </span>
              </button>
              <figcaption className="spec mt-2.5 text-center text-onyx/80">{it.caption}</figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export function SmokerView({ data, stickyBar }: { data: Data; stickyBar: SiteContent['stickyBar'] }) {
  const reduce = !!useReducedMotion();
  const models = data.models;
  const [active, setActive] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [opts, setOpts] = useState<Set<string>>(new Set());
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lb, setLb] = useState<{ list: Photo[]; index: number } | null>(null);

  const model = models[active];
  const cover = getSlot(model.cover);
  const gallery = useMemo<Photo[]>(
    () => model.gallery.map((src, i) => ({ src, alt: i === 0 ? cover.alt : `${model.name} — ${data.labels.photos} ${i + 1}` })),
    [model, cover.alt, data.labels.photos],
  );
  const workPhotos = useMemo<Photo[]>(() => data.work.items.map((w) => ({ src: w.src, alt: w.alt })), [data.work.items]);

  const base = digits(model.price);
  const total = base + data.options.filter((o) => opts.has(o.id)).reduce((s, o) => s + o.price, 0);
  const selectedLabels = data.options.filter((o) => opts.has(o.id)).map((o) => o.label);

  /** Switch model: reset the photo + options, mirror into ?m=<slug>. */
  const pick = useCallback(
    (i: number) => {
      setActive(i);
      setPhoto(0);
      setOpts(new Set());
      const url = new URL(window.location.href);
      if (i === 0) url.searchParams.delete('m');
      else url.searchParams.set('m', models[i].slug);
      window.history.replaceState(window.history.state, '', url);
      track('smoker_model', { model: models[i].slug });
    },
    [models],
  );

  // Deep link (/smoker?m=<slug>) — read once after hydration.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const m = new URLSearchParams(window.location.search).get('m');
      const i = models.findIndex((x) => x.slug === m);
      if (i > 0) setActive(i);
    });
    return () => window.cancelAnimationFrame(id);
  }, [models]);

  function toggle(id: string) {
    setOpts((prev) => {
      const next = new Set(prev);
      const checked = !next.has(id);
      if (checked) next.add(id);
      else next.delete(id);
      track('config_change', { option: id, checked });
      return next;
    });
  }

  const closeLb = useCallback(() => setLb(null), []);
  const lbIndex = useCallback((i: number) => setLb((prev) => (prev ? { ...prev, index: i } : prev)), []);

  const crossSlug = (slot: string) => slot.split('.').pop() ?? '';

  return (
    <>
      {/* ── Hero: switcher + model stage ─────────────────────────── */}
      <section className="pt-[calc(var(--header-h)+2.5rem)] pb-16">
        <Container>
          <p className="kicker">{data.kicker}</p>
          <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <h1 className="display text-onyx text-[clamp(2.5rem,6vw,4.5rem)]">{data.title}</h1>
            <p className="max-w-md leading-relaxed text-espresso lg:text-right lg:text-[15px]">{data.intro}</p>
          </div>

          <div id="smoker-stage" className="mt-8 scroll-mt-[calc(var(--header-h)+1rem)]">
            <ModelSwitcher models={models} active={active} onPick={pick} label={data.switcherLabel} />
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
            {/* Visual — pinned while the longer panel scrolls past (min-w-0: the
                thumbnail scroller must not widen the column) */}
            <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
              <TiltStage disabled={reduce} className="relative">
                <div className="relative aspect-[4/3] overflow-hidden border border-onyx/12 bg-parchment-50">
                  <AnimatePresence initial={false}>
                    <motion.img
                      key={`${model.slug}-${photo}`}
                      src={gallery[photo].src}
                      alt={gallery[photo].alt}
                      initial={{ opacity: 0, scale: 1.03, x: 18 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.99, x: -12 }}
                      transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>
                  {model.badge && <span className="spec absolute left-3 top-3 z-10 bg-onyx px-2 py-1 text-parchment-50">{model.badge}</span>}
                  <button
                    type="button"
                    onClick={() => setLb({ list: gallery, index: photo })}
                    aria-label={data.labels.open}
                    className="absolute right-3 top-3 z-10 grid size-10 cursor-pointer place-items-center rounded-full border border-onyx/15 bg-parchment-50/85 text-onyx backdrop-blur-sm transition-colors hover:border-saffron-500 hover:bg-saffron-500"
                  >
                    <Expand className="size-4" aria-hidden />
                  </button>
                  <span className="spec absolute bottom-3 right-3 z-10 rounded-[2px] bg-roast-900/55 px-2 py-1 text-parchment-100 backdrop-blur-sm">
                    {pad(photo + 1)} / {pad(gallery.length)}
                  </span>
                </div>
              </TiltStage>

              <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((g, i) => (
                  <button
                    key={g.src}
                    type="button"
                    onClick={() => setPhoto(i)}
                    aria-label={`${data.labels.photos} ${i + 1}`}
                    aria-current={i === photo}
                    className={cn(
                      'relative aspect-[4/3] w-20 shrink-0 cursor-pointer overflow-hidden border bg-parchment-50 transition-[border-color,opacity] sm:w-24',
                      i === photo ? 'border-saffron-500' : 'border-transparent opacity-65 hover:opacity-100',
                    )}
                  >
                    <img src={g.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Panel */}
            <div className="min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={model.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                >
                  <h2 className="display text-onyx text-[clamp(1.9rem,3.2vw,2.8rem)]">{model.name}</h2>
                  <p className="mt-3 leading-relaxed text-espresso">{model.tagline}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-onyx/85">{model.description}</p>

                  <div className="mt-5 border-l-2 border-saffron-500 bg-saffron-500/8 px-4 py-3">
                    <p className="spec text-saffron-600">{data.labels.forWhom}</p>
                    <p className="mt-1 text-sm leading-relaxed text-onyx">{model.forWhom}</p>
                  </div>

                  <motion.dl
                    className="mt-6 grid grid-cols-2 gap-x-6 sm:grid-cols-3"
                    initial={reduce ? false : 'hidden'}
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                  >
                    {model.specs.map((s) => (
                      <motion.div
                        key={s.label}
                        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
                        className="border-b border-onyx/12 py-2.5"
                      >
                        <dt className="spec text-walnut">{s.label}</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-onyx">{s.value}</dd>
                      </motion.div>
                    ))}
                  </motion.dl>

                  <ul className="mt-5 space-y-1.5">
                    {model.highlights.map((h) => (
                      <li key={h} className="flex items-baseline gap-2.5 text-sm leading-relaxed text-onyx">
                        <span aria-hidden className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-saffron-500" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {/* Price + configurator */}
              <div className="mt-8 border-t border-onyx/12 pt-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    {model.onRequest ? (
                      <p className="display text-3xl text-onyx sm:text-4xl">{model.price}</p>
                    ) : (
                      <p className="display text-4xl text-onyx sm:text-5xl">
                        <Odometer value={`${fmt.format(total)} ₴`} className="font-[inherit]" />
                      </p>
                    )}
                    {model.perMonth && <p className="spec mt-1.5 text-walnut">{model.perMonth}</p>}
                  </div>
                  <span className="inline-flex items-center gap-2 border border-saffron-500/40 bg-saffron-500/10 px-3 py-2">
                    <ShieldCheck className="size-4 text-saffron-600" aria-hidden />
                    <span className="spec text-onyx">{data.warranty}</span>
                  </span>
                </div>
                {model.status && <p className="spec mt-3 text-walnut">{model.status}</p>}

                <div className="mt-6">
                  <p className="kicker mb-3">{data.optionsTitle}</p>
                  {model.configurator ? (
                    <Configurator data={data} opts={opts} onToggle={toggle} />
                  ) : (
                    <p className="border border-dashed border-onyx/20 px-4 py-3 text-sm leading-relaxed text-espresso">{data.optionsNote}</p>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <OrderButton source={`smoker:${model.slug}`} payload={{ product: model.name, config: selectedLabels }} variant="saffron">
                    {model.cta}
                    <ArrowRight className="size-4" aria-hidden />
                  </OrderButton>
                  <Link href={{ pathname: '/vyroby', query: { p: model.slug } }} className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-onyx underline underline-offset-4 hover:text-saffron-600">
                    {data.labels.specs}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Anatomy of the flagship ───────────────────────────────── */}
      <Anatomy data={data.anatomy} model={models[0]} reduce={reduce} />

      {/* ── Design lineup ─────────────────────────────────────────── */}
      <DesignLineup data={data.design} models={models} active={active} reduce={reduce} />

      {/* ── In the wild ───────────────────────────────────────────── */}
      <WorkStrip data={data.work} reduce={reduce} onOpen={(i) => setLb({ list: workPhotos, index: i })} />

      {/* ── Cooked ────────────────────────────────────────────────── */}
      <section className="py-20">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-onyx text-[clamp(1.7rem,3vw,2.6rem)]">{data.cookedTitle}</h2>
            <Link href="/#dishes" className="group inline-flex items-center gap-2 text-sm font-semibold text-onyx">
              {data.cookedCta}
              <ArrowRight className="size-4 text-saffron-600 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>
          <Reveal className="mt-8 grid gap-5 sm:grid-cols-3" stagger={0.08}>
            {data.cooked.map((c) => (
              <figure key={c.img} className="group border border-onyx/12 bg-parchment-50 p-2">
                <div className="overflow-hidden">
                  <img src={c.img} alt={c.title} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                </div>
                <figcaption className="px-2 pb-2 pt-3">
                  <p className="display text-lg leading-tight text-onyx">{c.title}</p>
                  <p className="spec mt-1 text-walnut">{c.note}</p>
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="bg-parchment-100 py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="display text-onyx text-[clamp(1.7rem,3vw,2.6rem)]">{data.faqTitle}</h2>
            </Reveal>
            <div className="mt-6 divide-y divide-onyx/12">
              {data.faq.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className={cn('border-l-2 pl-4 transition-colors', open ? 'border-saffron-500' : 'border-transparent')}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-onyx"
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="spec text-walnut">{pad(i + 1)}</span>
                        <span className="font-semibold">{f.q}</span>
                      </span>
                      <ChevronDown className={cn('size-5 shrink-0 text-walnut transition-transform duration-300', open && 'rotate-180')} aria-hidden />
                    </button>
                    <div className={cn('grid transition-[grid-template-rows] duration-300', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                      <div className="overflow-hidden">
                        <p className="pb-4 pl-8 leading-relaxed text-espresso">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Cross-sell ────────────────────────────────────────────── */}
      <section className="py-20">
        <Container>
          <Reveal>
            <h2 className="display text-onyx text-[clamp(1.7rem,3vw,2.6rem)]">{data.crossSellTitle}</h2>
          </Reveal>
          <Reveal className="mt-8 grid gap-5 sm:grid-cols-3" stagger={0.08}>
            {data.crossSell.map((c) => (
              <Link
                key={c.name}
                href={{ pathname: '/vyroby', query: { p: crossSlug(c.slot) } }}
                className="group relative flex flex-col border border-onyx/12 bg-parchment-50 p-2 transition-colors hover:border-onyx/35"
              >
                <Slot id={c.slot} className="bg-parchment-50" imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                <div className="flex items-end justify-between gap-3 px-2 pb-2 pt-3">
                  <div>
                    <p className="text-sm font-semibold text-onyx">{c.name}</p>
                    <p className="spec mt-1 text-saffron-600">{c.from}</p>
                  </div>
                  <ArrowRight className="mb-1 size-4 shrink-0 text-saffron-600 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </div>
                <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-saffron-500 transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="bg-parchment-100 py-20 text-center">
        <Container>
          <Reveal>
            <p className="kicker">{model.short}</p>
            <h2 className="display mt-3 text-onyx text-[clamp(1.8rem,4vw,3rem)]">{data.finalTitle}</h2>
            <div className="mt-8">
              <OrderButton source={`smoker-final:${model.slug}`} payload={{ product: model.name, config: selectedLabels }} variant="saffron">
                {model.cta}
              </OrderButton>
            </div>
          </Reveal>
        </Container>
      </section>

      <StickyCtaBar price={model.onRequest ? model.price : stickyBar.price} cta={stickyBar.cta} source={`sticky-smoker:${model.slug}`} threshold={500} />

      <AnimatePresence>
        {lb && <Lightbox key="lb" photos={lb.list} index={lb.index} labels={data.labels} onClose={closeLb} onIndex={lbIndex} />}
      </AnimatePresence>
    </>
  );
}
