/**
 * Tiny singleton emitter so any scene can trigger a spark/smoke burst without
 * holding a reference to the engine. SmokeCursor subscribes; scenes call
 * triggerBurst(). No window globals.
 */
import type { BurstKind } from './particles';

type BurstFn = (x: number, y: number, kind: BurstKind) => void;

let sink: BurstFn | null = null;

export function subscribeBurst(fn: BurstFn): () => void {
  sink = fn;
  return () => {
    if (sink === fn) sink = null;
  };
}

/** Fire a burst at viewport coordinates (x, y). No-op if no engine mounted. */
export function triggerBurst(x: number, y: number, kind: BurstKind = 'both'): void {
  sink?.(x, y, kind);
}
