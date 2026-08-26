/**
 * Thin analytics shim. Pushes events into window.dataLayer (GA4 / GTM / Meta
 * Pixel can be wired via env later — TODO(owner)); logs in development. Safe to
 * call from anywhere, including SSR (no-ops on the server).
 */
type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Params[];
  }
}

export function track(event: string, params?: Params): void {
  if (typeof window === 'undefined') return;
  window.dataLayer?.push({ event, ...params });
  if (process.env.NODE_ENV === 'development') {
    console.debug('[track]', event, params ?? {});
  }
}
