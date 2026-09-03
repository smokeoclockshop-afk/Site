'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Slot } from '@/components/ui/Slot';
import { Reveal } from '@/components/ui/Reveal';
import { EngravedPlate } from '@/components/shared/EngravedPlate';
import { triggerBurst } from '@/components/effects/burst';

type Data = SiteContent['master'];

const EASE = [0.22, 1, 0.36, 1] as const;

export function MasterView({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [ms, setMs] = useState(0);
  const first = useRef(true);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const idx = Math.min(data.milestones.length - 1, Math.floor(p * data.milestones.length));
    setMs((prev) => (prev === idx ? prev : idx));
  });

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce) return;
    const box = railRef.current?.getBoundingClientRect();
    if (box) triggerBurst(box.left + 2, box.top + box.height * ((ms + 0.5) / data.milestones.length), 'sparks');
  }, [ms, reduce, data.milestones.length]);

  return (
    <div ref={ref} className="pt-[calc(var(--header-h)+3rem)] pb-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* Portrait + weld rail */}
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <p className="kicker">{data.kicker}</p>
            <h1 className="display mt-3 text-[clamp(2.5rem,6vw,4.5rem)] text-onyx">{data.title}</h1>
            <div className="mt-6 flex gap-5">
              <div ref={railRef} className="relative hidden w-6 shrink-0 lg:block">
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-onyx/15" />
                <motion.div className="absolute inset-x-0 top-0 left-1/2 w-0.5 -translate-x-1/2 origin-top bg-saffron-500" style={{ height: '100%', scaleY: fill }} />
                {data.milestones.map((m, i) => (
                  <div key={m.year} className="absolute left-1/2 -translate-x-1/2" style={{ top: `${(i / (data.milestones.length - 1)) * 100}%` }}>
                    <span className={cn('block size-2.5 rounded-full transition-colors', i <= ms ? 'bg-saffron-500' : 'bg-parchment-300')} />
                  </div>
                ))}
              </div>
              {/* The portrait, with a candid second shot pinned over its corner. */}
              <div className="relative mb-8 flex-1 sm:mb-10">
                <Slot id="ph.master.portrait" priority />
                <motion.figure
                  initial={reduce ? false : { opacity: 0, y: 16, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: -4 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
                  className="absolute -bottom-8 right-2 w-[36%] border border-parchment-50 bg-parchment-50 p-1.5 pb-4 shadow-[0_28px_44px_-24px_rgb(28_24_20/0.65)] sm:-right-5 sm:-bottom-10"
                >
                  <Slot id="ph.master.hello" />
                  <figcaption className="spec mt-2 text-center text-[10px] text-walnut">{data.milestones[data.milestones.length - 1].year}</figcaption>
                </motion.figure>
              </div>
            </div>
            <ul className="mt-8 space-y-1 lg:hidden">
              {data.milestones.map((m) => (
                <li key={m.year} className="spec text-walnut"><span className="text-saffron-600">{m.year}</span> — {m.fact}</li>
              ))}
            </ul>
            <ul className="mt-8 hidden space-y-2 lg:block">
              {data.milestones.map((m, i) => (
                <li key={m.year} className={cn('spec flex items-baseline gap-3 transition-colors', i <= ms ? 'text-onyx' : 'text-walnut')}>
                  <span className={cn('w-10', i <= ms ? 'text-saffron-600' : 'text-walnut')}>{m.year}</span>
                  {m.fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Story */}
          <div>
            <div className="space-y-5">
              {data.story.map((p, i) => (
                <Reveal key={i}>
                  <p className="text-lg leading-relaxed text-espresso">{p}</p>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-y border-onyx/12 py-8">
              {data.counters.map((c) => (
                <div key={c.label} className="text-center">
                  <span className="spec text-3xl text-saffron-600 sm:text-4xl">{c.value}</span>
                  <p className="spec mt-2 text-walnut">{c.label}</p>
                </div>
              ))}
            </div>

            {/* In the workshop: panorama + welding strip */}
            <Reveal className="mt-14">
              <p className="kicker">{data.workshop.title}</p>
              <p className="mt-3 max-w-xl leading-relaxed text-espresso">{data.workshop.lead}</p>
              <figure className="mt-6">
                <Slot id="ph.master.workshop" imgClassName="transition-transform duration-[1200ms] ease-out hover:scale-[1.03]" />
                <figcaption className="spec mt-2 text-walnut">{data.workshop.panoramaCaption}</figcaption>
              </figure>
            </Reveal>
            <Reveal className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.08}>
              {data.workshop.photos.map((p) => (
                <figure key={p.slot} className="group">
                  <Slot id={p.slot} imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                  <figcaption className="spec mt-2 text-walnut">{p.caption}</figcaption>
                </figure>
              ))}
            </Reveal>

            {/* The signature: ambient clip of the grinder throwing sparks */}
            <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center">
              <Reveal>
                <figure>
                  <Slot id={reduce ? 'ph.master.weldMacro' : 'ph.master.weldVideo'} rounded />
                  <figcaption className="spec mt-2 text-walnut">{data.videoCaption}</figcaption>
                </figure>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="display text-2xl text-onyx">{data.signTitle}</h2>
                <p className="mt-3 leading-relaxed text-espresso">{data.signText}</p>
              </Reveal>
            </div>

            <Reveal className="mt-12">
              <EngravedPlate text={data.stamp} className="max-w-md" />
            </Reveal>

            <div className="mt-10">
              <Link href="/vyroby" className="group/cta inline-flex items-center gap-2.5 rounded-[2px] bg-saffron-500 px-7 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-saffron-400">
                {data.cta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
