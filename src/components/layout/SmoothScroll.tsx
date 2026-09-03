'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

/**
 * Lenis smooth scrolling — mirrors the source site's setup
 * (duration 1.2, exponential easing). Disabled for reduced-motion users.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  /** Set by `popstate`: the browser restores the position on back/forward. */
  const popRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Every modal/lightbox on the site announces itself with these events.
    // While one is open the page must not scroll underneath it: an
    // `overflow: hidden` on <html> does not stop Lenis (it drives scrollTop
    // programmatically), so the instance itself is paused. Scrollable panels
    // inside a modal keep native scrolling via `data-lenis-prevent`.
    let open = 0;
    const onPause = () => {
      open += 1;
      lenis.stop();
    };
    const onResume = () => {
      open = Math.max(0, open - 1);
      if (open === 0) lenis.start();
    };
    const onPop = () => {
      popRef.current = true;
    };
    window.addEventListener('smoke:pause', onPause);
    window.addEventListener('smoke:resume', onResume);
    window.addEventListener('popstate', onPop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('smoke:pause', onPause);
      window.removeEventListener('smoke:resume', onResume);
      window.removeEventListener('popstate', onPop);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Client navigation: Next resets the native scroll to the top of the new
  // page, but a Lenis glide still in flight keeps easing toward the *old*
  // target and drags the fresh page back down (clamped to its bottom). So on
  // every route change the glide is cancelled and Lenis is pinned to where
  // the page really is: the top (or the hash anchor) for links, the position
  // the browser restored for back/forward.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const lenis = lenisRef.current;
    const pop = popRef.current;
    popRef.current = false;
    if (!lenis) return;
    if (pop) {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      return;
    }
    const hash = window.location.hash.slice(1);
    const anchor = hash ? document.getElementById(decodeURIComponent(hash)) : null;
    if (anchor) {
      // Measured against the native position (Lenis' own may still be stale).
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      lenis.scrollTo(anchor.getBoundingClientRect().top + window.scrollY - pad, { immediate: true, force: true });
    } else {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
  }, [pathname]);

  return null;
}
