import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'saffron' | 'ghost' | 'ghostLight' | 'solidLight' | 'text' | 'textLight';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[2px] px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300 select-none';

/**
 * Smoke O'Clock buttons (editorial): a solid dark primary on light surfaces, a
 * saffron accent, hairline ghosts for light and dark surfaces, plus text links.
 */
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-onyx text-parchment-50 hover:bg-roast-700',
  saffron: 'bg-saffron-500 text-onyx hover:bg-saffron-600',
  ghost: 'border border-onyx/25 text-onyx hover:bg-onyx hover:text-parchment-50',
  ghostLight: 'border border-parchment-50/60 text-parchment-50 hover:bg-parchment-50 hover:text-onyx',
  solidLight: 'bg-parchment-50 text-onyx hover:bg-parchment-100',
  text: 'px-0 text-saffron-600 underline underline-offset-4 hover:text-saffron-500',
  textLight: 'px-0 text-parchment-50 underline underline-offset-4 hover:text-saffron-300',
};

export function btn(variant: ButtonVariant = 'primary', className?: string) {
  return cn(base, variants[variant], className);
}
