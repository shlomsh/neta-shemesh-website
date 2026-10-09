import React from 'react';
import { cx } from '@/lib/cx';

type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'aria-label' | 'children'> & {
  /** The accessible name (the icon itself is decorative). Required: there is no visible text. */
  label: string;
  /** The icon, normally an `<svg aria-hidden="true">` drawn with `currentColor`. */
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
};

const BASE =
  'inline-flex h-[44px] w-[44px] items-center justify-center rounded-full text-cream transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream';

/**
 * A round 44px icon-only button in the cream-on-plum header style (hamburger, menu close).
 * 44px is the touch-target floor; the ring is the keyboard focus indicator. Visibility
 * (`md:hidden`) and behaviour (`onClick`, `aria-expanded`, `aria-controls`, `ref`) come from the caller.
 */
export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} {...rest} className={cx(BASE, className)}>
      {children}
    </button>
  );
}
