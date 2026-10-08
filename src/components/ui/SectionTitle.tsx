import React from 'react';

export function SectionTitle({
  id,
  children,
  className = '',
  onDark = false,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { onDark?: boolean }) {
  return (
    <h2
      id={id}
      className={`type-title font-bold tracking-[-0.01em] text-[color:var(--header-color)] ${onDark ? 'on-dark' : ''} ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}
