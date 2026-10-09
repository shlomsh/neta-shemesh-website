import React from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'md' | 'sm';

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  /** `md` (default) = full CTA button. `sm` = compact pill for the hero / nav. */
  size?: ButtonSize;
  children: React.ReactNode;
}

/**
 * Standardized CTA ButtonLink — the ONLY way to render a button-shaped link.
 *
 * Shape: always a pill (`rounded-full`), per the radius scale in globals.css.
 *
 * Variants are surface-aware (the button must contrast with the section it
 * sits on, per the design-system contrast pairs). Both pairs are 5.55:1:
 *   - `primary`   → solid plum fill + cream text. For LIGHT surfaces
 *                   (cream, blush, mauve).
 *   - `secondary` → solid cream fill + plum text. For DARK (plum) surfaces
 *                   and photo sections (hero, CTA band, footer).
 * A mauve fill is never used: neither cream nor plum text passes on it.
 *
 * Type: one style for every button, `.type-lead` (18-22px) bold, no uppercase and
 * no tracking. Sizes differ only in height: `md` (default, 56px tall) and `sm`
 * (48px tall, used by hero CTA / nav pill). Sizing classes are mutually
 * exclusive per size so `className` extras (width, margin, text size) never
 * fight with the base padding.
 */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonLinkProps) {
  const baseClasses =
    'type-lead inline-flex items-center justify-center whitespace-nowrap font-bold rounded-full transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  // No vertical padding: height comes from min-h alone, so a pill whose label is a
  // smaller-line-box `.font-latin` span (phone number) is exactly as tall as a Hebrew one.
  const sizes = {
    md: 'min-h-[56px] px-[44px] shadow-lg hover:shadow-xl',
    sm: 'min-h-[48px] px-[clamp(20px,2.5vw,32px)] shadow-md hover:shadow-lg',
  };

  const variants = {
    primary:
      'bg-plum text-cream hover:bg-[color:color-mix(in_srgb,var(--color-plum)_88%,black)] focus-visible:ring-plum focus-visible:ring-offset-cream',
    secondary:
      'bg-cream text-plum hover:bg-[color:color-mix(in_srgb,var(--color-cream)_85%,var(--color-blush))] focus-visible:ring-cream focus-visible:ring-offset-plum',
  };

  return (
    <a
      href={href}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
