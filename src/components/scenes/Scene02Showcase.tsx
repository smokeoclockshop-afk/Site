'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Play, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { SiteContent } from '@/lib/content';
import { getSlot } from '@/lib/media';
import { btn } from '@/components/ui/button-styles';
import { Container } from '@/components/ui/Container';
import { track } from '@/lib/analytics';

type Data = SiteContent['home']['showcase'];

/**
 * "Що вміє смокер" — the template's Spirit interaction carried over: the whole
 * video card (montage + heading + copy + buttons) scales from an inset rounded
 * card to full-bleed as it pins. A play button opens the montage in a lightbox.
 */
export function Scene02Showcase({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const poster = getSlot('ph.showcase.poster');
  const video = getSlot('ph.showcase.video');

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5], reduce ? [1, 1] : [0.82, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.5], reduce ? [0, 0] : [24, 0]);

  // Lightbox: lock scroll + Esc to close + pause the cursor smoke.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = 'hidden';
    window.dispatchEvent(new Event('smoke:pause'));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new Event('smoke:resume'));
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <section ref={ref} className="relative h-[130vh] bg-parchment-200">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale, borderRadius: radius }}
          className="relative h-full w-full overflow-hidden text-parchment-50"
          data-dark-bg
        >
          {video.videoSrc ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={poster.src}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={video.videoSrc} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster.src} alt={poster.alt} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-roast-900/50" />

          <Container className="relative z-10 flex h-full items-center">
            <div className="max-w-2xl">
              <h2 className="display text-parchment-50 text-[clamp(2.75rem,6vw,5rem)]">
                {data.title.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-parchment-100/85">{data.text}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(true);
                    track('showcase_play');
                  }}
                  className="group inline-flex cursor-pointer items-center gap-3 text-parchment-50"
                  aria-label={data.play}
                >
                  <span className="grid size-14 place-items-center rounded-full border border-parchment-50/60 transition-colors group-hover:bg-parchment-50 group-hover:text-onyx">
                    <Play className="ml-0.5 size-5 fill-current" aria-hidden />
                  </span>
                  <span className="text-sm font-medium">{data.play}</span>
                </button>
                <Link href="/smoker" className={btn('ghostLight')}>{data.cta}</Link>
              </div>
            </div>
          </Container>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-80 flex items-center justify-center bg-roast-900/90 p-4 sm:p-10"
            data-no-burst
          >
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-5xl"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute -top-12 right-0 grid size-10 cursor-pointer place-items-center text-parchment-100 transition-colors hover:text-parchment-50"
              >
                <X className="size-6" aria-hidden />
              </button>
              <video
                autoPlay
                loop
                controls
                playsInline
                poster={poster.src}
                className="aspect-video w-full rounded-[6px] bg-black object-cover"
              >
                {video.videoSrc && <source src={video.videoSrc} type="video/mp4" />}
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
