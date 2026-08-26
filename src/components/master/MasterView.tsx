'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Slot } from '@/components/ui/Slot';
import { Reveal } from '@/components/ui/Reveal';
import { EngravedPlate } from '@/components/shared/EngravedPlate';
import { triggerBurst } from '@/components/effects/burst';

type Data = SiteContent['master'];

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
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {/* Portrait + weld rail */}
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <p className="kicker">{data.kicker}</p>
            <h1 className="display struck mt-3 text-[clamp(2.5rem,6vw,4.5rem)] text-smoke-50">{data.title}</h1>
            <div className="mt-6 flex gap-5">
              <div ref={railRef} className="relative hidden w-6 shrink-0 lg:block">
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[color:rgb(239_234_227/0.15)]" />
                <motion.div className="absolute inset-x-0 top-0 left-1/2 w-0.5 -translate-x-1/2 origin-top bg-ember-500" style={{ height: '100%', scaleY: fill }} />
                {data.milestones.map((m, i) => (
                  <div key={m.year} className="absolute left-1/2 -translate-x-1/2" style={{ top: `${(i / (data.milestones.length - 1)) * 100}%` }}>
                    <span className={cn('block size-2.5 rounded-full transition-colors', i <= ms ? 'bg-ember-500' : 'bg-coal-700')} />
                  </div>
                ))}
              </div>
              <Slot id="ph.master.portrait" className="flex-1" />
            </div>
            <ul className="mt-5 space-y-1 lg:hidden">
              {data.milestones.map((m) => (
                <li key={m.year} className="spec text-ash-500"><span className="text-ember-500">{m.year}</span> — {m.fact}</li>
              ))}
            </ul>
          </div>

          {/* Story */}
          <div>
            <div className="space-y-5">
              {data.story.map((p, i) => (
                <Reveal key={i}>
                  <p className="text-lg leading-relaxed text-smoke-300">{p}</p>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-y border-[color:rgb(44_44_44/0.12)] py-8">
              {data.counters.map((c) => (
                <div key={c.label} className="text-center">
                  <span className="spec text-3xl text-ember-500 sm:text-4xl">{c.value}</span>
                  <p className="spec mt-2 text-ash-500">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:items-center">
              <Slot id="ph.master.weldMacro" rounded />
              <div>
                <h2 className="display text-2xl text-smoke-50">{data.signTitle}</h2>
                <p className="mt-3 leading-relaxed text-smoke-300">{data.signText}</p>
              </div>
            </div>

            <Reveal className="mt-12">
              <EngravedPlate text={data.stamp} className="max-w-md" />
            </Reveal>

            <div className="mt-10">
              <Link href="/vyroby" className="cta-glow inline-flex items-center rounded-[2px] bg-ember-500 px-7 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-ember-600">
                {data.cta}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
