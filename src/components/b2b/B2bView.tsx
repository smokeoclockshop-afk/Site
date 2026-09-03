'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, BadgePercent, Camera, Check, Handshake, Heart, MapPin, Timer, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BenefitScene, SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Reveal, RevealItem } from '@/components/ui/Reveal';
import { EngravedPlate } from '@/components/shared/EngravedPlate';
import { StampText } from '@/components/shared/StampText';
import { useCountUp } from '@/components/shared/useCountUp';
import { EmberField } from '@/components/effects/EmberField';
import { LeadForm } from '@/components/forms/LeadForm';
import { MessengerRow } from '@/components/order/MessengerRow';

/* eslint-disable @next/next/no-img-element */

type Data = SiteContent['b2b'];

const EASE = [0.22, 1, 0.36, 1] as const;
const pad = (n: number) => String(n).padStart(2, '0');

/** Headline that rises word by word out of a masked line. */
function Words({ text, delay = 0, reduce }: { text: string; delay?: number; reduce: boolean }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: delay + i * 0.06 }}
          >
            {w}
          </motion.span>
          {i < text.split(' ').length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </>
  );
}

/* ── 1. Hero ───────────────────────────────────────────────────────── */

function Hero({ data, reduce }: { data: Data; reduce: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '16%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0.25]);

  return (
    <section ref={ref} data-dark-bg className="relative flex min-h-[92dvh] items-end overflow-hidden bg-roast-900 text-parchment-50">
      {/* Photo: a pitmaster loading a commercial offset — parallax + slow push-in */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src="/media/b2b-hero.webp" alt="" className="hidden h-full w-full object-cover object-[60%_50%] md:block" fetchPriority="high" />
        <img src="/media/b2b-hero-mobile.webp" alt="" className="h-full w-full object-cover md:hidden" fetchPriority="high" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-roast-900/90 via-roast-900/55 to-roast-900/20" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-roast-900 via-roast-900/30 to-roast-900/20" />
      <div className="grain absolute inset-0" />
      {/* Real smoke wisps drifting up over the scene */}
      <EmberField variant="light" rate={9} className="pointer-events-none absolute inset-0" />

      <Container className="relative z-10 pb-16 pt-[calc(var(--header-h)+5rem)] lg:pb-20">
        <motion.div style={{ opacity: fade }}>
          <motion.p
            className="kicker text-saffron-300"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {data.kicker}
          </motion.p>
          <h1 className="display mt-4 max-w-4xl text-parchment-50 text-[clamp(2.6rem,7vw,6rem)]">
            <Words text={data.title} delay={0.15} reduce={reduce} />
          </h1>
          <motion.p
            className="mt-6 max-w-2xl text-[15px] leading-relaxed text-parchment-100/85 sm:text-base"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
          >
            {data.lead}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
          >
            <a
              href="#b2b-form"
              className="group inline-flex items-center gap-2.5 rounded-[2px] bg-saffron-500 px-7 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-saffron-400"
            >
              {data.cta1}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </a>
            <a
              href="#b2b-benefits"
              className="group inline-flex items-center gap-2.5 rounded-[2px] border border-parchment-50/40 px-7 py-3.5 text-sm font-semibold text-parchment-50 transition-colors hover:bg-parchment-50 hover:text-onyx"
            >
              {data.cta2}
              <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
            </a>
          </motion.div>

          {/* Three promises */}
          <motion.dl
            className="mt-12 grid max-w-3xl grid-cols-1 divide-y divide-parchment-50/15 border-y border-parchment-50/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            initial={reduce ? false : 'hidden'}
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } } }}
          >
            {data.heroStats.map((s) => (
              <motion.div
                key={s.label}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                className="py-4 sm:px-5 sm:first:pl-0"
              >
                <dt className="display text-2xl text-parchment-50">{s.value}</dt>
                <dd className="mt-1 text-sm leading-snug text-parchment-100/70">{s.label}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>
      </Container>
    </section>
  );
}

/* ── 2. Benefits — a bento board of four animated mini-scenes ──────── */

type BenefitItem = Data['benefits']['items'][number];

/** A check mark that draws itself. */
function DrawnCheck({ on, delay = 0, reduce }: { on: boolean; delay?: number; reduce: boolean }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-saffron-500/50 bg-saffron-500/10">
      <svg viewBox="0 0 24 24" className="size-3.5 text-saffron-600" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          animate={on ? { pathLength: 1 } : {}}
          transition={{ duration: 0.45, ease: EASE, delay }}
        />
      </svg>
    </span>
  );
}

/** Scene 1 — a receipt that prints itself, then the ×3 stamp slams in. */
function ReceiptScene({ scene, stat, on, reduce }: { scene: Extract<BenefitScene, { type: 'receipt' }>; stat: string; on: boolean; reduce: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[22rem] border border-onyx/15 bg-parchment-100 px-5 pb-5 pt-4 shadow-[0_28px_48px_-30px_rgb(28_24_20/0.6)]">
      <div className="flex items-center justify-between border-b border-onyx/15 pb-2">
        <span className="spec text-walnut">{scene.title}</span>
        <span className="spec text-walnut">Smoke O’Clock</span>
      </div>
      <ul className="mt-2">
        {scene.lines.map((l, i) => (
          <motion.li
            key={l.label}
            initial={reduce ? false : { opacity: 0, x: -10 }}
            animate={on ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, ease: EASE, delay: 0.25 + i * 0.22 }}
            className={cn('flex items-baseline justify-between gap-3 border-b border-dashed border-onyx/15 py-2 text-sm', i === scene.lines.length - 1 ? 'font-semibold text-onyx' : 'text-espresso')}
          >
            <span>{l.label}</span>
            <span className="spec whitespace-nowrap">{l.value}</span>
          </motion.li>
        ))}
      </ul>
      <div className="mt-4 flex items-end justify-between gap-4">
        <span className="text-[11px] leading-snug text-walnut">{scene.note}</span>
        <span className="min-h-[2.5rem]">{on && <StampText className="text-4xl leading-none">{stat}</StampText>}</span>
      </div>
    </div>
  );
}

/** Scene 2 — the service-day gauge: the arc fills, the needle sweeps, portions count up. */
function GaugeScene({ scene, on, reduce }: { scene: Extract<BenefitScene, { type: 'gauge' }>; on: boolean; reduce: boolean }) {
  const countRef = useCountUp(scene.count, on, { duration: 1800 });
  const R = 96;
  const cx = 120;
  const cy = 118;
  const arc = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
  const angles = [-180, -90, 0];
  return (
    <div className="mx-auto w-full max-w-[22rem]">
      <div className="relative">
        <svg viewBox="0 0 240 136" className="w-full">
          <path d={arc} fill="none" stroke="rgb(44 44 44 / 0.12)" strokeWidth="10" strokeLinecap="round" />
          <motion.path
            d={arc}
            fill="none"
            stroke="var(--color-saffron-500)"
            strokeWidth="10"
            strokeLinecap="round"
            initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
            animate={on ? { pathLength: 1 } : {}}
            transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
          />
          {angles.map((a) => {
            const rad = (a * Math.PI) / 180;
            const x1 = cx + Math.cos(rad) * (R - 14);
            const y1 = cy + Math.sin(rad) * (R - 14);
            const x2 = cx + Math.cos(rad) * (R - 22);
            const y2 = cy + Math.sin(rad) * (R - 22);
            return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(44 44 44 / 0.35)" strokeWidth="2" />;
          })}
          {/* needle */}
          <motion.g
            style={{ originX: '120px', originY: '118px' }}
            initial={reduce ? { rotate: 180 } : { rotate: 0 }}
            animate={on ? { rotate: 180 } : {}}
            transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
          >
            <line x1={cx} y1={cy} x2={cx - R + 26} y2={cy} stroke="var(--color-onyx)" strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>
          <circle cx={cx} cy={cy} r="5" fill="var(--color-saffron-500)" stroke="var(--color-parchment-50)" strokeWidth="2" />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center">
          <span ref={countRef} className="display text-5xl leading-none text-onyx">0</span>
          <span className="spec mt-1 block text-walnut">{scene.countLabel}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="spec text-onyx">{scene.from}</span>
        <span className="spec text-onyx">{scene.to}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-walnut">
        {scene.marks.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

const CHIP_ICONS = { camera: Camera, heart: Heart, pin: MapPin, users: Users } as const;

/** Scene 3 — guests' "notifications" pop over the smoking pit. */
function SocialScene({ scene, on, reduce }: { scene: Extract<BenefitScene, { type: 'social' }>; on: boolean; reduce: boolean }) {
  const spots = ['left-3 top-4', 'right-3 top-14', 'left-8 bottom-16', 'right-6 bottom-5'];
  return (
    <div className="absolute inset-0">
      {scene.chips.map((c, i) => {
        const Icon = CHIP_ICONS[c.icon];
        return (
          <motion.div
            key={c.text}
            initial={reduce ? false : { opacity: 0, scale: 0.6, y: 12 }}
            animate={on ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.35 + i * 0.4 }}
            className={cn('absolute flex items-center gap-2 rounded-full border border-parchment-50/25 bg-roast-900/70 py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-parchment-50 shadow-lg backdrop-blur-sm', spots[i % spots.length])}
          >
            <span className="grid size-6 place-items-center rounded-full bg-saffron-500 text-onyx">
              <Icon className="size-3.5" aria-hidden />
            </span>
            {c.text}
          </motion.div>
        );
      })}
    </div>
  );
}

/** Scene 4 — the launch checklist ticks itself while the bar fills. */
function ChecklistScene({ scene, on, reduce }: { scene: Extract<BenefitScene, { type: 'checklist' }>; on: boolean; reduce: boolean }) {
  const total = scene.items.length;
  return (
    <div className="mx-auto w-full max-w-[22rem] border border-onyx/15 bg-parchment-100 p-5 shadow-[0_28px_48px_-30px_rgb(28_24_20/0.6)]">
      <div className="h-1 w-full overflow-hidden bg-onyx/10">
        <motion.div
          className="h-full origin-left bg-saffron-500"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          animate={on ? { scaleX: 1 } : {}}
          transition={{ duration: 0.3 + total * 0.35, ease: 'linear', delay: 0.3 }}
        />
      </div>
      <ul className="mt-4 space-y-2.5">
        {scene.items.map((it, i) => (
          <motion.li
            key={it}
            initial={reduce ? false : { opacity: 0.35 }}
            animate={on ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.35 }}
            className="flex items-center gap-3 text-sm text-onyx"
          >
            <DrawnCheck on={on} delay={0.3 + i * 0.35} reduce={reduce} />
            {it}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function BenefitTile({ item, index, reduce, className }: { item: BenefitItem; index: number; reduce: boolean; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { once: true, amount: 0.4 }) || reduce;
  const social = item.scene.type === 'social';

  return (
    <motion.article
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE, delay: (index % 2) * 0.1 }}
      className={cn(
        'group relative flex flex-col overflow-hidden border border-onyx/12 bg-parchment-50 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-onyx/30 hover:shadow-[0_36px_60px_-40px_rgb(28_24_20/0.55)]',
        className,
      )}
    >
      {/* Photo header — the social scene lives on top of it */}
      <div className={cn('relative shrink-0 overflow-hidden', social ? 'h-64 sm:h-72' : 'h-44 sm:h-52')}>
        <img src={item.img} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105" />
        <div className={cn('absolute inset-0', social ? 'bg-gradient-to-t from-parchment-50 via-roast-900/25 to-roast-900/20' : 'bg-gradient-to-t from-parchment-50 via-parchment-50/40 to-transparent')} />
        {social && <EmberField variant="light" rate={6} className="pointer-events-none absolute inset-0" />}
        {social && <SocialScene scene={item.scene as Extract<BenefitScene, { type: 'social' }>} on={on} reduce={reduce} />}
        <span className="spec absolute left-4 top-4 rounded-[2px] bg-roast-900/55 px-2 py-1 text-parchment-100 backdrop-blur-sm">{pad(index + 1)}</span>
      </div>

      {/* The mini-scene overlaps the photo edge */}
      {!social && (
        <div className="relative z-10 -mt-16 px-5 sm:px-7">
          {item.scene.type === 'receipt' && <ReceiptScene scene={item.scene} stat={item.stat} on={on} reduce={reduce} />}
          {item.scene.type === 'gauge' && <GaugeScene scene={item.scene} on={on} reduce={reduce} />}
          {item.scene.type === 'checklist' && <ChecklistScene scene={item.scene} on={on} reduce={reduce} />}
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="display text-onyx text-[clamp(1.35rem,2vw,1.75rem)]">{item.title}</h3>
          {item.scene.type !== 'receipt' && (
            <span className="min-h-[2.25rem] shrink-0 text-right">
              {on && <StampText className="text-3xl leading-none">{item.stat}</StampText>}
              <span className="mt-1 block max-w-[10rem] text-[11px] leading-snug text-walnut">{item.statLabel}</span>
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-espresso">{item.text}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {item.points.map((pt, i) => (
            <motion.li
              key={pt}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={on ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease: EASE, delay: 0.9 + i * 0.12 }}
              className="inline-flex items-center gap-1.5 border border-onyx/12 bg-parchment-100 px-2.5 py-1 text-xs text-onyx"
            >
              <Check className="size-3 text-saffron-600" strokeWidth={3} aria-hidden />
              {pt}
            </motion.li>
          ))}
        </ul>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-saffron-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />
    </motion.article>
  );
}

const TILE_SPAN = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7'];

function Benefits({ data, reduce }: { data: Data['benefits']; reduce: boolean }) {
  return (
    <section id="b2b-benefits" className="scroll-mt-[var(--header-h)] py-20 lg:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="kicker">{data.kicker}</p>
          <h2 className="display mt-3 text-onyx text-[clamp(2rem,3.6vw,3.2rem)]">{data.title}</h2>
          <p className="mt-4 leading-relaxed text-espresso">{data.lead}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          {data.items.map((it, i) => (
            <BenefitTile key={it.title} item={it} index={i} reduce={reduce} className={TILE_SPAN[i % TILE_SPAN.length]} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── 3. Offer ──────────────────────────────────────────────────────── */

const WHY_ICONS = [BadgePercent, Timer, Handshake];

function Offer({ data, reduce }: { data: Data['offer']; reduce: boolean }) {
  return (
    <section data-dark-bg className="relative overflow-hidden bg-roast-900 py-20 text-parchment-50 lg:py-28">
      {/* Smoke: a live canvas of wisps plus two slow haze blobs behind the copy */}
      <EmberField variant="light" rate={12} className="pointer-events-none absolute inset-0 opacity-90" />
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-10 size-[38rem] rounded-full bg-parchment-50/[0.05] blur-3xl"
            animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-0 size-[42rem] rounded-full bg-saffron-500/[0.07] blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
      <div className="grain absolute inset-0" />

      <Container className="relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Reveal>
            <p className="kicker text-saffron-300">{data.kicker}</p>
            <h2 className="display mt-3 text-parchment-50 text-[clamp(2rem,3.8vw,3.4rem)]">{data.title}</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-parchment-100/80">{data.lead}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <EngravedPlate text={data.stamp} className="max-w-md" />
          </Reveal>
        </div>

        {/* What is designed for you */}
        <Reveal className="mt-14 grid gap-px overflow-hidden border border-parchment-50/12 bg-parchment-50/12 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {data.items.map((it, i) => (
            <RevealItem key={it.title} className="group relative bg-roast-900 p-6 transition-colors duration-300 hover:bg-roast-800">
              <span className="spec text-saffron-300/80">{pad(i + 1)}</span>
              <h3 className="display mt-3 text-xl text-parchment-50">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-parchment-100/70">{it.text}</p>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-saffron-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </RevealItem>
          ))}
        </Reveal>

        {/* Why it pays off */}
        <Reveal className="mt-10 grid gap-4 sm:grid-cols-3" stagger={0.1}>
          {data.why.map((w, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <RevealItem key={w.title} className="flex items-start gap-4 border-l-2 border-saffron-500 pl-4">
                <span className="grid size-10 shrink-0 place-items-center border border-parchment-50/15 bg-parchment-50/[0.05] text-saffron-300">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-parchment-50">{w.title}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-parchment-100/70">{w.text}</span>
                </span>
              </RevealItem>
            );
          })}
        </Reveal>

        {/* Formats */}
        <Reveal className="mt-14 grid gap-4 lg:grid-cols-3" stagger={0.1}>
          {data.formats.map((f) => (
            <RevealItem
              key={f.name}
              className="group flex flex-col border border-parchment-50/15 bg-parchment-50/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-saffron-400/60 hover:bg-parchment-50/[0.07]"
            >
              <h3 className="display text-2xl text-parchment-50">{f.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-parchment-100/75">{f.text}</p>
              <p className="spec mt-5 inline-flex items-center gap-2 text-saffron-300">
                <Timer className="size-4" aria-hidden />
                {f.term}
              </p>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal className="mt-12 text-center">
          <a
            href="#b2b-form"
            className="group inline-flex items-center gap-2.5 rounded-[2px] bg-saffron-500 px-8 py-4 text-sm font-semibold text-onyx transition-colors hover:bg-saffron-400"
          >
            {data.cta}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </a>
        </Reveal>
      </Container>
    </section>
  );
}

/* ── 4. Form ───────────────────────────────────────────────────────── */

function Ask({ data, order }: { data: Data; order: SiteContent['order'] }) {
  return (
    <section id="b2b-form" className="scroll-mt-[var(--header-h)] bg-parchment-100 py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="kicker">{data.formKicker}</p>
            <h2 className="display mt-3 text-onyx text-[clamp(2rem,3.6vw,3.2rem)]">{data.formTitle}</h2>
            <p className="mt-4 max-w-md leading-relaxed text-espresso">{data.formLead}</p>
            <ol className="mt-8 space-y-4">
              {data.formSteps.map((s, i) => (
                <li key={s} className="flex items-start gap-4">
                  <span className="spec grid size-8 shrink-0 place-items-center border border-saffron-500/40 bg-saffron-500/10 text-saffron-600">{pad(i + 1)}</span>
                  <span className="pt-1.5 text-sm leading-relaxed text-onyx">{s}</span>
                </li>
              ))}
            </ol>
            <MessengerRow place="b2b" className="mt-8" />
          </Reveal>
          <Reveal delay={0.1} className="border border-onyx/12 bg-parchment-50 p-4 sm:p-8">
            <LeadForm source="b2b" order={order} b2b={data} />
          </Reveal>
        </div>
        <p className="mt-14 text-center text-sm text-walnut">{data.logosNote}</p>
      </Container>
    </section>
  );
}

export function B2bView({ data, order }: { data: Data; order: SiteContent['order'] }) {
  const reduce = !!useReducedMotion();
  return (
    <>
      <Hero data={data} reduce={reduce} />
      <Benefits data={data.benefits} reduce={reduce} />
      <Offer data={data.offer} reduce={reduce} />
      <Ask data={data} order={order} />
    </>
  );
}
