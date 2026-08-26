import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Row of ember stars for reviews. */
export function StarRating({
  value = 5,
  className,
  size = 'size-4',
}: {
  value?: number;
  className?: string;
  size?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-ember-500', className)} aria-label={`${value} з 5 зірок`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(size, i < value ? 'fill-ember-500' : 'fill-transparent opacity-30')}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
