'use client';

import { Send, MessageCircle, AtSign } from 'lucide-react';
import { site } from '@/lib/site';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const ITEMS = [
  { key: 'telegram', label: 'Telegram', href: site.messengers.telegram, Icon: Send },
  { key: 'viber', label: 'Viber', href: site.messengers.viber, Icon: MessageCircle },
  { key: 'instagram', label: 'Instagram', href: site.messengers.instagram, Icon: AtSign },
] as const;

/** Row of messenger contact buttons. `place` tags the analytics event. */
export function MessengerRow({
  place,
  className,
  big = false,
  compact = false,
  tone = 'light',
}: {
  place: string;
  className?: string;
  big?: boolean;
  /** Tight buttons for modals. */
  compact?: boolean;
  /** 'light' = for light surfaces (dark border/text); 'dark' = for dark surfaces. */
  tone?: 'light' | 'dark';
}) {
  const surface =
    tone === 'dark'
      ? 'border-parchment-50/25 text-parchment-100 hover:border-saffron-400 hover:bg-parchment-50/10'
      : 'border-onyx/20 text-onyx hover:border-saffron-500 hover:bg-saffron-500/10';
  return (
    <div className={cn('flex flex-wrap', compact ? 'gap-2' : 'gap-3', className)} data-no-burst>
      {ITEMS.map(({ key, label, href, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('messenger_click', { channel: key, place })}
          className={cn(
            'inline-flex items-center gap-2 border text-sm font-medium transition-colors',
            surface,
            big ? 'px-5 py-4' : compact ? 'px-3 py-2' : 'px-4 py-3',
          )}
        >
          <Icon className="size-4 text-saffron-500" aria-hidden />
          {label}
        </a>
      ))}
    </div>
  );
}
