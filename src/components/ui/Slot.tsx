import { cn } from '@/lib/utils';
import { getSlot } from '@/lib/media';

/* eslint-disable @next/next/no-img-element */

/**
 * Renders a media slot (see lib/media.ts). While the slot points at a generated
 * SVG placeholder it renders a plain <img>; swap the registry `src` to a real
 * asset in /public/media to go live. The wrapper reserves aspect-ratio → no CLS.
 */
export function Slot({
  id,
  className,
  imgClassName,
  sizes,
  priority,
  rounded = false,
}: {
  id: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  const m = getSlot(id);
  const [w, h] = m.aspect.split('/').map((n) => Number(n.trim()));

  return (
    <div
      className={cn('relative overflow-hidden bg-coal-800', rounded && 'rounded-[2px]', className)}
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      <img
        src={m.src}
        alt={m.alt}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className={cn('absolute inset-0 h-full w-full object-cover', imgClassName)}
      />
    </div>
  );
}
