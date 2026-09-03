'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getSlot } from '@/lib/media';
import type { Product, SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { OrderButton } from '@/components/order/OrderButton';
import { track } from '@/lib/analytics';

/* eslint-disable @next/next/no-img-element */

type Data = SiteContent['products'];
type Labels = Data['sheet'];

const EASE = [0.22, 1, 0.36, 1] as const;
const ALL = 'all';

/** Ukrainian plural: 1 виріб · 2–4 вироби · 5+ виробів. */
function plural(n: number, forms: [string, string, string]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
  return forms[2];
}

const pad = (n: number) => String(n).padStart(2, '0');

/* ── Product card ──────────────────────────────────────────────────── */

function SpecLine({ specs, className }: { specs: Product['specs']; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      {specs.map((s) => (
        <li key={s.label} className="spec text-walnut">
          {s.label} <span className="text-onyx">{s.value}</span>
        </li>
      ))}
    </ul>
  );
}

function Price({ item, big = false }: { item: Product; big?: boolean }) {
  return (
    <div>
      <p className={cn('spec', big ? 'text-2xl sm:text-3xl' : 'text-lg', item.onRequest ? 'text-espresso' : 'text-saffron-600')}>
        {item.price}
      </p>
      {item.priceNote && <p className="spec mt-0.5 text-walnut">{item.priceNote}</p>}
    </div>
  );
}

function ProductCard({
  item,
  number,
  labels,
  onOpen,
}: {
  item: Product;
  number: number;
  labels: Labels;
  onOpen: (slug: string) => void;
}) {
  const cover = getSlot(item.slot);
  const featured = !!item.featured;

  return (
    <motion.article
      layout="position"
      className={cn(
        'group relative flex border border-onyx/12 bg-parchment-50 transition-[border-color,box-shadow] duration-300 hover:border-onyx/35 hover:shadow-[0_30px_60px_-40px_rgb(28_24_20/0.45)]',
        featured && 'sm:col-span-2 lg:col-span-3',
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(item.slug)}
        className={cn('flex w-full cursor-pointer flex-col text-left', featured && 'lg:flex-row')}
        aria-label={`${labels.details}: ${item.name}`}
      >
        {/* Cover tile — the product photo already sits on the card's parchment,
            so the object floats on the card instead of sitting in a white box. */}
        <div className={cn('relative shrink-0 overflow-hidden', featured && 'lg:w-[58%]')}>
          <div className="transition-transform duration-700 ease-out group-hover:scale-[1.025]">
            <motion.img
              layoutId={`product-cover-${item.slug}`}
              src={cover.src}
              alt={cover.alt}
              loading={number <= 3 ? 'eager' : 'lazy'}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <span className="spec absolute left-3 top-3 text-walnut/80">{pad(number)}</span>
          {item.badge && (
            <span className="spec absolute right-3 top-3 bg-onyx px-2 py-1 text-parchment-50">{item.badge}</span>
          )}
        </div>

        {/* Body */}
        <div className={cn('flex flex-1 flex-col p-5', featured ? 'lg:justify-center lg:p-10' : 'lg:p-6')}>
          <h3 className={cn('display text-onyx', featured ? 'text-[clamp(1.6rem,2.6vw,2.4rem)]' : 'text-[1.4rem] leading-tight')}>
            {item.name}
          </h3>
          <p className={cn('mt-2 leading-relaxed text-espresso', featured ? 'max-w-md text-[15px]' : 'text-sm')}>{item.tagline}</p>
          <SpecLine specs={item.specs.slice(0, featured ? 4 : 3)} className="mt-4" />

          <div className="mt-6 flex items-end justify-between gap-4 border-t border-onyx/12 pt-4 lg:mt-auto lg:pt-5">
            <Price item={item} />
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-onyx">
              {labels.details}
              <ArrowUpRight
                className="size-4 text-saffron-600 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </button>
      {/* Saffron hairline grows in on hover — the editorial "active" cue. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-saffron-500 transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
    </motion.article>
  );
}

/* ── Product sheet (modal) ─────────────────────────────────────────── */

function ProductSheet({
  item,
  index,
  total,
  category,
  labels,
  onClose,
  onNav,
}: {
  item: Product;
  index: number;
  total: number;
  category: string;
  labels: Labels;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
}) {
  const reduce = useReducedMotion();
  const [photoState, setPhotoState] = useState<{ slug: string; i: number }>({ slug: item.slug, i: 0 });
  // A new product in the same sheet starts at its first photo (state is keyed by slug).
  const photo = photoState.slug === item.slug ? photoState.i : 0;
  const setPhoto = useCallback(
    (update: number | ((p: number) => number)) =>
      setPhotoState((prev) => {
        const cur = prev.slug === item.slug ? prev.i : 0;
        return { slug: item.slug, i: typeof update === 'function' ? update(cur) : update };
      }),
    [item.slug],
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const photos = useMemo(() => [getSlot(item.slot).src, ...item.gallery], [item]);
  const alt = getSlot(item.slot).alt;

  // New product in the same sheet → scroll the details back to the top.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [item.slug]);

  // Scroll lock + pause the cursor smoke + keyboard: Esc closes, ←/→ browse photos.
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = 'hidden';
    window.dispatchEvent(new Event('smoke:pause'));
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setPhoto((p) => (p + 1) % photos.length);
      if (e.key === 'ArrowLeft') setPhoto((p) => (p - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new Event('smoke:resume'));
      document.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [onClose, photos.length, setPhoto]);

  const D = (d: number) => (reduce ? 0 : d);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-80 flex items-end justify-center sm:items-center sm:p-6"
      data-no-burst
    >
      <button aria-label={labels.close} onClick={onClose} className="absolute inset-0 cursor-default bg-roast-900/75 backdrop-blur-sm" />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-sheet-title"
        initial={{ opacity: 0, y: 28, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.99, transition: { duration: D(0.22) } }}
        transition={{ duration: D(0.4), ease: EASE }}
        className="relative z-10 flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden bg-parchment-50 lg:max-h-[88dvh] lg:flex-row"
      >
        {/* Gallery */}
        <div className="relative shrink-0 bg-parchment-100 lg:flex lg:w-[56%] lg:flex-col">
          <div className="relative aspect-[4/3] overflow-hidden lg:flex-1 lg:aspect-auto">
            <AnimatePresence initial={false}>
              <motion.img
                key={photos[photo]}
                layoutId={photo === 0 ? `product-cover-${item.slug}` : undefined}
                src={photos[photo]}
                alt={photo === 0 ? alt : `${item.name} — ${labels.photo} ${photo + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: D(0.3), layout: { duration: D(0.45), ease: EASE } }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            {photos.length > 1 && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
                  {([-1, 1] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setPhoto((p) => (p + dir + photos.length) % photos.length)}
                      aria-label={dir === -1 ? labels.prev : labels.next}
                      className="pointer-events-auto grid size-10 cursor-pointer place-items-center rounded-full border border-onyx/15 bg-parchment-50/80 text-onyx backdrop-blur-sm transition-colors hover:border-saffron-500 hover:bg-saffron-500"
                    >
                      {dir === -1 ? <ChevronLeft className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
                    </button>
                  ))}
                </div>
                <span className="spec absolute bottom-3 right-3 rounded-[2px] bg-roast-900/55 px-2 py-1 text-parchment-100 backdrop-blur-sm">
                  {photo + 1} / {photos.length}
                </span>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-onyx/10 p-3">
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setPhoto(i)}
                  aria-label={`${labels.photo} ${i + 1}`}
                  aria-current={i === photo}
                  className={cn(
                    'relative aspect-[4/3] w-16 shrink-0 cursor-pointer overflow-hidden border transition-[border-color,opacity] sm:w-20',
                    i === photo ? 'border-saffron-500' : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close — pinned to the panel corner, so on mobile it sits over the gallery */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className="absolute right-3 top-3 z-20 grid size-10 cursor-pointer place-items-center rounded-full border border-onyx/15 bg-parchment-50/90 text-onyx backdrop-blur-sm transition-colors hover:border-saffron-500 hover:bg-saffron-500"
        >
          <X className="size-5" aria-hidden />
        </button>

        {/* Details */}
        <div ref={bodyRef} data-lenis-prevent className="relative flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          <p className="kicker pr-12">
            {category} <span className="text-walnut">· {pad(index + 1)} / {pad(total)}</span>
          </p>
          <h2 id="product-sheet-title" className="display mt-3 text-onyx text-[clamp(1.7rem,3vw,2.5rem)]">
            {item.name}
          </h2>
          <p className="mt-3 leading-relaxed text-espresso">{item.tagline}</p>
          <p className="mt-4 text-[15px] leading-relaxed text-onyx/85">{item.description}</p>

          <p className="kicker mt-8">{labels.includes}</p>
          <ul className="mt-3 space-y-2">
            {item.bullets.map((b) => (
              <li key={b} className="flex items-baseline gap-2.5 text-sm leading-relaxed text-onyx">
                <span aria-hidden className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-saffron-500" />
                {b}
              </li>
            ))}
          </ul>

          <p className="kicker mt-8">{labels.specs}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-6">
            {item.specs.map((s) => (
              <div key={s.label} className="border-b border-onyx/12 py-2.5">
                <dt className="spec text-walnut">{s.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-onyx">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 border-t border-onyx/12 pt-6">
            <Price item={item} big />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <OrderButton source={`catalog:${item.slug}`} payload={{ product: item.name }} variant="saffron">
                {item.onRequest ? labels.askPrice : labels.order}
              </OrderButton>
              {item.action === 'smoker' && (
                <Link
                  href={{ pathname: '/smoker', query: { m: item.slug } }}
                  className="inline-flex items-center gap-2 rounded-[2px] border border-onyx/25 px-6 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-onyx hover:text-parchment-50"
                >
                  {labels.smokerPage}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-walnut">{labels.leadTime}</p>
          </div>

          {/* Browse neighbours without leaving the sheet */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-onyx/12 pt-4">
            <button
              type="button"
              onClick={() => onNav(-1)}
              className="group/nav inline-flex cursor-pointer items-center gap-2 text-sm text-espresso transition-colors hover:text-onyx"
            >
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover/nav:-translate-x-1" aria-hidden />
              {labels.prev}
            </button>
            <button
              type="button"
              onClick={() => onNav(1)}
              className="group/nav inline-flex cursor-pointer items-center gap-2 text-sm text-espresso transition-colors hover:text-onyx"
            >
              {labels.next}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover/nav:translate-x-1" aria-hidden />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Custom-work plate ─────────────────────────────────────────────── */

function CustomPlate({ data }: { data: Data['custom'] }) {
  return (
    <motion.div
      data-dark-bg
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative mt-16 overflow-hidden rounded-[3px] border border-onyx/25 bg-[#2b2620] px-6 py-10 shadow-[0_40px_80px_-40px_rgb(28_24_20/0.6)] sm:px-10 sm:py-12"
      style={{
        backgroundImage:
          'repeating-linear-gradient(105deg, rgb(255 255 255 / 0.013) 0 2px, transparent 2px 5px), radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 0.04), transparent 55%)',
      }}
    >
      <div className="grid gap-8 lg:grid-cols-[1.3fr_auto] lg:items-center">
        <div>
          <p className="kicker text-saffron-300">{data.kicker}</p>
          <h2 className="display mt-3 text-parchment-50 text-[clamp(1.6rem,3vw,2.5rem)]">{data.title}</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-parchment-100/80">{data.text}</p>
        </div>
        <OrderButton source="catalog-custom" variant="saffron" className="lg:justify-self-end">
          {data.cta}
          <ArrowRight className="size-4" aria-hidden />
        </OrderButton>
      </div>
    </motion.div>
  );
}

/* ── Catalog ───────────────────────────────────────────────────────── */

export function CatalogView({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const [cat, setCat] = useState<string>(ALL);
  // Deep link (home ladder → /vyroby?p=<slug>): read once on the client, never during SSR.
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const byCategory = useMemo(
    () => data.categories.map((c) => ({ cat: c, items: data.items.filter((it) => it.category === c.slug) })),
    [data],
  );
  const visible = cat === ALL ? byCategory : byCategory.filter((g) => g.cat.slug === cat);
  const total = data.items.length;

  /** Open/close the sheet and mirror it into ?p=<slug> so links can be shared. */
  const setOpen = useCallback(
    (slug: string | null) => {
      setOpenSlug(slug);
      const url = new URL(window.location.href);
      if (slug) url.searchParams.set('p', slug);
      else url.searchParams.delete('p');
      window.history.replaceState(window.history.state, '', url);
      if (slug) track('product_sheet_open', { product: slug });
    },
    [],
  );
  const close = useCallback(() => setOpen(null), [setOpen]);

  useEffect(() => {
    // Subscribe to the URL once after hydration; opening happens in the callback,
    // not synchronously in the effect body.
    const apply = () => {
      const p = new URLSearchParams(window.location.search).get('p');
      setOpenSlug(p && data.items.some((it) => it.slug === p) ? p : null);
    };
    const id = window.requestAnimationFrame(() => {
      apply();
      setHydrated(true);
    });
    window.addEventListener('popstate', apply);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener('popstate', apply);
    };
  }, [data.items]);

  const openIndex = openSlug ? data.items.findIndex((it) => it.slug === openSlug) : -1;
  const openItem = openIndex >= 0 ? data.items[openIndex] : null;
  const nav = (dir: 1 | -1) => setOpen(data.items[(openIndex + dir + total) % total].slug);

  const chips = [{ slug: ALL, label: data.allLabel, count: total }, ...byCategory.map((g) => ({ slug: g.cat.slug, label: g.cat.label, count: g.items.length }))];

  return (
    <>
      <section className="pt-[calc(var(--header-h)+3rem)] pb-24">
        <Container>
          {/* Header */}
          <p className="kicker">{data.kicker}</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
            <h1 className="display text-onyx text-[clamp(2.75rem,7vw,5.5rem)]">{data.title}</h1>
            <p className="spec pb-2 text-walnut">
              {total} {plural(total, data.countForms)} · {data.categories.length} {plural(data.categories.length, ['категорія', 'категорії', 'категорій'])}
            </p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-2xl leading-relaxed text-espresso">{data.intro}</p>
            <p className="spec text-saffron-600">{data.note}</p>
          </div>

          {/* Category tabs — sticky under the header */}
          <div ref={tabsRef} className="sticky top-[var(--header-h)] z-30 -mx-5 mt-10 border-b border-onyx/12 bg-parchment-200/85 px-5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
            <div role="tablist" aria-label={data.allLabel} className="no-scrollbar flex gap-7 overflow-x-auto">
              {chips.map((c) => {
                const active = cat === c.slug;
                return (
                  <button
                    key={c.slug}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => {
                      setCat(c.slug);
                      track('catalog_filter', { category: c.slug });
                      // Filtering while scrolled deep would leave the reader below the
                      // (now shorter) list — bring the results back under the tab bar.
                      const bar = tabsRef.current;
                      if (bar) {
                        const headerPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) * 16 || 80;
                        const top = bar.getBoundingClientRect().top;
                        if (top <= headerPx + 1) window.scrollTo({ top: window.scrollY + top - headerPx, behavior: 'smooth' });
                      }
                    }}
                    className={cn(
                      'relative shrink-0 cursor-pointer whitespace-nowrap py-3.5 text-[15px] transition-colors',
                      active ? 'font-semibold text-onyx' : 'text-espresso hover:text-onyx',
                    )}
                  >
                    {c.label}
                    <span className={cn('spec ml-1.5', active ? 'text-saffron-600' : 'text-walnut')}>{c.count}</span>
                    {active && (
                      <motion.span
                        layoutId="catalog-tab"
                        className="absolute inset-x-0 -bottom-px h-0.5 bg-saffron-500"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Groups */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cat}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
              transition={{ duration: 0.4, ease: EASE }}
              className="space-y-16 pt-10"
            >
              {visible.map((g, gi) => {
                // Global 01…12 numbering, in catalog order.
                const start = data.items.findIndex((it) => it.category === g.cat.slug);
                return (
                  <section key={g.cat.slug} id={g.cat.slug} aria-labelledby={`cat-${g.cat.slug}`}>
                    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b border-onyx/15 pb-4">
                      <h2 id={`cat-${g.cat.slug}`} className="display text-onyx text-[clamp(1.6rem,2.6vw,2.3rem)]">
                        <span className="spec mr-3 align-[0.35em] text-saffron-600">{pad(byCategory.findIndex((x) => x.cat.slug === g.cat.slug) + 1)}</span>
                        {g.cat.label}
                      </h2>
                      <p className="max-w-md text-sm leading-relaxed text-espresso">{g.cat.blurb}</p>
                    </div>
                    <motion.div
                      className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                      initial={reduce ? false : 'hidden'}
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: gi * 0.05 } } }}
                    >
                      {g.items.map((it, i) => (
                        <motion.div
                          key={it.slug}
                          className={cn('flex', it.featured && 'sm:col-span-2 lg:col-span-3')}
                          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
                        >
                          <ProductCard item={it} number={start + i + 1} labels={data.sheet} onOpen={setOpen} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </section>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <CustomPlate data={data.custom} />

          <p className="mt-14 max-w-3xl text-sm leading-relaxed text-walnut">{data.seoText}</p>
        </Container>
      </section>

      <AnimatePresence initial={!hydrated ? false : undefined}>
        {openItem && (
          <ProductSheet
            key="sheet"
            item={openItem}
            index={openIndex}
            total={total}
            category={data.categories.find((c) => c.slug === openItem.category)?.label ?? ''}
            labels={data.sheet}
            onClose={close}
            onNav={nav}
          />
        )}
      </AnimatePresence>
    </>
  );
}
