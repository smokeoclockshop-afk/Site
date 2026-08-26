/**
 * SmokeEngine — a tiny allocation-free canvas particle system (no React, no
 * dependencies). Drives three things across the site:
 *   • the cursor smoke trail + click puffs (SmokeCursor)
 *   • ambient smoke/embers behind hero / final-CTA scenes
 *   • on-demand spark bursts triggered by scenes (via burst.ts)
 *
 * Realism model (looks like actual smoke, not soft blobs):
 *   • sprites are mottled noise-textured wisps with torn edges (3 variants
 *     per tint), not uniform radial gradients;
 *   • particles are advected by a SHARED spatial curl-flow field, so
 *     neighbouring wisps swirl coherently into filaments;
 *   • sprites stretch along their velocity, buoyancy pulls them up;
 *   • two tints: 'light' (pale smoke for dark backgrounds, drawn with
 *     'screen' so it glows like backlit smoke) and 'dark' (warm soot for the
 *     parchment sections, drawn with normal alpha).
 *
 * Budget: ≤2ms/frame. No allocations, shadowBlur or filters inside the loop.
 * Sleeps when idle (0 live particles and no ambient) and wakes on demand.
 */

export type BurstKind = 'smoke' | 'sparks' | 'both';
export type SmokeVariant = 'light' | 'dark';

interface Particle {
  active: boolean;
  spark: boolean;
  /** 0 = light tint (for dark bg), 1 = dark tint (for light bg). */
  variant: 0 | 1;
  spriteIdx: number;
  x: number;
  y: number;
  px: number; // previous position (spark trail)
  py: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size0: number;
  size1: number;
  seed: number;
  rot: number;
  rotV: number;
  color: string;
}

interface EngineOptions {
  /** Ambient smoke spawned along the bottom edge, particles/second. */
  ambientRate?: number;
  /** Tint used for ambient particles. */
  ambientVariant?: SmokeVariant;
  /** Max live particles (auto-degrades under load). */
  poolSize?: number;
  /** 'window' (full-screen cursor canvas) or 'parent' (scoped field). */
  sizeTo?: 'window' | 'parent';
}

const SPARK_COLORS = ['#f3a340', '#e8721f', '#c2570f'];
const SPRITE_SIZE = 128;
const SPRITES_PER_TINT = 3;

function rand(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

/** Smooth value-noise field: random tiny grid upscaled with bilinear smoothing. */
function makeNoiseField(size: number, cell: number): Float32Array {
  const n = Math.max(2, Math.round(size / cell));
  const tiny = document.createElement('canvas');
  tiny.width = n;
  tiny.height = n;
  const tc = tiny.getContext('2d')!;
  const img = tc.createImageData(n, n);
  for (let i = 0; i < n * n; i++) {
    const v = (Math.random() * 255) | 0;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  tc.putImageData(img, 0, 0);
  const big = document.createElement('canvas');
  big.width = size;
  big.height = size;
  const bc = big.getContext('2d')!;
  bc.imageSmoothingEnabled = true;
  bc.imageSmoothingQuality = 'high';
  bc.drawImage(tiny, 0, 0, size, size);
  const d = bc.getImageData(0, 0, size, size).data;
  const out = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) out[i] = d[i * 4] / 255;
  return out;
}

/** Mottled wisp sprite: radial falloff × layered noise → torn smoke texture. */
function buildWispSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const S = SPRITE_SIZE;
  const coarse = makeNoiseField(S, 24);
  const fine = makeNoiseField(S, 9);
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const cx = c.getContext('2d')!;
  const img = cx.createImageData(S, S);
  const R = S / 2;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const dx = (x - R) / R;
      const dy = (y - R) / R;
      const d = Math.sqrt(dx * dx + dy * dy);
      let fall = 1 - d;
      if (fall < 0) fall = 0;
      fall = fall * fall * (3 - 2 * fall); // smoothstep
      const noise = coarse[i] * 0.62 + fine[i] * 0.38;
      let a = fall * Math.pow(noise, 1.7) * 1.6;
      if (a > 1) a = 1;
      const o = i * 4;
      img.data[o] = r;
      img.data[o + 1] = g;
      img.data[o + 2] = b;
      img.data[o + 3] = (a * 255) | 0;
    }
  }
  cx.putImageData(img, 0, 0);
  return c;
}

export class SmokeEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pool: Particle[] = [];
  private poolSize: number;
  /** sprites[variant][idx] — 0: light tint, 1: dark tint. */
  private sprites: HTMLCanvasElement[][];
  private rafId = 0;
  private last = 0;
  private time = 0;
  private running = false;
  private dpr = 1;
  private w = 0;
  private h = 0;

  private ambientRate: number;
  private ambientAcc = 0;
  private ambientVariant: 0 | 1;
  private sizeTo: 'window' | 'parent';

  // Cursor repeller (final-CTA scene). Radius 0 = disabled.
  private repX = 0;
  private repY = 0;
  private repR = 0;
  private repForce = 0;

  // Auto-degrade tracking.
  private slowMs = 0;
  private degraded = false;

  constructor(canvas: HTMLCanvasElement, opts: EngineOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.poolSize = opts.poolSize ?? 288;
    this.ambientRate = opts.ambientRate ?? 0;
    this.ambientVariant = opts.ambientVariant === 'dark' ? 1 : 0;
    this.sizeTo = opts.sizeTo ?? 'window';

    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push({
        active: false, spark: false, variant: 0, spriteIdx: 0,
        x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0,
        age: 0, life: 0, size0: 0, size1: 0, seed: 0, rot: 0, rotV: 0, color: '',
      });
    }
    // Pale backlit smoke for dark surfaces / warm soot for light parchment.
    this.sprites = [
      Array.from({ length: SPRITES_PER_TINT }, () => buildWispSprite(212, 210, 208)),
      Array.from({ length: SPRITES_PER_TINT }, () => buildWispSprite(88, 78, 68)),
    ];
    this.resize();
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.sizeTo === 'parent' && this.canvas.parentElement) {
      const r = this.canvas.parentElement.getBoundingClientRect();
      this.w = Math.max(1, r.width);
      this.h = Math.max(1, r.height);
    } else {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
    }
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setAmbientRate(rate: number): void {
    this.ambientRate = rate;
    if (rate > 0) this.wake();
  }

  setRepeller(x: number, y: number, r: number, force: number): void {
    this.repX = x;
    this.repY = y;
    this.repR = r;
    this.repForce = force;
  }

  /** Shared spatial curl-flow — neighbouring particles swirl coherently. */
  private flowAngle(x: number, y: number): number {
    const t = this.time;
    const s =
      Math.sin(x * 0.0062 + t * 0.55) +
      Math.cos(y * 0.0053 - t * 0.38) +
      Math.sin((x + y) * 0.0027 + t * 0.21);
    return s * 2.1;
  }

  private alloc(): Particle | null {
    let oldest: Particle | null = null;
    let oldestAge = -1;
    for (const p of this.pool) {
      if (!p.active) return p;
      const t = p.age / p.life;
      if (t > oldestAge) {
        oldestAge = t;
        oldest = p;
      }
    }
    return oldest;
  }

  private initSmoke(p: Particle, x: number, y: number, vx: number, vy: number, variant: 0 | 1): void {
    p.active = true;
    p.spark = false;
    p.variant = variant;
    p.spriteIdx = (Math.random() * SPRITES_PER_TINT) | 0;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.age = 0;
    p.life = rand(1.6, 2.4);
    p.size0 = rand(8, 14);
    p.size1 = rand(38, 66);
    p.seed = Math.random();
    p.rot = rand(0, Math.PI * 2);
    p.rotV = rand(-0.5, 0.5);
    p.color = '';
  }

  private initSpark(p: Particle, x: number, y: number): void {
    p.active = true;
    p.spark = true;
    p.x = x;
    p.y = y;
    p.px = x;
    p.py = y;
    p.vx = rand(-90, 90);
    p.vy = rand(-120, -40);
    p.age = 0;
    p.life = rand(0.45, 0.8);
    p.size0 = rand(2, 3);
    p.seed = Math.random();
    p.rot = rand(0, Math.PI * 2);
    p.rotV = rand(-6, 6);
    p.color = SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0];
  }

  /** Cursor trail — a wisp seeded from the pointer, lagging + rising. */
  spawnTrail(x: number, y: number, vx: number, vy: number, variant: SmokeVariant = 'dark'): void {
    const p = this.alloc();
    if (!p) return;
    this.initSmoke(
      p,
      x + rand(-4, 4),
      y + rand(-4, 4),
      vx * 0.06 + rand(-7, 7),
      vy * 0.06 - 16 + rand(-6, 6),
      variant === 'light' ? 0 : 1,
    );
    this.wake();
  }

  /** Radial burst of smoke and/or sparks (clicks + scene triggers). */
  burst(x: number, y: number, kind: BurstKind = 'both', variant: SmokeVariant = 'dark'): void {
    const v: 0 | 1 = variant === 'light' ? 0 : 1;
    if (kind === 'smoke' || kind === 'both') {
      // A rising plume: an upward cone of bigger, longer-lived wisps.
      const n = 26;
      for (let i = 0; i < n; i++) {
        const p = this.alloc();
        if (!p) break;
        const a = -Math.PI / 2 + rand(-1.05, 1.05);
        const sp = rand(26, 100);
        this.initSmoke(p, x + rand(-7, 7), y + rand(-4, 4), Math.cos(a) * sp, Math.sin(a) * sp, v);
        p.life = rand(2.0, 3.1);
        p.size0 = rand(10, 18);
        p.size1 = rand(72, 132);
        p.rotV = rand(-0.8, 0.8);
      }
    }
    if (kind === 'sparks' || kind === 'both') {
      const n = rand(8, 12) | 0;
      for (let i = 0; i < n; i++) {
        const p = this.alloc();
        if (!p) break;
        this.initSpark(p, x, y);
      }
    }
    this.wake();
  }

  private spawnAmbient(): void {
    const p = this.alloc();
    if (!p) return;
    const x = rand(0, this.w);
    const y = this.h + rand(0, 24);
    this.initSmoke(p, x, y, rand(-9, 9), rand(-36, -16), this.ambientVariant);
    // Big slow background wisps — reads as drifting smoke, not confetti.
    p.life = rand(4, 7);
    p.size0 = rand(22, 36);
    p.size1 = rand(110, 190);
  }

  start(): void {
    this.wake();
  }

  private wake(): void {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.rafId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    if (document.hidden) {
      this.rafId = requestAnimationFrame(this.frame);
      return;
    }
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.033) : 0.016;
    const frameMs = this.last ? now - this.last : 16;
    this.last = now;
    this.time += dt;

    // Auto-degrade once if we run slow for ~2s.
    if (!this.degraded) {
      if (frameMs > 24) {
        this.slowMs += frameMs;
        if (this.slowMs > 2000) {
          this.degraded = true;
          this.poolSize = 96;
        }
      } else {
        this.slowMs = Math.max(0, this.slowMs - frameMs);
      }
    }

    if (this.ambientRate > 0) {
      this.ambientAcc += this.ambientRate * dt;
      while (this.ambientAcc >= 1) {
        this.spawnAmbient();
        this.ambientAcc -= 1;
      }
    }

    const live = this.update(dt);
    this.render();

    if (live === 0 && this.ambientRate <= 0) {
      this.running = false;
      this.rafId = 0;
      return;
    }
    this.rafId = requestAnimationFrame(this.frame);
  };

  private update(dt: number): number {
    let live = 0;
    let limit = this.pool.length;
    if (this.degraded) limit = this.poolSize;
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      if (i >= limit) {
        p.active = false;
        continue;
      }
      p.age += dt;
      if (p.age >= p.life) {
        p.active = false;
        continue;
      }
      p.px = p.x;
      p.py = p.y;

      if (p.spark) {
        p.vy += 260 * dt; // gravity
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.rotV * dt;
      } else {
        // The shared flow takes over as the wisp ages: young particles follow
        // the cursor/burst impulse, older ones curl with their neighbours.
        const ang = this.flowAngle(p.x, p.y);
        const grip = 34 * Math.min(1, p.age * 1.3);
        p.vx += Math.cos(ang) * grip * dt;
        p.vy += Math.sin(ang) * grip * dt;
        p.vy -= 15 * dt; // buoyancy
        p.vx *= 1 - 0.7 * dt;
        p.vy *= 1 - 0.3 * dt;
        if (this.repR > 0) {
          const dx = p.x - this.repX;
          const dy = p.y - this.repY;
          const d = Math.hypot(dx, dy);
          if (d < this.repR && d > 0.01) {
            const f = (1 - d / this.repR) * this.repForce;
            p.vx += (dx / d) * f * dt;
            p.vy += (dy / d) * f * dt;
          }
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.rotV * dt;
      }
      live++;
    }
    return live;
  }

  /** Draw one smoke pass for a given tint with the right composite mode. */
  private renderSmokePass(variant: 0 | 1): void {
    const ctx = this.ctx;
    // Pale smoke glows over dark surfaces; soot shades light parchment.
    ctx.globalCompositeOperation = variant === 0 ? 'screen' : 'source-over';
    const peak = variant === 0 ? 0.2 : 0.16;
    for (const p of this.pool) {
      if (!p.active || p.spark || p.variant !== variant) continue;
      const t = p.age / p.life;
      const size = p.size0 + (p.size1 - p.size0) * (1 - (1 - t) * (1 - t)); // easeOutQuad
      const a = t < 0.15 ? (t / 0.15) * peak : peak * (1 - ((t - 0.15) / 0.85) ** 2);
      if (a <= 0) continue;
      ctx.globalAlpha = a;
      const speed = Math.hypot(p.vx, p.vy);
      const stretch = 1 + Math.min(speed / 240, 0.85);
      const velAng = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(velAng + p.rot * 0.25);
      ctx.scale(stretch, 1);
      ctx.drawImage(this.sprites[variant][p.spriteIdx], -size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    this.renderSmokePass(0);
    this.renderSmokePass(1);

    // Sparks — additive-looking warm embers with a cheap motion-blur trail.
    ctx.globalCompositeOperation = 'source-over';
    for (const p of this.pool) {
      if (!p.active || !p.spark) continue;
      const t = p.age / p.life;
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size0;
      ctx.beginPath();
      const dx = p.x - p.px;
      const dy = p.y - p.py;
      const len = Math.min(Math.hypot(dx, dy), 6);
      const ang = Math.atan2(dy, dx);
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.cos(ang) * len, p.y - Math.sin(ang) * len);
      ctx.stroke();

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size0 / 2, -p.size0 / 2, p.size0, p.size0);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  destroy(): void {
    this.stop();
    this.pool.length = 0;
  }
}
