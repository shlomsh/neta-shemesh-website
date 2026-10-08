import React from 'react';

interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  onDark?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}

/**
 * The standard Stanga fluid body text paragraph (font, tracking and line-height
 * come from the `type-*` class).
 *
 * Color behavior:
 *   - If an ancestor <Section> sets data-bg-tone="dark" or "mid", the CSS
 *     custom property `color` is already cream via globals.css — so the
 *     `inherit` fallback (no explicit color class) is correct.
 *   - The `onDark` prop is kept for backward-compat and explicit overrides.
 *     When not passed, color inherits from the nearest [data-bg-tone] ancestor.
 *
 * Size: defaults to `type-body`; pass any `type-*` class via `className` to
 * replace it (BodyText then skips `type-body` to avoid cascade collisions).
 * Contrast is solved by the tone/colour system, not by forcing bold.
 */
export function BodyText({
  onDark,
  centered = false,
  className = '',
  children,
  ...props
}: BodyTextProps) {
  // onDark=true  → force cream text (explicit override, backward-compat)
  // onDark=false → force dark text  (explicit override, backward-compat)
  // onDark=undefined → inherit color from [data-bg-tone] ancestor via CSS
  const colorClass =
    onDark === true
      ? 'text-[var(--color-white)]'
      : onDark === false
        ? 'text-[var(--color-text-primary)]'
        : ''; // inherit from section tone

  const alignClass = centered ? 'text-center' : 'text-right';
  // Don't add type-body if caller already supplies a type-* scale class — their
  // class would lose to type-body due to CSS declaration order otherwise.
  const sizeClass = /\btype-[a-z]/.test(className) ? '' : 'type-body';

  return (
    <p
      className={`${sizeClass} ${colorClass} ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
