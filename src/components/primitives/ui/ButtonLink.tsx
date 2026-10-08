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
 * Sizes: `md` (default) and `sm` (44–54px tall, used by hero CTA / nav pill).
 * Both keep the type floor at 14px or above. Sizing classes are mutually
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
    'inline-flex items-center justify-center whitespace-nowrap font-[family-name:var(--font-stanga)] font-bold uppercase tracking-[0.138em] rounded-full transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const sizes = {
    md: 'py-[18px] px-[44px] shadow-lg hover:shadow-xl',
    sm: 'h-[clamp(44px,5.4vw,54px)] px-[clamp(16px,2.5vw,32px)] text-[clamp(14px,1.4vw,17px)] md:text-[20px] leading-[1.375] shadow-md hover:shadow-lg',
  };

  const variants = {
    primary:
      'bg-[var(--color-plum)] text-[var(--color-cream)] hover:bg-[color:color-mix(in_srgb,var(--color-plum)_88%,black)] focus-visible:ring-[var(--color-plum)] focus-visible:ring-offset-[var(--color-cream)]',
    secondary:
      'bg-[var(--color-cream)] text-[var(--color-plum)] hover:bg-[color:color-mix(in_srgb,var(--color-cream)_85%,var(--color-blush))] focus-visible:ring-[var(--color-cream)] focus-visible:ring-offset-[var(--color-plum)]',
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
