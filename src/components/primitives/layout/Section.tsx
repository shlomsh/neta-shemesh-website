import React from 'react';
import { cx } from '@/lib/cx';

/**
 * Section tone -> `data-bg-tone` (globals.css paints background, text colour and --header-color).
 *   'dark'  #7A5978 + cream text      'mid'   #C49AB8 (decorative surface; no essential text)
 *   'light' #ECC8CE + plum text       'cream' #FFF5F0 + plum text
 * Omit `tone` for photo sections (CTA band): no `data-bg-tone`, the photo carries the surface.
 */
type SectionTone = 'dark' | 'mid' | 'light' | 'cream';

/**
 * How tall the section is from lg up. Every fit is at least one screen there (`lg:screen-fit` =
 * `min-height: var(--card-h)`, which is `100svh` at lg) and is published as `data-fit`; below lg the
 * height is the content's own unless `phone="screen"` (see SectionPhone).
 *   undefined : content height at every width (blog sections); no `data-fit`
 *   'free'    : one screen at minimum from lg, grows with its content at every width
 *   'lock'    : from lg exactly one screen (`lg:h-[max(100svh,720px)]`, `lg:py-12`).
 *               The content must fit inside (flex chain to a photo grid); on a viewport shorter
 *               than 720px the section is 720px tall.
 *   'grow'    : from lg one screen at least (`lg:min-h-[max(100svh,720px)]`, `lg:py-12`). For
 *               running text that must never be clipped.
 */

/**
 * How tall a `fit` section is BELOW lg (NS-39). From lg up nothing depends on this.
 *   'content' (default) the section sizes to its content plus its padding; no min-height. A phone card
 *                       is as tall as what it holds, so there is no empty void under short content and
 *                       no cut-off card when the content is taller than the screen.
 *   'screen'            one screen at least: `screen-fit` = `min-height: var(--card-h)`, which is `100lvh`
 *                       below lg (the collapsed-toolbar height, static, so no strip of the next card shows
 *                       and nothing resizes when the toolbar toggles). The contract of the sections that
 *                       are a "moment" on a phone: credentials and the CTA band (plus the bespoke hero and
 *                       footer). Published as `data-phone`.
 */
type SectionPhone = 'content' | 'screen';

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

/** `floor` exists only on a lock, `center` and `phone` only on a fit: the union makes the rest a type error. */
type FitProps =
  | { fit?: undefined; floor?: never; center?: never; phone?: never }
  | { fit: 'free' | 'grow'; floor?: never; center?: SectionCenter; phone?: SectionPhone }
  | {
      fit: 'lock';
      phone?: SectionPhone;
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
   * 'none' (default) adds no vertical padding of its own: the section is then padded by `lg:py-12`
   * (lock/grow), by the content itself (Services, which pads inside its Container), or by a one-off
   * `py-*` in `className` (the CTA band, the blog and 404 sections: they have no token for their own clamp). Never put a second `py-*` in `className` next to a `pad`
   * token: two utilities for one property are decided by CSS source order.
   */
  pad?: SectionPad;
  /**
   * Pull the section up 1px over the previous one. Hides a sub-pixel gap between two toned
   * sections at fractional device pixel ratios.
   * TODO(visual-roadmap #2): remove once the seams are solved in CSS.
   */
  seam?: boolean;
  /** Renders an invisible zero-height anchor div with this id immediately before the section (nav scroll target). */
  anchor?: string;
  children: React.ReactNode;
};

/**
 * `data-fit` / `data-phone` / `data-bg-tone` are owned by `fit` / `phone` / `tone`: callers cannot set them by hand.
 * `dir` is not accepted either: `<html>` already sets the direction for the whole page.
 */
type PassThrough = Omit<React.HTMLAttributes<HTMLElement>, 'id' | 'dir' | keyof SectionOwnProps>;

type SectionProps = SectionOwnProps & FitProps & PassThrough;

/**
 * Whole class strings on purpose: Tailwind only emits utilities it can read verbatim from source.
 * `screen` is the phone one-screen minimum (all breakpoints); `content` is the same fit with no
 * min-height below lg (`lg:screen-fit` keeps the lg+ minimum identical). A grow needs no `lg:screen-fit`:
 * its own `lg:min-h-[max(100svh,720px)]` is the lg minimum (two lg min-heights would fight by source order).
 */
const FIT_CLASS = {
  screen: {
    free: 'screen-fit',
    lock: 'screen-fit lg:h-[max(100svh,720px)] lg:py-12',
    lockNoFloor: 'screen-fit lg:h-[100svh] lg:py-12',
    grow: 'screen-fit lg:min-h-[max(100svh,720px)] lg:py-12',
  },
  content: {
    free: 'lg:screen-fit',
    lock: 'lg:screen-fit lg:h-[max(100svh,720px)] lg:py-12',
    lockNoFloor: 'lg:screen-fit lg:h-[100svh] lg:py-12',
    grow: 'lg:min-h-[max(100svh,720px)] lg:py-12',
  },
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
 * children need no per-component `onDark` flag. `data-fit` / `data-phone` publish the height contract for
 * tests and tooling; the classes that implement it are emitted from the same prop, so the two
 * cannot drift.
 */
export function Section({
  id,
  tone,
  fit,
  floor = true,
  phone = 'content',
  center = 'column',
  pad = 'none',
  seam = false,
  anchor,
  className,
  children,
  ...rest
}: SectionProps) {
  const fitClasses = FIT_CLASS[phone];
  const fitClass = fit ? (fit === 'lock' && !floor ? fitClasses.lockNoFloor : fitClasses[fit]) : '';
  const classes = cx('relative w-full overflow-clip', seam && '-mt-px', PAD_CLASS[pad], fitClass, fit && CENTER_CLASS[center], className);

  const section = (
    <section
      {...rest}
      id={id}
      data-bg-tone={tone}
      data-fit={fit}
      data-phone={fit ? phone : undefined}
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
