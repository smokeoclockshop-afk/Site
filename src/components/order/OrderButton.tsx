'use client';

import { btn, type ButtonVariant } from '@/components/ui/button-styles';
import { cn } from '@/lib/utils';
import { useOrder, type OrderPayload } from './OrderModalContext';

/** Opens the order modal, tagged with an analytics `source`. */
export function OrderButton({
  source,
  payload,
  variant = 'primary',
  className,
  children,
}: {
  source: string;
  payload?: OrderPayload;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useOrder();
  return (
    <button
      type="button"
      onClick={() => open(source, payload)}
      className={btn(variant, cn('cursor-pointer', className))}
    >
      {children}
    </button>
  );
}
