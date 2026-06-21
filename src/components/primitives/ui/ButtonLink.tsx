import React from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
}

/**
 * Standardized CTA ButtonLink.
 *
 * Variants are surface-aware (the button must contrast with the section it
 * sits on, per the design-system contrast pairs):
 *   - `primary`   → solid plum fill + cream text. For LIGHT/MID surfaces
 *                   (cream, blush, mauve). Cream-on-plum is 7.4:1 AAA.
 *   - `secondary` → solid cream fill + plum text. For DARK (plum) surfaces.
 *
 * The previous secondary used a mauve fill, which was invisible on the mauve
 * `mid` Services section — that was the "buggy, not-a-button" bug.
 */
export function ButtonLink({
  href,
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonLinkProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-[family-name:var(--font-stanga)] font-bold uppercase tracking-[0.138em] rounded-2xl py-[18px] px-[44px] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-plum)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cream)]';

  const variants = {
    primary: 'bg-[var(--color-plum)] text-[var(--color-cream)] hover:bg-[color:color-mix(in_srgb,var(--color-plum)_88%,black)]',
    secondary: 'bg-[var(--color-cream)] text-[var(--color-plum)] hover:bg-white',
  };

  return (
    <a
      href={href}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
