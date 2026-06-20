import React from 'react';

interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  onDark?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}

/**
 * The standard Stanga fluid body text paragraph.
 *
 * Color behavior:
 *   - If an ancestor <Section> sets data-bg-tone="dark" or "mid", the CSS
 *     custom property `color` is already cream via globals.css — so the
 *     `inherit` fallback (no explicit color class) is correct.
 *   - The `onDark` prop is kept for backward-compat and explicit overrides.
 *     When not passed, color inherits from the nearest [data-bg-tone] ancestor.
 *
 * Large-text AA bump:
 *   - On mid/light sections globals.css sets --section-needs-large-text: 1.
 *   - We read that via a CSS @container style query — but since Tailwind v4 /
 *     Next.js 15 runs in the browser, we use a simpler approach: emit
 *     data-body-large="true" unconditionally and let CSS apply the bump only
 *     when the ancestor has --section-needs-large-text: 1, via the
 *     :where([data-bg-tone="mid"], [data-bg-tone="light"]) p[data-body-large]
 *     rule already defined in globals.css.
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

  return (
    <p
      data-body-large="true"
      className={`font-[family-name:var(--font-stanga)] leading-[1.46] tracking-[0.012em] text-[clamp(15px,1.2vw,18px)] ${colorClass} ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
