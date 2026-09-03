'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform, useMotionValueEvent, useReducedMotion, type MotionValue } from 'motion/react';
import { getSlot } from '@/lib/media';
import type { SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Odometer } from '@/components/shared/Odometer';
import { triggerBurst } from '@/components/effects/burst';
import { SmokeWall } from '@/components/effects/SmokeWall';
import { useMediaQuery } from '@/components/shared/useMediaQuery';

/* eslint-disable @next/next/no-img-element */

type Data = SiteContent['home']['process'];

/* Gauge geometry: a 300° arc, 0° = 12 o'clock, from −150° to +150°. */
const A0 = -150;
const A1 = 150;
const VB = 276; // viewBox
const C = VB / 2;

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  // Rounded to 2dp — raw floats differ between SSR and client → hydration noise.
  const rnd = (v: number) => Math.round(v * 100) / 100;
  return [rnd(C + r * Math.cos(a)), rnd(C + r * Math.sin(a))];
}

function stepAngle(i: number, n: number): number {
  return A0 + (i * (A1 - A0)) / (n - 1);
}

/**
 * The workshop chronometer: full-circle hairline, a 300° tick band with a
 * labelled major tick per stage, a saffron progress arc that sweeps with the
 * scroll, a tapered hand with counterweight + cap, and brand microtype.
 */
function Dial({
  rot,
  arcOffset,
  timeStr,
  steps,
  active,
}: {
  rot: MotionValue<number>;
  arcOffset: MotionValue<number>;
  timeStr: string;
  steps: Data['steps'];
  active: number;
}) {
  const n = steps.length;

  // Minor ticks every 3.75° along the band.
  const minors: number[] = [];
  for (let a = A0; a <= A1 + 0.001; a += 3.75) minors.push(a);

  const [ax0, ay0] = polar(96, A0);
  const [ax1, ay1] = polar(96, A1);
  const arcPath = `M ${ax0} ${ay0} A 96 96 0 1 1 ${ax1} ${ay1}`;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      <svg viewBox={`0 0 ${VB} ${VB}`} className="absolute inset-0 size-full">
        {/* outer hairlines */}
        <circle cx={C} cy={C} r={118} fill="none" stroke="rgb(44 44 44 / 0.14)" strokeWidth="1" />
        <circle cx={C} cy={C} r={78} fill="none" stroke="rgb(44 44 44 / 0.08)" strokeWidth="1" />

        {/* minor ticks */}
        {minors.map((a) => {
          const [x1, y1] = polar(108, a);
          const [x2, y2] = polar(113, a);
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(44 44 44 / 0.18)" strokeWidth="1" />;
        })}

        {/* track + saffron progress arc */}
        <path d={arcPath} fill="none" stroke="rgb(44 44 44 / 0.1)" strokeWidth="2" />
        <motion.path
          d={arcPath}
          fill="none"
          stroke="var(--color-saffron-500)"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: arcOffset }}
        />

        {/* major ticks + time labels per stage */}
        {steps.map((s, i) => {
          const a = stepAngle(i, n);
          const on = i === active;
          const [x1, y1] = polar(100, a);
          const [x2, y2] = polar(113, a);
          const [lx, ly] = polar(128, a);
          return (
            <g key={s.time}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={on ? 'var(--color-saffron-600)' : 'rgb(44 44 44 / 0.45)'}
                strokeWidth={on ? 2.5 : 1.5}
              />
              <text
                x={lx} y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9.5"
                fontWeight={on ? 700 : 500}
                fill={on ? 'var(--color-saffron-600)' : 'var(--color-walnut)'}
              >
                {s.time}
              </text>
            </g>
          );
        })}

      </svg>

      {/* hand (tapered needle + counterweight), rotating as one */}
      <motion.div className="absolute inset-0" style={{ rotate: rot }}>
        <div
          className="absolute left-1/2 top-1/2 h-[30%] w-[3px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-saffron-600 to-saffron-400"
          style={{ clipPath: 'polygon(0% 12%, 50% 0%, 100% 12%, 100% 100%, 0% 100%)' }}
        />
        <div className="absolute left-1/2 top-1/2 h-[9%] w-[3px] -translate-x-1/2 rounded-full bg-onyx/35" />
      </motion.div>

      {/* cap */}
      <div className="absolute left-1/2 top-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-stone bg-parchment-50">
        <span className="size-1.5 rounded-full bg-saffron-600" />
      </div>

      {/* brand microtype + running time (in the gauge mouth, clear of the needle sweep) */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.3em] text-walnut">
          Smoke O’Clock
        </span>
        <span className="spec absolute left-1/2 top-[85%] -translate-x-1/2 -translate-y-1/2 text-2xl text-onyx">
          <Odometer value={timeStr} />
        </span>
      </div>
    </div>
  );
}


/* ── Phones: a small dial pinned top-left, photo cards scroll up into smoke ── */

function MiniDial({ step, n, time, name }: { step: number; n: number; time: string; name: string }) {
  const p = n > 1 ? step / (n - 1) : 1;
  const a = A0 + p * (A1 - A0);
  const [x0, y0] = polar(96, A0);
  const [x1, y1] = polar(96, A1);
  const track = `M ${x0} ${y0} A 96 96 0 1 1 ${x1} ${y1}`;
  const [nx, ny] = polar(66, a);
  const [tx, ty] = polar(-22, a);
  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-onyx/15 bg-parchment-50/95 py-2 pl-2 pr-5 shadow-[0_18px_40px_-20px_rgb(28_24_20/0.55)] backdrop-blur-md">
      <svg viewBox={`0 0 ${VB} ${VB}`} className="size-[68px] shrink-0">
        <circle cx={C} cy={C} r={124} fill="none" stroke="rgb(44 44 44 / 0.14)" strokeWidth="2" />
        <path d={track} fill="none" stroke="rgb(44 44 44 / 0.1)" strokeWidth="9" strokeLinecap="round" />
        <motion.path
          d={track}
          fill="none"
          stroke="var(--color-saffron-500)"
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          initial={false}
          animate={{ strokeDashoffset: 1 - p }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        {Array.from({ length: n }, (_, i) => {
          const ta = stepAngle(i, n);
          const [ax, ay] = polar(112, ta);
          const [bx, by] = polar(120, ta);
          return (
            <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={i <= step ? 'var(--color-saffron-600)' : 'rgb(44 44 44 / 0.35)'} strokeWidth={i === step ? 4 : 2.5} strokeLinecap="round" />
          );
        })}
        <motion.line
          initial={false}
          animate={{ x1: tx, y1: ty, x2: nx, y2: ny }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          stroke="var(--color-onyx)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx={C} cy={C} r="10" fill="var(--color-parchment-50)" stroke="var(--color-onyx)" strokeWidth="3" />
        <circle cx={C} cy={C} r="4" fill="var(--color-saffron-500)" />
      </svg>
      <span className="min-w-0 leading-none">
        <span className="spec block text-[1.35rem] text-onyx" style={{ lineHeight: 1.1 }}>
          <Odometer value={time} />
        </span>
        <span className="mt-1 block truncate text-[12px] font-semibold text-onyx">{name}</span>
        <span className="spec mt-0.5 block text-[10px] text-walnut">
          {String(step + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
      </span>
    </div>
  );
}

function MobileStep({ step, index, onActive }: { step: Data['steps'][number]; index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const m = getSlot(step.slot);
  // The card only thins out as it slides under the smoke hem (~20% of the
  // screen): progress 0 when its top touches the hem, 1 when its bottom does.
  // So the part still in the open stays solid and the card dissolves in the
  // smoke instead of fading in plain view.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 22%', 'end 18%'] });
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [1, 0.85, 0.45, 0]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) onActive(index);
      },
      { rootMargin: '-38% 0px -45% 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, onActive]);

  return (
    <motion.li ref={ref} style={{ opacity }} className="relative">
      <motion.article
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="border border-onyx/12 bg-parchment-50 p-2"
      >
        <div className="relative overflow-hidden">
          <img src={m.src} alt={m.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <span className="spec absolute left-3 top-3 rounded-[2px] bg-roast-900/65 px-2 py-1 text-saffron-300 backdrop-blur-sm">{step.time}</span>
        </div>
        <div className="px-3 pb-3 pt-4">
          <p className="spec text-walnut">{String(index + 1).padStart(2, '0')}</p>
          <h3 className="display mt-1 text-2xl text-onyx">{step.name}</h3>
          <p className="spec mt-2 inline-block border border-saffron-500/30 bg-saffron-500/10 px-2.5 py-1 text-saffron-600">{step.fact}</p>
          <p className="mt-3 text-sm leading-relaxed text-espresso">{step.text}</p>
        </div>
      </motion.article>
    </motion.li>
  );
}

function MobileProcess({ data }: { data: Data }) {
  const [step, setStep] = useState(0);
  const n = data.steps.length;
  const onActive = useCallback((i: number) => setStep((prev) => (prev === i ? prev : i)), []);
  // Once the last stage has scrolled past, the clock and the smoke bank clear out.
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress: endP } = useScroll({ target: listRef, offset: ['end 70%', 'end 30%'] });
  const tailOpacity = useTransform(endP, [0, 1], [1, 0]);
  // No smoke at all until the clock pins: the bank only starts to appear once
  // the canvas edge has slid behind the header (so no edge can ever show), and
  // a soft spring turns that last bit of scroll into a ~0.7 s fade-in.
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: inP } = useScroll({ target: stageRef, offset: ['start 8%', 'start 1%'] });
  const smokeIn = useSpring(useTransform(inP, [0, 1], [0, 1]), { stiffness: 30, damping: 12, mass: 1 });
  const smokeOpacity = useTransform([smokeIn, tailOpacity], ([a, b]) => Math.max(0, Math.min(a as number, b as number)));
  return (
    <section id="process" className="relative bg-parchment-200 pb-6 pt-16">
      <Container>
        <p className="kicker">{data.kicker}</p>
        <h2 className="display mt-2 text-onyx text-[clamp(1.9rem,7vw,2.6rem)]">{data.title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-espresso">{data.intro}</p>
      </Container>

      <div ref={stageRef} className="relative mt-8">
        {/* Smoke bank: the same billow simulation as the desktop conveyor,
            turned into a ceiling. It sticks at the very top so its clipping
            edge sits behind the frosted header (no line), and it only fades
            in once the clock has pinned. Cards scrolling up slip under its
            ragged hem. */}
        <motion.div
          style={{ opacity: smokeOpacity }}
          className="pointer-events-none sticky top-0 z-20 -mb-[calc(30vh+var(--header-h))] h-[calc(30vh+var(--header-h))]"
        >
          <SmokeWall edge="top" density={0.7} sizeScale={0.8} />
        </motion.div>
        {/* Pinned workshop clock, top-left, in front of the smoke */}
        <motion.div style={{ opacity: tailOpacity }} className="sticky top-[calc(var(--header-h)+0.75rem)] z-30 h-0 px-5 sm:px-8">
          <MiniDial step={step} n={n} time={data.steps[step].time} name={data.steps[step].name} />
        </motion.div>
        <ol ref={listRef} className="space-y-6 px-5 pt-28 pb-4 sm:px-8">
          {data.steps.map((s, i) => (
            <MobileStep key={s.time} step={s} index={i} onActive={onActive} />
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Scene05Process({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  if (!isDesktop && !reduce) return <MobileProcess data={data} />;
  return <DesktopProcess data={data} reduce={!!reduce} />;
}

function DesktopProcess({ data, reduce }: { data: Data; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const dialWrap = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const first = useRef(true);
  const n = data.steps.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // Magnetic hand: a plateau per stage with short transitions in between.
  const inputs: number[] = [];
  const outputs: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n + (i === 0 ? 0 : 0.35 / n);
    const t1 = (i + 1) / n - (i === n - 1 ? 0 : 0.35 / n);
    inputs.push(t0, t1);
    outputs.push(stepAngle(i, n), stepAngle(i, n));
  }
  const rot = useTransform(scrollYProgress, inputs, outputs);
  const arcOffset = useTransform(scrollYProgress, [0.02, 0.96], [1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const s = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    setStep((prev) => (prev === s ? prev : s));
  });

  // A tick of the clock breathes out a puff of smoke.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce) return;
    const box = dialWrap.current?.getBoundingClientRect();
    if (box) triggerBurst(box.left + box.width / 2, box.top + box.height * 0.08, 'smoke');
  }, [step, reduce]);

  const current = data.steps[step];
  const media = getSlot(current.slot);

  if (reduce) {
    return (
      <section id="process" className="bg-parchment-200 py-20">
        <Container>
          <p className="kicker text-center">{data.kicker}</p>
          <h2 className="display mx-auto mt-3 max-w-2xl text-center text-[clamp(2rem,4vw,3.4rem)] text-onyx">{data.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-center leading-relaxed text-espresso">{data.intro}</p>
          <div className="mt-12 space-y-10">
            {data.steps.map((s) => {
              const m = getSlot(s.slot);
              return (
                <div key={s.time} className="grid items-center gap-6 sm:grid-cols-2">
                  <img src={m.src} alt={m.alt} className="w-full" />
                  <div>
                    <p className="spec text-2xl text-saffron-600">{s.time}</p>
                    <h3 className="display mt-1 text-2xl text-onyx">{s.name}</h3>
                    <p className="spec mt-2 inline-block border border-saffron-500/30 bg-saffron-500/10 px-2.5 py-1 text-saffron-600">{s.fact}</p>
                    <p className="mt-3 leading-relaxed text-espresso">{s.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="process" ref={ref} style={{ height: `${n * 52 + 40}vh` }} className="relative bg-parchment-200">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden pt-[var(--header-h)] pb-6">
        <Container className="relative z-10">
          <div className="text-center">
            <p className="kicker">{data.kicker}</p>
            <h2 className="display mt-2 text-[clamp(1.8rem,3.2vw,2.8rem)] text-onyx">{data.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-espresso">{data.intro}</p>
          </div>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[44%_1fr]">
            <div ref={dialWrap}>
              <Dial rot={rot} arcOffset={arcOffset} timeStr={current.time} steps={data.steps} active={step} />
              <div key={step} className="mt-5 text-center">
                <div className="flex items-center justify-center gap-3">
                  <h3 className="display text-2xl text-onyx">{current.name}</h3>
                </div>
                <p className="spec mt-2 inline-block border border-saffron-500/30 bg-saffron-500/10 px-2.5 py-1 text-saffron-600">
                  {current.fact}
                </p>
                <p className="mx-auto mt-3 max-w-sm leading-relaxed text-espresso">{current.text}</p>
              </div>
            </div>

            <div className="relative hidden h-[58vh] overflow-hidden lg:block">
              {/* Stages shot on video (laser, welding, first fire) play as muted
                  loops; the rest are stills. Both share the same crossfade. */}
              <AnimatePresence mode="popLayout">
                {media.videoSrc ? (
                  <motion.video
                    key={current.slot}
                    src={media.videoSrc}
                    poster={media.src}
                    aria-label={media.alt}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.06 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <motion.img
                    key={current.slot}
                    src={media.src}
                    alt={media.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.06 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </AnimatePresence>
              {/* stage chip on the photo */}
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-roast-900/85 to-transparent p-5 pt-14">
                <span className="spec text-saffron-300">{current.time}</span>
                <span className="text-sm font-medium text-parchment-50">{current.name}</span>
                <span className="spec ml-auto text-parchment-100/70">{String(step + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

        </Container>
      </div>
    </section>
  );
}
