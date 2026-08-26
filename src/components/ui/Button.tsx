'use client';

import { btn, type ButtonVariant } from './button-styles';

/** Action button (modal triggers, etc.). For navigation, use a Link with btn(). */
export function Button({
  children,
  variant = 'primary',
  className,
  onClick,
  type = 'button',
  ariaLabel,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      className={btn(variant, cnCursor(className))}
    >
      {children}
    </button>
  );
}

function cnCursor(className?: string) {
  return className ? `cursor-pointer ${className}` : 'cursor-pointer';
}
