import React from 'react';

export function SectionTitle({
  id,
  spanId,
  children,
  className = '',
  onDark = false,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { spanId?: string; onDark?: boolean }) {
  return (
    <h2
      id={id}
      className={`section-header ${onDark ? 'on-dark text-[var(--color-white)]' : 'text-[var(--color-text-primary)]'} font-[family-name:var(--font-canva-accent)] font-bold leading-[1.2] tracking-[-0.01em] normal-case ${className}`}
      {...props}
    >
      {spanId ? <span id={spanId}>{children}</span> : children}
    </h2>
  );
}
