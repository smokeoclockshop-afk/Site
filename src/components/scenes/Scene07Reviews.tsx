'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { SiteContent } from '@/lib/content';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Slot } from '@/components/ui/Slot';
import { StarRating } from '@/components/ui/StarRating';

type Data = SiteContent['home']['reviews'];

const TILTS = [-3, 2, -2, 3, -1, 2];

export function Scene07Reviews({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const dragRef = useRef<HTMLDivElement>(null);
  const photos = [1, 2, 3, 4, 5, 6];

  return (
    <section className="bg-coal-900 py-24">
      <Container>
        <div className="text-center">
          <p className="kicker">{data.kicker}</p>
          <h2 className="display struck mt-3 text-[clamp(2rem,4vw,3.4rem)] text-smoke-50">{data.title}</h2>
        </div>

        {/* Magnetic photo board */}
        <div ref={dragRef} className="no-scrollbar mt-12 overflow-hidden">
          <motion.div
            drag={reduce ? false : 'x'}
            dragConstraints={dragRef}
            dragElastic={0.12}
            className={cn('flex gap-5', reduce && 'flex-wrap justify-center')}
          >
            {photos.map((n, i) => (
              <figure
                key={n}
                className="relative w-56 shrink-0 border border-paper-300 bg-paper-200 p-2 pb-8"
                style={{ rotate: `${reduce ? 0 : TILTS[i]}deg` }}
              >
                <span aria-hidden className="absolute -top-2 left-1/2 size-3 -translate-x-1/2 rounded-full bg-ember-500" />
                <Slot id={`ph.review.${n}`} />
                <figcaption className="spec mt-2 text-center text-coal-800">відгук {n}</figcaption>
              </figure>
            ))}
          </motion.div>
        </div>

        {/* Text reviews */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {data.items.map((r) => (
            <Reveal key={r.name} className="grain relative border border-[color:rgb(44_44_44/0.12)] bg-coal-800 p-6">
              <div className="relative z-10">
                <StarRating value={r.stars} />
                <p className="mt-3 leading-relaxed text-smoke-300">“{r.text}”</p>
                <p className="spec mt-4 text-smoke-50">
                  {r.name} <span className="text-ash-500">· {r.serial}</span>
                </p>
                {r.isExample && <p className="spec mt-1 text-ash-500/70">{data.exampleNote}</p>}
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center">
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-smoke-50 underline underline-offset-4 hover:text-ember-400">
            {data.moreCta}
          </a>
        </p>
      </Container>
    </section>
  );
}
