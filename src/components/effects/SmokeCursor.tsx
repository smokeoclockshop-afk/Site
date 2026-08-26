'use client';

import { useEffect, useRef } from 'react';
import { SmokeEngine, type SmokeVariant } from './particles';
import { subscribeBurst } from './burst';

/**
 * Mounts the site-wide smoke canvas once (in the root layout) and feeds it
 * pointer input:
 *   • fine pointer  → smoke ribbon follows the cursor + smoke puff on click
 *   • coarse pointer → no trail; a small puff on tap only
 * The smoke tint adapts to what is behind the cursor: pale backlit smoke over
 * dark sections (marked with [data-dark-bg]), warm soot over light parchment.
 * Not mounted at all under prefers-reduced-motion. Pauses while a modal is
 * open (listens for window 'smoke:pause' / 'smoke:resume').
 */
export function SmokeCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const engine = new SmokeEngine(canvas);
    let paused = false;

    // Cached dark-background zones (hero, footer) for tint selection.
    let darkEls: Element[] = [];
    const refreshZones = () => {
      darkEls = Array.from(document.querySelectorAll('[data-dark-bg]'));
    };
    refreshZones();
    const zoneIv = window.setInterval(refreshZones, 1500);

    const variantAt = (x: number, y: number): SmokeVariant => {
      for (const el of darkEls) {
        const r = el.getBoundingClientRect();
        if (y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) return 'light';
      }
      return 'dark';
    };

    // Cursor trail: dense spawn (1 wisp / 7px, ≤6 per event) so the wisps
    // overlap into a continuous curling ribbon of smoke.
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let dist = 0;
    let primed = false;

    const onMove = (e: PointerEvent) => {
      if (paused) return;
      const now = e.timeStamp;
      if (!primed) {
        primed = true;
        lastX = e.clientX;
        lastY = e.clientY;
        lastT = now;
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dtMs = Math.max(now - lastT, 1);
      const vx = (dx / dtMs) * 1000;
      const vy = (dy / dtMs) * 1000;
      dist += Math.hypot(dx, dy);
      const variant = variantAt(e.clientX, e.clientY);
      let spawned = 0;
      while (dist >= 7 && spawned < 6) {
        engine.spawnTrail(e.clientX, e.clientY, vx, vy, variant);
        dist -= 7;
        spawned++;
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };

    const onDown = (e: PointerEvent) => {
      if (paused) return;
      const el = e.target;
      if (el instanceof Element && el.closest('[data-no-burst]')) return;
      // A puff of smoke on click/tap (not sparks) — sparks are reserved for
      // the "welding" scene triggers (engraving, workshop clock).
      engine.burst(e.clientX, e.clientY, 'smoke', variantAt(e.clientX, e.clientY));
    };

    if (!coarse) window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });

    // Scenes trigger bursts through this subscription.
    const unsub = subscribeBurst((x, y, kind) => {
      if (!paused) engine.burst(x, y, kind, variantAt(x, y));
    });

    // Debounced resize.
    let rt = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = window.setTimeout(() => engine.resize(), 150);
    });
    ro.observe(document.documentElement);

    const onPause = () => {
      paused = true;
      engine.stop();
    };
    const onResume = () => {
      paused = false;
    };
    window.addEventListener('smoke:pause', onPause);
    window.addEventListener('smoke:resume', onResume);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('smoke:pause', onPause);
      window.removeEventListener('smoke:resume', onResume);
      clearInterval(zoneIv);
      clearTimeout(rt);
      ro.disconnect();
      unsub();
      engine.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
}
