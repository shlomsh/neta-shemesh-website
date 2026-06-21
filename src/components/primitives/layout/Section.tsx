import React from 'react';

/**
 * All accepted bgVariant values.
 *
 * Canonical 4-tone names:
 *   'dark'        → #574964  (bg) + cream text
 *   'mid'         → #9F8383  (bg) + cream text
 *   'light'       → #C8AAAA  (bg) + dark text   (body text auto-bumped to AA large)
 *   'cream'       → #fff0e4  (bg) + dark text
 *   'transparent' → no background
 *
 * Legacy aliases (kept for backward-compat, mapped to canonical tone):
 *   'white'       → maps to 'cream' behavior
 *
 * Note: the old 'light' variant previously mapped to --color-bg-light (≡ cream).
 * It now maps to the new blush (#C8AAAA) tone. Any callers that relied on
 * the old 'light' === cream behavior should migrate to 'cream'.
 * Currently the only caller of bgVariant="light" is Services.tsx — verify intent.
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
 * foreground color, --header-color, and --section-needs-large-text.
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
 * [data-bg-tone] selectors — callers no longer need to pair
 * bgVariant with onDark manually.
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
