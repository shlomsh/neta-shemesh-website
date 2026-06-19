import React from 'react';

interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  onDark?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}

/**
 * The standard Stanga fluid body text paragraph.
 */
export function BodyText({
  onDark = false,
  centered = false,
  className = '',
  children,
  ...props
}: BodyTextProps) {
  const colorClass = onDark ? 'text-[var(--color-white)]' : 'text-[var(--color-text-primary)]';
  const alignClass = centered ? 'text-center' : 'text-right';

  return (
    <p
      className={`font-[family-name:var(--font-stanga)] leading-[1.46] tracking-[0.012em] text-[clamp(15px,1.2vw,18px)] ${colorClass} ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
