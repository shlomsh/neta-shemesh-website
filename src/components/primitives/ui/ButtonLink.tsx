import React from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
}

/**
 * Standardized CTA ButtonLink.
 */
export function ButtonLink({
  href,
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonLinkProps) {
  const baseClasses = 'inline-block font-bold uppercase tracking-[0.138em] rounded transition-all shadow-lg hover:opacity-90';
  
  const variants = {
    primary: 'bg-[var(--color-brand-primary)] text-white py-[20px] px-[48px]',
    secondary: 'bg-[var(--color-canva-mid)] text-white py-[14px] px-[32px]',
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
