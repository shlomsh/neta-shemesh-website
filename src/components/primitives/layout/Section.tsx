import React from 'react';
import { ScrollAnchor } from './ScrollAnchor';
import { cx } from '@/lib/cx';

/**
 * Section tone -> `data-bg-tone` (globals.css paints background, text colour and --header-color).
 *   'dark'  #7A5978 + cream text      'mid'   #C49AB8 (decorative surface; no essential text)
 *   'light' #ECC8CE + plum text       'cream' #FFF5F0 + plum text
 * Omit `tone` for photo sections (CTA band): no `data-bg-tone`, the photo carries the surface.
 */
export type SectionTone = 'dark' | 'mid' | 'light' | 'cream';

/**
 * How tall the section is. Every fit except `undefined` is at least one screen at ALL breakpoints
 * (`min-h-[100svh]`, content centred in a flex column) and is published as `data-fit`.
 *
 * Below lg the minimum is `100lvh` (`max-lg:min-h-lvh`, with `100svh` kept as the fallback for
 * browsers without lvh). On a phone `svh` is the viewport with the browser toolbar EXPANDED, so
 * once the toolbar collapses on scroll the visible height is taller and a one-screen card left a
 * strip of the next card showing. `lvh` is the collapsed-toolbar height, and unlike `dvh` it is
 * static: nothing resizes (and no content above the reader shifts) when the toolbar toggles.
 * From lg up nothing changes: the `max-lg:` rule does not apply and the classes are as before.
 *   undefined : content height (blog sections); no `data-fit`
 *   'free'    : one screen at minimum, grows with its content at every width
 *   'lock'    : mobile = 'free'; from lg exactly one screen (`lg:h-[max(100svh,720px)]`, `lg:py-12`).
 *               The content must fit inside (flex chain to a photo grid); on a viewport shorter
 *               than 720px the section is 720px tall.
 *   'grow'    : mobile = 'free'; from lg one screen at least (`lg:min-h-[max(100svh,720px)]`,
 *               `lg:py-12`). For running text that must never be clipped.
 */
export type SectionFit = 'free' | 'lock' | 'grow';

/**
 * How a `fit` section centres its content (only meaningful with `fit`).
 *   'column' (default) flex column, content centred vertically
 *   'start'            like 'column', but from lg the content starts at the top (`lg:justify-start`):
 *                      the 2x2 card grid takes the remaining height (Expertise)
 *   'middle'           flex row, a single child centred on both axes (photo bands)
 */
export type SectionCenter = 'column' | 'start' | 'middle';

/** Vertical padding token: 'section' = py-section, 'tight' = py-section-tight, 'none' = caller's own. */
export type SectionPad = 'section' | 'tight' | 'none';

/** `floor` exists only on a lock, `center` only on a fit: the union makes the rest a type error. */
type FitProps =
  | { fit?: undefined; floor?: never; center?: never }
  | { fit: 'free' | 'grow'; floor?: never; center?: SectionCenter }
  | {
      fit: 'lock';
      /**
       * false drops the 720px floor, so the section is exactly `lg:h-[100svh]` at lg
       * (the Expertise cards). Keep the default (floor) unless a section is proven to fit 100svh.
       */
      floor?: boolean;
      center?: SectionCenter;
    };

type SectionOwnProps = {
  id?: string;
  tone?: SectionTone;
  /**
   * 'none' (default) leaves the vertical padding to the caller. One-off paddings go in `className`
   * (pad="none" + className padding is the sanctioned interim form); never put a second `py-*` in
   * `className` next to a `pad` token.
   */
  pad?: SectionPad;
  /**
   * Pull the section up 1px over the previous one. Hides a sub-pixel gap between two toned
   * sections at fractional device pixel ratios.
   * TODO(visual-roadmap #2): remove once the seams are solved in CSS.
   */
  seam?: boolean;
  /** Renders a zero-height `ScrollAnchor` with this id immediately before the section. */
  anchor?: string;
  children: React.ReactNode;
};

/**
 * `data-fit` / `data-bg-tone` are owned by `fit` / `tone`: callers cannot set them by hand.
 * `dir` is not accepted either: `<html>` already sets the direction for the whole page.
 */
type PassThrough = Omit<React.HTMLAttributes<HTMLElement>, 'id' | 'dir' | keyof SectionOwnProps>;

export type SectionProps = SectionOwnProps & FitProps & PassThrough;

/** Whole class strings on purpose: Tailwind only emits utilities it can read verbatim from source. */
const FIT_CLASS = {
  free: 'min-h-[100svh] max-lg:min-h-lvh',
  lock: 'min-h-[100svh] max-lg:min-h-lvh lg:h-[max(100svh,720px)] lg:py-12',
  lockNoFloor: 'min-h-[100svh] max-lg:min-h-lvh lg:h-[100svh] lg:py-12',
  grow: 'min-h-[100svh] max-lg:min-h-lvh lg:min-h-[max(100svh,720px)] lg:py-12',
} as const;

const CENTER_CLASS: Record<SectionCenter, string> = {
  column: 'flex flex-col justify-center',
  start: 'flex flex-col justify-center lg:justify-start',
  middle: 'flex items-center justify-center',
};

const PAD_CLASS: Record<SectionPad, string> = {
  section: 'py-section',
  tight: 'py-section-tight',
  none: '',
};

/**
 * The `<section>` shell: tone, height contract (`fit`), vertical padding. Always
 * `relative w-full overflow-hidden` (clips, and is the positioning context for decor).
 *
 * Background and text colour come entirely from the `[data-bg-tone]` rules in globals.css, so
 * children need no per-component `onDark` flag. `data-fit` publishes the height contract for
 * tests and tooling; the classes that implement it are emitted from the same prop, so the two
 * cannot drift.
 */
export function Section({
  id,
  tone,
  fit,
  floor = true,
  center = 'column',
  pad = 'none',
  seam = false,
  anchor,
  className,
  children,
  ...rest
}: SectionProps) {
  const fitClass = fit ? (fit === 'lock' && !floor ? FIT_CLASS.lockNoFloor : FIT_CLASS[fit]) : '';
  const classes = cx('relative w-full overflow-hidden', seam && '-mt-px', PAD_CLASS[pad], fitClass, fit && CENTER_CLASS[center], className);

  const section = (
    <section
      {...rest}
      id={id}
      data-bg-tone={tone}
      data-fit={fit}
      className={classes}
    >
      {children}
    </section>
  );

  if (!anchor) return section;
  return (
    <>
      <ScrollAnchor id={anchor} />
      {section}
    </>
  );
}
