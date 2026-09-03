'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Volumetric smoke wall for the product conveyor: a self-contained canvas
 * simulation (NOT footage) — dozens of noise-carved billow sprites advected by
 * a shared curl field, rising and tumbling along the right side of the stage.
 * Two canvases sandwich the cards (back = dense mass, front = thin veils), so
 * a materializing card forms INSIDE the smoke. The left boundary is a per-
 * particle alpha falloff — organic rags, no rectangular edge.
 */

/** Deterministic PRNG so sprite variants are stable between mounts. */
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PuffTone {
  body: readonly [number, number, number];
  shade: readonly [number, number, number];
}
/** Steam-white puffs with a soft under-shadow (like smoker exhaust), plus a
    dimmer variant for depth pockets. */
const TONES: PuffTone[] = [
  { body: [240, 237, 232], shade: [96, 87, 78] },
  { body: [197, 191, 183], shade: [74, 67, 60] },
];

/** A volumetric puff: each lobe = shadow blob + offset bright body (light from
    above), then noise-carved ragged edges. */
function makeSprite(seed: number, tone: PuffTone): HTMLCanvasElement {
  const S = 340;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const rnd = mulberry(seed);
  const cx = S / 2;
  const cy = S / 2;
  const [br, bg, bb] = tone.body;
  const [sr, sg, sb] = tone.shade;
  for (let i = 0; i < 7; i++) {
    const rad = S * (0.12 + rnd() * 0.15);
    const ox = cx + (rnd() - 0.5) * S * 0.4;
    const oy = cy + (rnd() - 0.5) * S * 0.4;
    const shadow = ctx.createRadialGradient(ox + rad * 0.2, oy + rad * 0.28, rad * 0.1, ox + rad * 0.2, oy + rad * 0.28, rad * 1.1);
    shadow.addColorStop(0, `rgba(${sr},${sg},${sb},0.5)`);
    shadow.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(ox + rad * 0.2, oy + rad * 0.28, rad * 1.1, 0, Math.PI * 2);
    ctx.fill();
    const body = ctx.createRadialGradient(ox - rad * 0.06, oy - rad * 0.14, rad * 0.08, ox - rad * 0.06, oy - rad * 0.14, rad);
    body.addColorStop(0, `rgba(${br},${bg},${bb},0.92)`);
    body.addColorStop(1, `rgba(${br},${bg},${bb},0)`);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(ox - rad * 0.06, oy - rad * 0.14, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 110; i++) {
    const a = rnd() * Math.PI * 2;
    const d = S * (0.26 + rnd() * 0.24);
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d;
    const rad = S * (0.035 + rnd() * 0.09);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

interface Billow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size0: number;
  size1: number;
  rot: number;
  rotV: number;
  age: number;
  life: number;
  a0: number;
  depth: number;
  sp: number;
  /** Personal jitter for the bottom fade — staggers the base so the wall
      never ends in one shared "waterline". */
  edge: number;
}

export function SmokeWall({
  edge = 'right',
  className,
  density = 1,
  sizeScale = 1,
}: {
  edge?: 'right' | 'top';
  className?: string;
  /** Spawn-rate multiplier (0–1): phones use ~0.4. */
  density?: number;
  /** Puff size multiplier: phones use ~0.55. */
  sizeScale?: number;
} = {}) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const top = edge === 'top';
    const back = backRef.current;
    const front = frontRef.current;
    if (!back || !front) return;
    const bctx = back.getContext('2d');
    const fctx = front.getContext('2d');
    if (!bctx || !fctx) return;

    /* 6 bright steam puffs + 3 dimmer depth pockets. */
    const sprites: HTMLCanvasElement[] = [];
    for (let v = 0; v < 6; v++) sprites.push(makeSprite(11 + v * 13, TONES[0]));
    for (let v = 0; v < 3; v++) sprites.push(makeSprite(97 + v * 17, TONES[1]));
    const pickSprite = () => (Math.random() < 0.3 ? 6 + ((Math.random() * 3) | 0) : (Math.random() * 6) | 0);

    let W = 0;
    let H = 0;
    const fit = () => {
      W = back.clientWidth;
      H = back.clientHeight;
      for (const cv of [back, front]) {
        cv.width = W;
        cv.height = H;
      }
    };
    fit();

    const ps: Billow[] = [];
    let acc = 0;
    let t = 0;

    const spawn = () => {
      if (ps.length > 300 || W === 0) return;
      /* One random drives both the spawn depth and the personal death-depth:
         the deeper a puff is born, the deeper it is allowed to live — so real
         clumps hang over the next section instead of stopping at one line. */
      const r = Math.random();
      if (top) {
        /* Ceiling bank: born along the top band, drifting sideways, hugging
           the edge; the personal death-depth staggers the ragged bottom. */
        ps.push({
          x: W * (-0.15 + Math.random() * 1.3),
          y: H * (-0.06 + Math.pow(r, 0.9) * 0.5),
          vx: (Math.random() - 0.5) * 14,
          vy: -(0.5 + Math.random() * 2.5),
          size0: 60 + Math.random() * 70,
          size1: 190 + Math.random() * 160,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.22,
          age: 0,
          life: 5 + Math.random() * 5,
          a0: 0.16 + Math.random() * 0.2,
          depth: Math.random(),
          sp: pickSprite(),
          edge: r,
        });
        return;
      }
      ps.push({
        x: W * (0.68 + Math.random() * 0.44),
        y: H * (0.18 + Math.pow(r, 0.8) * 0.62),
        vx: -(4 + Math.random() * 12),
        vy: -(1 + Math.random() * 6),
        size0: 70 + Math.random() * 90,
        size1: 260 + Math.random() * 240,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.22,
        age: 0,
        life: 6 + Math.random() * 5,
        a0: 0.13 + Math.random() * 0.18,
        depth: Math.random(),
        sp: pickSprite(),
        edge: r,
      });
    };

    const sim = (dt: number) => {
      t += dt;
      acc += dt * 30 * density;
      while (acc >= 1) {
        spawn();
        acc -= 1;
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.age += dt;
        if (p.age >= p.life) {
          ps.splice(i, 1);
          continue;
        }
        /* Shared curl-ish field: neighbours tumble coherently, like one cloud. */
        const ang =
          Math.sin(p.y * 0.0038 + t * 0.42) +
          Math.sin(p.x * 0.0021 - t * 0.3) +
          Math.cos((p.x + p.y) * 0.0013 + t * 0.18);
        p.vx += (Math.cos(ang) * 9 - p.vx * 0.5) * dt;
        /* The ceiling bank has no rising draft — it hangs and tumbles. */
        p.vy += (Math.sin(ang) * (top ? 5 : 9) - (top ? 0.6 : 4) - p.vy * 0.5) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (top && p.y < -H * 0.12) p.y = -H * 0.12;
        p.rot += p.rotV * dt;
      }
    };

    const draw = () => {
      bctx.clearRect(0, 0, W, H);
      fctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        const u = p.age / p.life;
        const env = Math.sin(Math.PI * u);
        /* Organic left falloff; vertical envelope: dead above the header band
           (smoke never touches the fixed header or the block above), ramping in
           under the heading, and a LONG bottom fade far below the section edge
           so the wall drains downward with no straight cut line. */
        let alpha: number;
        if (top) {
          /* Ceiling bank: full strength at the edge, a staggered smoothstep
             fade between 40% and 95% of the canvas — a ragged hem, no line. */
          const cut = H * (0.4 + 0.55 * p.edge);
          const tBot = Math.min(1, Math.max(0, (cut - p.y) / (H * 0.16)));
          alpha = p.a0 * env * (tBot * tBot * (3 - 2 * tBot));
        } else {
          const xa = Math.min(1, Math.max(0, (p.x / W - 0.4) / 0.22));
          const yaTop = Math.min(1, Math.max(0, (p.y / H - 0.075) / 0.18));
          /* Per-particle death depth staggered from the section edge down to
             ~38vh below it: some clumps fully hang over the next block, and no
             two share a cut line. Smoothstepped — no linear knee. */
          const cut = H * (0.76 + 0.2 * p.edge);
          const tBot = Math.min(1, Math.max(0, (cut - p.y) / (H * 0.07)));
          const yaBot = tBot * tBot * (3 - 2 * tBot);
          alpha = p.a0 * env * xa * yaTop * yaBot;
        }
        if (alpha <= 0.004) continue;
        const front_ = p.depth > 0.68;
        const ctx = front_ ? fctx : bctx;
        const size = (p.size0 + (p.size1 - p.size0) * u) * sizeScale;
        ctx.globalAlpha = front_ ? alpha * 0.7 : alpha;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(sprites[p.sp], -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    };

    /* Pre-warm: the wall must already be a full cloud on first sight. */
    for (let i = 0; i < 220; i++) sim(1 / 30);

    let running = false;
    let visible = false;
    let paused = false;
    let raf = 0;
    let last = 0;

    const frame = (ts: number) => {
      if (!running) return;
      const dt = Math.min(0.05, last ? (ts - last) / 1000 : 1 / 60);
      last = ts;
      sim(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || paused || !visible || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(back);
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
    window.addEventListener('resize', fit);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('smoke:pause', onPause);
      window.removeEventListener('smoke:resume', onResume);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', fit);
    };
  }, [edge, density, sizeScale]);

  if (edge === 'top') {
    /* Ceiling bank: both layers fill the (explicitly sized) parent. */
    return (
      <>
        <canvas ref={backRef} aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 h-full w-full', className)} />
        <canvas ref={frontRef} aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 h-full w-full', className)} />
      </>
    );
  }

  /* The canvases start AT the section top (smoke never climbs onto the block
     above) but overhang far below it, so the wall drains downward onto the
     next section and dissolves there. NOTE: canvas is a replaced element — a
     top/bottom inset pair does NOT stretch it, so the height must be explicit. */
  return (
    <>
      <canvas ref={backRef} aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 z-0 h-[calc(100%+44vh)] w-full', className)} />
      <canvas ref={frontRef} aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 z-20 h-[calc(100%+44vh)] w-full', className)} />
    </>
  );
}
