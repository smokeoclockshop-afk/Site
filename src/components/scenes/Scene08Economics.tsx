'use client';

/* eslint-disable @next/next/no-img-element */

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Beef, Bone, Drumstick, Flame, Sandwich } from 'lucide-react';
import type { EconReceipt, SiteContent } from '@/lib/content';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Slot } from '@/components/ui/Slot';
import { useCountUp } from '@/components/shared/useCountUp';

type Data = SiteContent['home']['economics'];

const EASE = [0.22, 1, 0.36, 1] as const;
const DISH_ICONS = { ribs: Bone, brisket: Beef, pork: Sandwich, wings: Drumstick } as const;

/** Stable formatter for count-ups: 17 200 instead of 17200. */
const fmtCount = (n: number) => Math.round(n).toLocaleString('uk-UA');

/** A paper receipt: dashed edges, mono figures, staggered line items. */
function Receipt({
  data,
  tone,
  tilt,
  active,
}: {
  data: EconReceipt;
  tone: 'out' | 'home';
  tilt: string;
  active: boolean;
}) {
  const totalRef = useCountUp(data.total, active, { format: fmtCount });
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: undefined }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        'relative border border-onyx/15 bg-parchment-50 px-6 py-6 shadow-[0_24px_50px_-28px_rgb(28_24_20/0.45)] sm:px-7',
        tilt,
      )}
    >
      {/* perforated receipt edges */}
      <div aria-hidden className="absolute inset-x-4 top-0 border-t-2 border-dashed border-onyx/15" />
      <div aria-hidden className="absolute inset-x-4 bottom-0 border-b-2 border-dashed border-onyx/15" />

      <p className={cn('spec', tone === 'home' ? 'text-saffron-600' : 'text-walnut')}>{data.title}</p>
      <ul className="mt-4 space-y-2.5">
        {data.items.map((it, i) => (
          <motion.li
            key={it.label}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.25 + i * 0.12 }}
            className="flex items-baseline justify-between gap-4 text-sm text-onyx"
          >
            <span className="leading-snug">{it.label}</span>
            <span className="spec shrink-0">{it.value}</span>
          </motion.li>
        ))}
      </ul>
      <p className="mt-3 text-xs italic text-espresso/70">{data.note}</p>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-onyx/15 pt-3.5">
        <span className="spec text-walnut">{data.totalLabel}</span>
        <span className={cn('tnum text-xl font-bold sm:text-2xl', tone === 'home' ? 'text-saffron-600' : 'text-onyx')}>
          <span ref={totalRef}>0</span> ₴
        </span>
      </div>
    </motion.div>
  );
}

export function Scene08Economics({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const receiptsRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const receiptsIn = useInView(receiptsRef, { once: true, amount: 0.4 });
  const monthlyIn = useInView(monthlyRef, { once: true, amount: 0.5 });
  const outRef = useCountUp(data.monthly.out.value, monthlyIn, { format: fmtCount });
  const homeRef = useCountUp(data.monthly.home.value, monthlyIn, { format: fmtCount });

  return (
    <section id="economics" className="overflow-hidden bg-parchment-200 py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker">{data.kicker}</p>
          <h2 className="display mt-3 text-onyx text-[clamp(2rem,3.6vw,3.2rem)]">
            {data.title.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
          <p className="mt-4 leading-relaxed text-espresso">{data.lead}</p>
        </div>

        {/* Receipt duel */}
        <div ref={receiptsRef} className="relative mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2 sm:gap-8">
          <Receipt data={data.receiptOut} tone="out" tilt="sm:-rotate-1" active={receiptsIn} />
          <Receipt data={data.receiptHome} tone="home" tilt="sm:rotate-1" active={receiptsIn} />
          {/* The savings stamp slams across the lower edge of both receipts */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.7, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.75 }}
            className="pointer-events-none absolute left-[26%] top-[86%] z-10 -translate-x-1/2 -translate-y-1/2 max-sm:hidden"
          >
            <span className="block rounded-[3px] border-[3px] border-saffron-600/80 px-5 py-2.5 text-xl font-bold uppercase tracking-wider text-saffron-600/90 [box-shadow:inset_0_0_0_2px_rgb(241_234_224/0.9)] [text-shadow:0_1px_0_rgb(241_234_224/0.8)]">
              {data.stamp}
            </span>
          </motion.div>

          {/* Round percent seal in the top-right corner, clear of the receipt text */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.6, rotate: 26 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 12 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 1.05 }}
            className="pointer-events-none absolute -top-9 right-0 z-10 sm:-right-7 sm:-top-8"
          >
            <span className="grid size-24 place-items-center rounded-full border-[3px] border-saffron-600/80 text-center [box-shadow:inset_0_0_0_2px_rgb(241_234_224/0.9)]">
              <span>
                <span className="block text-xl font-bold leading-none text-saffron-600/90">{data.stampPercent}</span>
                <span className="spec mt-1 block text-[10px] text-saffron-600/80">{data.stampPercentLabel}</span>
              </span>
            </span>
          </motion.div>
        </div>
        {/* Mobile stamp under receipts */}
        <div className="mt-5 text-center sm:hidden">
          <span className="inline-block -rotate-3 rounded-[3px] border-[3px] border-saffron-600/80 px-4 py-2 text-lg font-bold uppercase tracking-wider text-saffron-600/90">
            {data.stamp}
          </span>
        </div>

        {/* Juicy per-dish comparison — a compact icon ledger on phones, photo cards wider up */}
        <p className="kicker mt-16 text-center">{data.dishTitle}</p>
        <ul className="mx-auto mt-6 grid max-w-md gap-2.5 sm:hidden">
          {data.dishes.map((d, i) => {
            const Icon = DISH_ICONS[d.icon];
            return (
              <motion.li
                key={d.name}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, ease: EASE, delay: i * 0.08 }}
                className="flex items-center gap-3.5 border border-onyx/12 bg-parchment-50 p-3 shadow-[0_16px_36px_-28px_rgb(28_24_20/0.5)]"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-saffron-500/30 bg-saffron-500/12 text-saffron-600">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="display block text-lg leading-tight text-onyx">{d.name}</span>
                  <span className="block truncate text-[11px] text-walnut">{d.out}</span>
                  <span className="block text-[13px] font-semibold text-saffron-600">{d.home}</span>
                </span>
                <span className="spec shrink-0 bg-onyx px-2 py-1 text-[10px] text-parchment-50">{d.factor}</span>
              </motion.li>
            );
          })}
        </ul>
        <div className="mx-auto mt-6 hidden max-w-5xl gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {data.dishes.map((d, i) => (
            <motion.figure
              key={d.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.1 }}
              className="group overflow-hidden border border-onyx/12 bg-parchment-50 shadow-[0_20px_44px_-28px_rgb(28_24_20/0.4)]"
            >
              <div className="relative overflow-hidden">
                <div className="transition-transform duration-700 ease-out group-hover:scale-[1.05]">
                  <Slot id={d.slot} className="aspect-[4/3]" />
                </div>
                <span className="spec absolute right-2.5 top-2.5 rounded-[2px] bg-roast-900/70 px-2 py-1 text-saffron-300 backdrop-blur-sm">
                  {d.factor}
                </span>
              </div>
              <figcaption className="px-4 pb-4 pt-3">
                <h3 className="display text-xl text-onyx">{d.name}</h3>
                <p className="mt-1.5 text-sm text-walnut">{d.out}</p>
                <p className="mt-0.5 text-sm font-semibold text-saffron-600">{d.home}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>

      </Container>

      {/* Monthly math — a full-bleed band over smoked meat */}
      <div
        ref={monthlyRef}
        data-dark-bg
        className="relative mt-16 overflow-hidden bg-[#1d1813] py-16 sm:py-20"
      >
        <img
          src="/media/ribs-smoke-dark.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgb(29 24 19 / 0.92), rgb(29 24 19 / 0.55) 30%, rgb(29 24 19 / 0.6) 70%, rgb(29 24 19 / 0.94)), radial-gradient(80% 70% at 50% 50%, transparent 30%, rgb(29 24 19 / 0.5))',
          }}
        />

        <Container className="relative z-10">
          <p className="kicker text-center text-saffron-300">{data.monthly.title}</p>

          <div className="mt-9 grid items-center gap-8 sm:grid-cols-[1fr_auto_1fr]">
            <div className="text-center">
              <p className="tnum text-4xl font-bold tracking-tight text-parchment-100/90 [text-shadow:0_2px_20px_rgb(0_0_0/0.6)] sm:text-6xl">
                <span ref={outRef}>0</span> ₴
              </p>
              <p className="spec mt-2.5 text-parchment-100/60">{data.monthly.out.label}</p>
            </div>
            <span aria-hidden className="display text-center text-2xl text-saffron-300/80 sm:text-3xl">проти</span>
            <div className="relative mx-auto text-center">
              <p className="tnum text-4xl font-bold tracking-tight text-saffron-300 [text-shadow:0_2px_24px_rgb(0_0_0/0.7)] sm:text-6xl">
                <span ref={homeRef}>0</span> ₴
              </p>
              <p className="spec mt-2.5 text-parchment-100/60">{data.monthly.home.label}</p>
              {/* Honest breakdown: meat + the highlighted smoker installment */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="spec border border-parchment-50/25 bg-roast-900/50 px-2.5 py-1 text-parchment-100/80 backdrop-blur-sm">
                  {data.monthly.breakdown.meat}
                </span>
                <span className="spec border border-saffron-400/70 bg-saffron-500/20 px-2.5 py-1 font-semibold text-saffron-300 backdrop-blur-sm">
                  {data.monthly.breakdown.payment}
                </span>
              </div>
              {/* Percent seal riding the home number */}
              <motion.span
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.6, rotate: 28 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 14 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.9 }}
                className="pointer-events-none absolute -right-4 -top-10 grid size-[74px] place-items-center rounded-full border-[3px] border-saffron-400/90 text-lg font-bold text-saffron-300 [box-shadow:0_0_24px_rgb(220_168_106/0.25)] sm:-right-16 sm:-top-10"
              >
                {data.monthly.percent}
              </motion.span>
            </div>
          </div>

          {/* Payback meter: nights light up like coals */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex gap-2 sm:gap-3">
              {Array.from({ length: data.monthly.nights }, (_, i) => (
                <motion.span
                  key={i}
                  initial={reduce ? { opacity: 1 } : { opacity: 0.18, scale: 0.75 }}
                  whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.35 + i * 0.16 }}
                >
                  <Flame
                    aria-hidden
                    fill="currentColor"
                    className="size-6 text-saffron-400 drop-shadow-[0_0_10px_rgb(220_168_106/0.7)] sm:size-8"
                  />
                </motion.span>
              ))}
            </div>
            <p className="text-center text-lg font-medium text-parchment-50 sm:text-xl">
              <span className="tnum text-2xl font-bold text-saffron-300 sm:text-3xl">{data.monthly.nights}</span>{' '}
              {data.monthly.nightsLabel}
            </p>
            <p className="max-w-xl text-center leading-relaxed text-parchment-100/80">{data.monthly.payback}</p>
            <p className="max-w-2xl text-center text-sm leading-relaxed text-parchment-100/65">{data.monthly.explain}</p>
          </div>

          <div className="mt-10 text-center">
            <a
              href="#quiz"
              className="group/cta relative inline-flex items-center gap-2.5 overflow-hidden rounded-[2px] bg-saffron-500 px-8 py-4 text-base font-bold text-onyx shadow-[0_18px_44px_-14px_rgb(212_150_83/0.8)] transition-colors hover:bg-saffron-400"
            >
              {data.cta}
              {!reduce && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-16 w-12 -skew-x-12 bg-parchment-50/50 blur-[6px]"
                  animate={{ x: [0, 420] }}
                  transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.6 }}
                />
              )}
            </a>
            <p className="spec mt-3 text-parchment-100/50">{data.ctaHint}</p>
          </div>
        </Container>
      </div>

      <Container>
        <p className="mt-6 text-center text-xs text-espresso/55">{data.sourceNote}</p>
      </Container>
    </section>
  );
}
