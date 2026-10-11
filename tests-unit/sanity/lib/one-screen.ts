/**
 * Predicates for the one-screen card contract (data-fit plus the classes implementing it) and the desktop flex chain.
 * CLAUDE.md "Layout": every solid card is >= one screen at every width (`screen-fit`, `--card-h`). If the
 * implementation moves (an @utility, a new class), change ONLY this file.
 */
import { classTokens, hasClass } from './dom';

export const isFlexContainer = (el: Element | null | undefined) => hasClass(el, 'flex') || hasClass(el, 'lg:flex');
export const isFlexColumn = (el: Element | null | undefined) => isFlexContainer(el) && (hasClass(el, 'flex-col') || hasClass(el, 'lg:flex-col'));
/** a desktop flex item that takes the remaining height */
export const isGrowItem = (el: Element | null | undefined) => hasClass(el, 'lg:flex-1');
/** how a flex item is allowed to shrink/floor at desktop */
export type MinHeightKind = 'zero' | 'floor-320';
export function minHeightKind(el: Element | null | undefined): MinHeightKind | null {
  if (hasClass(el, 'lg:min-h-0')) return 'zero';
  if (hasClass(el, 'lg:min-h-80')) return 'floor-320'; // min-h-80 = 20rem = 320px at the default root
  return null;
}
/** fills the height of its grid cell / parent */
const hasFullHeight = (el: Element | null | undefined) => hasClass(el, 'h-full') || hasClass(el, 'lg:h-full');
/** a frame whose height comes from the grid, not from an aspect ratio, at desktop */
export const isHeightDrivenFrame = (el: Element | null | undefined) => hasFullHeight(el) || hasClass(el, 'lg:aspect-auto');
/** an aspect-ratio utility that is still on at desktop (it would fight the flex height) */
export function keepsAspectAtDesktop(el: Element | null | undefined): boolean {
  const t = classTokens(el);
  return t.some((x) => x.startsWith('aspect-[') || x === 'aspect-square') && !t.includes('lg:aspect-auto');
}
export const coversImage = (img: Element | null | undefined) => hasClass(img, 'object-cover');
/** the map wrapper: fills the details column height at lg with a 360px floor (22.5rem at the default root) */
export const isStretchedMapFrame = (el: Element | null | undefined) => hasClass(el, 'lg:h-full') && hasClass(el, 'lg:min-h-[22.5rem]');
/** <main> overflow behaviour: clip keeps CSS snap working, hidden breaks it */
export function overflowOf(el: Element | null | undefined): 'clip' | 'hidden' | null {
  if (hasClass(el, 'overflow-hidden')) return 'hidden';
  if (hasClass(el, 'overflow-clip')) return 'clip';
  return null;
}

// ─── One-screen contract (desktop and phone) ─────────────────────────────────
//
// Section publishes its height contract as `data-fit="lock|grow|free"` and implements it with classes:
//   every width     : screen-fit (min-height: var(--card-h); --card-h = 100svh, 100lvh below lg)   (all three fits; NS-61)
//   lock-720        : lg:screen-lock       (height: max(var(--card-h), var(--card-floor)); exactly a screen, floor 720, content must fit)
//   lock-100        : lg:screen-lock-exact (height: var(--card-h); Section floor={false}; Expertise only)
//   grow-720        : lg:screen-grow       (min-height: max(var(--card-h), var(--card-floor)); a screen at least; grows on short viewports)
//   free            : min-h only, no desktop lock/grow    (content-driven past one screen)
// plus lg:py-12 for the desktop vertical rhythm of lock/grow.
//
// `data-fit` alone never counts: every predicate below also reads the classes that implement it, and
// `oneScreenMode` reports 'inconsistent' when the two disagree (a data-fit that lies, or classes that
// lost their data-fit). If the implementation moves (an @utility, a new class), change ONLY this block.

export type Fit = 'lock' | 'grow' | 'free';
export type OneScreenMode = 'lock-720' | 'lock-100' | 'grow-720' | 'free' | 'inconsistent';

/** The published height contract (`data-fit`), or null when absent / not one of lock|grow|free. */
export function fitOf(el: Element | null | undefined): Fit | null {
  const v = el?.getAttribute('data-fit');
  return v === 'lock' || v === 'grow' || v === 'free' ? v : null;
}

/**
 * True when the element is at least one screen tall at EVERY breakpoint: a Section fit (`screen-fit`), the
 * footer (`screen-visible`, which is `--card-h` upgraded to dvh) or the hero (`hero-fit` = `min-height: var(--hero-h)`).
 */
export function hasMinScreen(el: Element): boolean {
  return hasClass(el, 'screen-fit') || hasClass(el, 'screen-visible') || hasClass(el, 'hero-fit');
}

/**
 * True when the fit section is at least one screen tall FROM LG: `screen-fit` (free, lock, grow all carry it)
 * or the grow's own `lg:screen-grow`.
 */
export function hasLgMinScreen(el: Element): boolean {
  return hasClass(el, 'screen-fit') || hasClass(el, 'lg:screen-fit') || hasClass(el, 'lg:screen-grow');
}

/**
 * A fit section's one-screen minimum BELOW lg is the unprefixed `screen-fit` (`min-height: var(--card-h)`); the
 * token is `100svh`, and the LARGE viewport (`100lvh`, static) below lg so a collapsed phone toolbar leaves no
 * strip of the next card under a short card (the unit decision is asserted on globals.css in one-screen.test.tsx).
 * A hand-written `min-h-lvh` would change desktop or bypass the token, and an unprefixed or `max-lg:` / `sm:` / `md:`
 * height utility (`min-h-0`, `h-auto`, ...) would cancel the minimum on the phone range, so none may sit next to it.
 */
export function hasMobileFill(el: Element): boolean {
  return (
    hasClass(el, 'screen-fit') &&
    !hasClass(el, 'min-h-lvh') &&
    !hasClass(el, 'lg:min-h-lvh') &&
    !hasClass(el, 'max-lg:min-h-lvh') &&
    !classTokens(el).some((t) => /^((max-[a-z0-9]+|sm|md):)?-?(min-h|max-h|h)-/.test(t))
  );
}

/** What the CLASSES alone implement at lg (ignores data-fit). */
function classMode(el: Element): Exclude<OneScreenMode, 'inconsistent'> {
  if (hasClass(el, 'lg:screen-lock')) return 'lock-720';
  if (hasClass(el, 'lg:screen-lock-exact')) return 'lock-100';
  if (hasClass(el, 'lg:screen-grow')) return 'grow-720';
  return 'free';
}

/** data-fit and the implementing classes must tell the same story; otherwise 'inconsistent'. */
export function oneScreenMode(el: Element): OneScreenMode {
  const fit = fitOf(el);
  const byClass = classMode(el);
  const agrees =
    (fit === 'lock' && (byClass === 'lock-720' || byClass === 'lock-100')) ||
    (fit === 'grow' && byClass === 'grow-720') ||
    (fit === 'free' && byClass === 'free');
  return agrees ? byClass : 'inconsistent';
}

/** the desktop vertical rhythm of a one-screen card */
export const hasDesktopRhythm = (el: Element) => hasClass(el, 'lg:py-12');
