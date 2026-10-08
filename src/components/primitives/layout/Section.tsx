import React from 'react';

/**
 * All accepted bgVariant values.
 *
 * Canonical 4-tone names:
 *   'dark'        → #7A5978  (bg) + cream text
 *   'mid'         → #C49AB8  (bg) + cream text (decorative surface; see CLAUDE.md contrast table)
 *   'light'       → #ECC8CE  (bg) + dark text   (quote-scale text only, AA large)
 *   'cream'       → #FFF5F0  (bg) + dark text
 *   'transparent' → no background, no data-bg-tone
 *
 * Legacy alias (no caller left; removal is part of tech-debt batch 3):
 *   'white'       → maps to 'cream' behavior
 */
type BgVariant = 'dark' | 'mid' | 'light' | 'cream' | 'white' | 'transparent';

/** Which data-bg-tone attribute to set (drives CSS custom properties in globals.css) */
type BgTone = 'dark' | 'mid' | 'light' | 'cream' | undefined;

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  bgVariant?: BgVariant;
  fullHeight?: boolean;
  children: React.ReactNode;
}

/**
 * Maps canonical variant name → data-bg-tone value.
 * The CSS in globals.css uses [data-bg-tone="…"] to set bg-color,
 * foreground color and --header-color.
 */
const TONE_MAP: Record<BgVariant, BgTone> = {
  dark:        'dark',
  mid:         'mid',
  light:       'light',
  cream:       'cream',
  white:       'cream',   // legacy alias
  transparent: undefined,
};

/**
 * Universal wrapper for standard pages/slides.
 * Enforces RTL by default, sets background via data-bg-tone, and
 * optionally locks to 100svh.
 *
 * Background + text color are controlled entirely by globals.css
 * [data-bg-tone] selectors — children inherit the right text color without
 * any per-component onDark flag.
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
  const tone = TONE_MAP[bgVariant];

  return (
    <section
      id={id}
      dir="rtl"
      data-bg-tone={tone}
      className={`relative w-full overflow-hidden ${heightClass} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
