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
      className={`font-[family-name:var(--font-canva-accent)] font-bold text-[clamp(28px,4.375vw,56px)] leading-[1.2] tracking-[-0.01em] normal-case ${onDark ? 'text-[var(--color-white)]' : 'text-[var(--color-text-primary)]'} ${className}`}
      {...props}
    >
      {spanId ? <span id={spanId}>{children}</span> : children}
    </h2>
  );
}
