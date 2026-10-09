import React from 'react';
import { cx } from '@/lib/cx';

/**
 * The card surface.
 *   'cream' solid cream (#FFF5F0): paragraph-heavy content on a toned section (plum text, 5.55:1)
 *   'veil'  cream at 85% over the mauve section behind it (`--surface-veil`), 4.97:1 against plum, so
 *           lead copy may sit on it. Used on mauve sections only.
 * Both publish `data-bg-tone="cream"`, so text and `--header-color` come from the tone rules in
 * globals.css and children need no colour classes.
 */
type CardSurface = 'cream' | 'veil';

/**
 * Inner padding.
 *   'md' p-6 md:p-8
 *   'lg' p-6 md:p-8 lg:p-10 (the office card, which also frames the map)
 */
type CardPad = 'md' | 'lg';

type CardProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  surface: CardSurface;
  pad: CardPad;
  children: React.ReactNode;
};

const SURFACE_CLASS: Record<CardSurface, string> = {
  cream: '',
  // Whole class string on purpose: Tailwind only emits utilities it can read verbatim from source.
  veil: 'bg-[var(--surface-veil)]',
};

const PAD_CLASS: Record<CardPad, string> = {
  md: 'p-6 md:p-8',
  lg: 'p-6 md:p-8 lg:p-10',
};

/**
 * A rounded card sitting on a toned section. Only surface, radius and padding live here; the
 * layout of the content (flex, gap, width) is the caller's, passed through `className`.
 * `data-bg-tone` is owned by `surface` and cannot be overridden.
 */
export function Card({ surface, pad, className, children, ...rest }: CardProps) {
  return (
    <div {...rest} data-bg-tone="cream" className={cx('rounded-card', SURFACE_CLASS[surface], PAD_CLASS[pad], className)}>
      {children}
    </div>
  );
}
