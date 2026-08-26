import { cn } from '@/lib/utils';

/** Max-width 1440px editorial column. */
export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12', className)}>
      {children}
    </div>
  );
}
