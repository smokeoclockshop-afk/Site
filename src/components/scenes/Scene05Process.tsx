'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, type MotionValue } from 'motion/react';
import { getSlot } from '@/lib/media';
import type { SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Odometer } from '@/components/shared/Odometer';
import { triggerBurst } from '@/components/effects/burst';

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

export function Scene05Process({ data }: { data: Data }) {
  const reduce = useReducedMotion();
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
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={current.slot}
                  src={getSlot(current.slot).src}
                  alt={getSlot(current.slot).alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.06 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
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
