import React from 'react';

type BgVariant = 'white' | 'light' | 'dark' | 'transparent';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  bgVariant?: BgVariant;
  fullHeight?: boolean;
  children: React.ReactNode;
}

const BG_MAP: Record<BgVariant, string> = {
  white: 'bg-[var(--color-white)]',
  light: 'bg-[var(--color-bg-light)]',
  dark: 'bg-[var(--color-dark)]',
  transparent: 'bg-transparent',
};

/**
 * Universal wrapper for standard pages/slides. 
 * Enforces RTL by default, sets background, and optionally locks to 100svh.
 */
export function Section({
  id,
  bgVariant = 'transparent',
  fullHeight = false,
  className = '',
  children,
  ...props
}: SectionProps) {
  const heightClass = fullHeight ? 'min-h-[100svh] flex flex-col justify-center' : '';
  
  return (
    <section
      id={id}
      dir="rtl"
      className={`relative w-full overflow-hidden ${BG_MAP[bgVariant]} ${heightClass} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
