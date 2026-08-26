'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SiteContent } from '@/lib/content';
import { track } from '@/lib/analytics';

export interface OrderPayload {
  /** Selected configurator options (labels). */
  config?: string[];
  /** Quiz answers. */
  answers?: string[];
  /** Quiz result / recommended product. */
  result?: string;
  /** Product name for catalog/product orders. */
  product?: string;
}

interface OrderCtx {
  isOpen: boolean;
  source: string;
  payload: OrderPayload;
  content: SiteContent['order'];
  open: (source: string, payload?: OrderPayload) => void;
  close: () => void;
}

const Ctx = createContext<OrderCtx | null>(null);

export function OrderModalProvider({
  content,
  children,
}: {
  content: SiteContent['order'];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('header');
  const [payload, setPayload] = useState<OrderPayload>({});

  const open = useCallback((s: string, p: OrderPayload = {}) => {
    setSource(s);
    setPayload(p);
    setIsOpen(true);
    track('order_modal_open', { source: s });
    window.dispatchEvent(new Event('smoke:pause'));
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    window.dispatchEvent(new Event('smoke:resume'));
  }, []);

  const value = useMemo<OrderCtx>(
    () => ({ isOpen, source, payload, content, open, close }),
    [isOpen, source, payload, content, open, close],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrder() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOrder must be used within OrderModalProvider');
  return ctx;
}
