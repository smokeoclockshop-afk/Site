'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import type { SiteContent } from '@/lib/content';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { OrderButton } from '@/components/order/OrderButton';
import { useOrder } from '@/components/order/OrderModalContext';
import { useCountUp } from '@/components/shared/useCountUp';
import { triggerBurst } from '@/components/effects/burst';

type Data = SiteContent['home']['queue'];

const pad = (n: number) => `№ ${String(n).padStart(3, '0')}`;

function Counter({ value, label, active }: { value: number; label: string; active: boolean }) {
  const ref = useCountUp(value, active);
  return (
    <div>
      <span ref={ref} className="spec text-3xl text-saffron-600 sm:text-4xl">0</span>
      <p className="spec mt-1.5 text-walnut">{label}</p>
    </div>
  );
}

/** A finished smoker: dimmed plate with the owner's stamp. */
function DoneRow({ serial, status }: { serial: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[2px] border border-parchment-50/10 bg-parchment-50/[0.045] px-4 py-3 opacity-70 sm:px-5">
      <span className="spec text-lg text-parchment-100/75">{serial}</span>
      <span className="spec -rotate-3 rounded-[2px] border border-parchment-100/30 px-2 py-0.5 text-[10px] text-parchment-100/60">
        {status}
      </span>
    </div>
  );
}

/**
 * The serial currently on the bench. A looping "hot pass": a glowing slit
 * sweeps along the plate re-burning the engraving and throwing real sparks
 * off the tip (sparks are reserved for exactly these welding moments).
 */
function ActiveRow({ serial, status }: { serial: string; status: string }) {
  const reduce = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const hotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    const row = rowRef.current;
    const hot = hotRef.current;
    if (!row || !hot) return;

    let raf = 0;
    let running = false;
    let paused = false;
    let visible = false;
    let t0 = 0;
    let lastSpark = 0;
    const SWEEP = 1900;
    const REST = 3200;

    const frame = (t: number) => {
      if (!running) return;
      if (!t0) t0 = t;
      const cycle = (t - t0) % (SWEEP + REST);
      const r = row.getBoundingClientRect();
      if (cycle < SWEEP) {
        const p = cycle / SWEEP;
        const x = p * r.width;
        hot.style.opacity = '1';
        hot.style.transform = `translateX(${(x - 44).toFixed(1)}px)`;
        if (t - lastSpark > 160 && !document.hidden) {
          lastSpark = t;
          triggerBurst(r.left + x, r.top + r.height * (0.3 + Math.random() * 0.4), 'sparks');
        }
      } else {
        hot.style.opacity = '0';
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || paused || !visible || document.hidden) return;
      running = true;
      t0 = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0.5 },
    );
    io.observe(row);
    const onPause = () => {
      paused = true;
      stop();
    };
    const onResume = () => {
      paused = false;
      start();
    };
    const onVis = () => (document.hidden ? stop() : start());
    window.addEventListener('smoke:pause', onPause);
    window.addEventListener('smoke:resume', onResume);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('smoke:pause', onPause);
      window.removeEventListener('smoke:resume', onResume);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduce]);

  return (
    <div
      ref={rowRef}
      className="relative overflow-hidden rounded-[2px] border border-saffron-500/45 bg-[#241f19] px-4 py-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_14px_30px_-18px_rgb(0_0_0/0.8)] sm:px-5"
    >
      {/* The hot pass slit */}
      <div
        ref={hotRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-0 w-20 bg-gradient-to-r from-transparent via-saffron-300/60 to-transparent opacity-0 blur-[7px]"
      />
      <div className="relative flex items-center justify-between gap-4">
        <span className="display text-2xl tracking-wide text-parchment-50 [text-shadow:0_0_18px_rgb(220_168_106/0.35)] sm:text-3xl">
          {serial}
        </span>
        <span className="spec inline-flex items-center gap-2 text-saffron-300">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-saffron-400" />
          </span>
          {status}
        </span>
      </div>
    </div>
  );
}

/** An open slot in the nearest window — click books exactly this serial. */
function FreeRow({ serial, status, hint }: { serial: string; status: string; hint: string }) {
  const reduce = useReducedMotion();
  const { open } = useOrder();
  return (
    <motion.button
      type="button"
      onClick={() => open('queue-slot', { product: `Смокер ${serial}` })}
      animate={reduce ? undefined : { opacity: [0.82, 1, 0.82] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-[2px] border-2 border-dashed border-saffron-500/40 bg-saffron-500/[0.07] px-4 py-3 text-left transition-colors hover:border-saffron-400 hover:bg-saffron-500/15 sm:px-5"
    >
      <span className="spec text-lg text-saffron-300">{serial}</span>
      <span className="spec text-parchment-100/70">
        {status} <span className="text-saffron-300 max-sm:hidden">— {hint}</span>
      </span>
    </motion.button>
  );
}

export function Scene06Queue({ data }: { data: Data }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const q = site.queue;

  return (
    <section id="queue" className="relative overflow-hidden bg-parchment-200 py-24">
      {/* The owner's real photo as a ghost backdrop: desaturated to a warm
          sepia whisper and masked at both ends, so the block dissolves into
          the smoke of the previous section instead of starting with an edge. */}
      <img
        src="/media/queue-smoker.jpg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_62%]"
        style={{
          opacity: 0.17,
          filter: 'grayscale(1) sepia(0.35) brightness(1.08) contrast(0.92)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 78%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 78%, transparent 100%)',
        }}
      />
      <Container>
        <div ref={ref} className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.02fr] lg:gap-16">
          {/* LEFT — the pitch: seriality, master's stamp, open queue */}
          <div>
            <p className="kicker">{data.kicker}</p>
            <h2 className="display mt-3 text-onyx text-[clamp(2rem,3.4vw,3.2rem)]">{data.title}</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-espresso">{data.lead}</p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
              <Counter value={q.built} label={data.builtLabel} active={inView} />
              <Counter value={q.freeSlots} label={data.queueLabel} active={inView} />
              <div>
                <span className="spec text-2xl text-saffron-600 sm:text-3xl">{q.window}</span>
                <p className="spec mt-1.5 text-walnut">{data.windowLabel}</p>
              </div>
            </div>

            <div className="mt-9">
              <OrderButton source="queue" variant="saffron">{data.cta}</OrderButton>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-espresso">{data.note}</p>
            </div>
          </div>

          {/* RIGHT — the workshop ledger board (dark steel) */}
          <div
            data-dark-bg
            className="relative overflow-hidden rounded-[3px] border border-onyx/25 bg-[#2b2620] p-5 shadow-[0_40px_80px_-40px_rgb(28_24_20/0.6)] sm:p-6"
            style={{
              backgroundImage:
                'repeating-linear-gradient(105deg, rgb(255 255 255 / 0.013) 0 2px, transparent 2px 5px), radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 0.05), transparent 55%)',
            }}
          >
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <span className="spec text-parchment-100/60">{data.boardTitle}</span>
              <span className="spec text-parchment-100/45">
                {data.windowLabel.toLowerCase()}: <span className="text-saffron-300">{q.window}</span>
              </span>
            </div>

            <div className="space-y-2.5">
              <DoneRow serial={pad(q.inProgress - 2)} status={data.statusDone} />
              <DoneRow serial={pad(q.inProgress - 1)} status={data.statusDone} />
              <ActiveRow serial={pad(q.inProgress)} status={data.statusNow} />
              {Array.from({ length: q.freeSlots }, (_, i) => (
                <FreeRow
                  key={i}
                  serial={pad(q.inProgress + 1 + i)}
                  status={data.statusFree}
                  hint={data.claimHint}
                />
              ))}
            </div>

            <p className={cn('spec mt-4 text-center text-[10px] text-parchment-100/35')}>
              {pad(1)} — {pad(q.inProgress - 1)} · {data.statusDone}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
