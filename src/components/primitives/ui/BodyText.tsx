import type React from 'react';
import { cx } from '@/lib/cx';

interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  centered?: boolean;
  children: React.ReactNode;
}

/**
 * The standard Stanga fluid body text paragraph (font, tracking and line-height
 * come from the `type-*` class).
 *
 * Color: never set here. It inherits from the nearest [data-bg-tone] ancestor
 * (globals.css), so a <Section> picks the right text color automatically.
 *
 * Size: defaults to `type-body`; pass any `type-*` class via `className` to
 * replace it (BodyText then skips `type-body` to avoid cascade collisions).
 * Contrast is solved by the tone/colour system, not by forcing bold.
 */
export function BodyText({
  centered = false,
  className,
  children,
  ...props
}: BodyTextProps) {
  const alignClass = centered ? 'text-center' : 'text-right';
  // Don't add type-body if caller already supplies a type-* scale class — their
  // class would lose to type-body due to CSS declaration order otherwise.
  const hasTypeClass = /\btype-[a-z]/.test(className ?? '');

  return (
    <p
      className={cx(!hasTypeClass && 'type-body', alignClass, className)}
      {...props}
    >
      {children}
    </p>
  );
}
