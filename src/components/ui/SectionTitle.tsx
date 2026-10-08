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
      className={`type-title font-bold tracking-[-0.01em] text-[color:var(--header-color)] ${onDark ? 'on-dark' : ''} ${className}`}
      {...props}
    >
      {spanId ? <span id={spanId}>{children}</span> : children}
    </h2>
  );
}
