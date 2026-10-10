import type React from 'react';
import { cx } from '@/lib/cx';

/**
 * Section tone -> `data-bg-tone` (globals.css paints background, text colour and --header-color).
 *   'dark'  #7A5978 + cream text      'mid'   #C49AB8 (decorative surface; no essential text)
 *   'light' #ECC8CE + plum text       'cream' #FFF5F0 + plum text
 * Omit `tone` for photo sections (CTA band): no `data-bg-tone`, the photo carries the surface.
 */
type SectionTone = 'dark' | 'mid' | 'light' | 'cream';

/**
 * How tall the section is. Every fit is at least one screen at EVERY width (`screen-fit` =
 * `min-height: var(--card-h)`: `100svh` from lg, `100lvh` below lg, the collapsed-toolbar height, static, so no
 * strip of the next card shows under a short card and nothing resizes when the toolbar toggles). A card whose
 * content is taller grows and the page scrolls. The fit is published as `data-fit`.
 *   undefined : content height at every width (blog sections); no `data-fit`
 *   'free'    : one screen at minimum, grows with its content at every width
 *   'lock'    : below lg a screen at minimum; from lg exactly one screen (`lg:screen-lock` =
 *               `height: max(var(--card-h), var(--card-floor))`, `lg:py-12`). The content must fit inside (flex chain
 *               to a photo grid); on a viewport shorter than the 720px floor the section is 720px tall.
 *   'grow'    : below lg a screen at minimum; from lg one screen at least (`lg:screen-grow` = the same value as
 *               `min-height`, `lg:py-12`). For running text that must never be clipped.
 */

/**
 * How a `fit` section centres its content (only meaningful with `fit`).
 *   'column' (default) flex column, content centred vertically
 *   'start'            like 'column', but from lg the content starts at the top (`lg:justify-start`):
 *                      the 2x2 card grid takes the remaining height (Expertise)
 *   'middle'           flex row, a single child centred on both axes (photo bands)
 */
type SectionCenter = 'column' | 'start' | 'middle';

/** Vertical padding token: 'section' = py-section, 'tight' = py-section-tight, 'none' = caller's own. */
type SectionPad = 'section' | 'tight' | 'none';

/** `floor` exists only on a lock, `center` only on a fit: the union makes the rest a type error. */
type FitProps =
  | { fit?: undefined; floor?: never; center?: never }
  | { fit: 'free' | 'grow'; floor?: never; center?: SectionCenter }
  | {
      fit: 'lock';
      /**
       * false drops the 720px floor, so the section is exactly `lg:screen-lock-exact` (`height: var(--card-h)`,
       * 100svh) at lg (the Expertise cards). Keep the default (floor) unless a section is proven to fit 100svh.
       */
      floor?: boolean;
      center?: SectionCenter;
    };

type SectionOwnProps = {
  id?: string;
  tone?: SectionTone;
  /**
   * 'none' (default) adds no vertical padding of its own: the section is then padded by `lg:py-12`
   * (lock/grow), by the content itself (Services, which pads inside its Container), or by a one-off
   * `py-*` in `className` (the CTA band, the blog and 404 sections: they have no token for their own clamp). Never put a second `py-*` in `className` next to a `pad`
   * token: two utilities for one property are decided by CSS source order.
   */
  pad?: SectionPad;
  /**
   * Pull the section up 1px over the previous one. Hides a sub-pixel gap between two toned
   * sections at fractional device pixel ratios.
   * Remove once the seams are solved in CSS.
   */
  seam?: boolean;
  /** Renders an invisible zero-height anchor div with this id immediately before the section (nav scroll target). */
  anchor?: string;
  children: React.ReactNode;
};

/**
 * `data-fit` / `data-bg-tone` are owned by `fit` / `tone`: callers cannot set them by hand.
 * `dir` is not accepted either: `<html>` already sets the direction for the whole page.
 */
type PassThrough = Omit<React.HTMLAttributes<HTMLElement>, 'id' | 'dir' | keyof SectionOwnProps>;

type SectionProps = SectionOwnProps & FitProps & PassThrough;

/**
 * Whole class strings on purpose: Tailwind only emits utilities it can read verbatim from source.
 * `screen-fit` is the one-screen minimum at every width (a lock/grow then adds its own lg height). A grow's
 * `lg:screen-grow` is the same minimum from lg, so it needs no second min-height (two would fight by
 * source order). The unit and the 720px floor live in globals.css (`--card-h`, `--card-floor`), not here.
 * `FAB_CLEAR` is the bottom padding below lg of a `fit` section that takes its padding from a `pad` token (it replaces
 * the token's bottom half there): the fixed ContactFAB pill sits over the bottom of a card on phones and must never
 * cover content (`--fab-clearance`). `pad="none"` sections own their bottom padding (Services, the CTA band) and keep it.
 */
const FAB_CLEAR = 'max-lg:fab-clear';
const FIT_CLASS = {
  free: 'screen-fit',
  lock: 'screen-fit lg:screen-lock lg:py-12',
  lockNoFloor: 'screen-fit lg:screen-lock-exact lg:py-12',
  grow: 'screen-fit lg:screen-grow lg:py-12',
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
 * `relative w-full overflow-clip` (clips, is the positioning context for decor, and is NOT a scroll container: a
 * `view()` parallax timeline binds to the nearest scroll container, which `overflow-hidden` would make of the section).
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
  const fabClass = fit && pad !== 'none' ? FAB_CLEAR : '';
  const classes = cx('relative w-full overflow-clip', seam && '-mt-px', PAD_CLASS[pad], fabClass, fitClass, fit && CENTER_CLASS[center], className);

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
      <div id={anchor} className="invisible h-0" aria-hidden="true" />
      {section}
    </>
  );
}
