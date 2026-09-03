'use client';

/* eslint-disable @next/next/no-img-element */

import { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

/** Quiet interlude between acts. */
export function Breather({ text }: { text: string }) {
  return (
    <section className="bg-coal-950 py-24 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="spec text-lg text-ash-500 sm:text-xl">{text}</p>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * B2B banner: a dark steel plate that stands off the parchment canvas. A real
 * photo is cut into its right side, and a warm spotlight follows the cursor.
 */
export function B2bTeaser({ data }: { data: SiteContent['home']['b2bTeaser'] }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
    el.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
  };

  return (
    <section className="bg-parchment-200 py-14">
      <Container>
        <motion.div
          ref={ref}
          data-dark-bg
          onPointerMove={onMove}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden rounded-[3px] border border-onyx/25 bg-[#2b2620] shadow-[0_40px_80px_-40px_rgb(28_24_20/0.6)]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(105deg, rgb(255 255 255 / 0.013) 0 2px, transparent 2px 5px), radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 0.04), transparent 55%)',
          }}
        >
          {/* Phones: the photo as a compact banner on top */}
          <div aria-hidden className="relative h-40 overflow-hidden sm:hidden">
            <img src="/media/b2b-hero.webp" alt="" className="h-full w-full object-cover object-[65%_50%] opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2b2620] via-[#2b2620]/30 to-transparent" />
          </div>
          {/* Photo cutout, dissolving into the steel */}
          <div aria-hidden className="absolute inset-y-0 right-0 w-[46%] overflow-hidden max-sm:hidden">
            <img
              src="/media/b2b-hero.webp"
              alt=""
              className="h-full w-full object-cover object-[center_38%] opacity-60 transition-transform duration-700 ease-out group-hover:scale-[1.045]"
              style={{
                WebkitMaskImage: 'linear-gradient(to left, black 52%, transparent 100%)',
                maskImage: 'linear-gradient(to left, black 52%, transparent 100%)',
              }}
            />
          </div>

          {/* Warm spotlight following the cursor */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(260px circle at var(--mx, 72%) var(--my, 50%), rgb(220 168 106 / 0.14), transparent 70%)',
            }}
          />

          <div className="relative z-10 px-5 pb-6 pt-5 sm:px-10 sm:py-12 lg:max-w-[60%]">
            <p className="kicker text-saffron-300">{data.kicker}</p>
            {/* Phones: calm sentence-case copy; wider: the editorial display heading */}
            <p className="mt-2 text-[15px] font-semibold leading-snug text-parchment-50 sm:hidden">{data.text}</p>
            <h3 className="display mt-3 hidden text-parchment-50 text-[clamp(1.45rem,2.6vw,2.25rem)] leading-snug sm:block">
              {data.text}
            </h3>
            <div className="mt-5 sm:mt-7">
              <Link
                href="/b2b"
                className="group/btn inline-flex items-center gap-2.5 rounded-[2px] bg-saffron-500 px-5 py-2.5 text-sm font-semibold text-onyx transition-colors hover:bg-saffron-400 sm:px-6 sm:py-3"
              >
                {data.cta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

