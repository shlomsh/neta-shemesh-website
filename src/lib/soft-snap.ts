/**
 * Soft snap: the decision logic, free of DOM, timers and React so it can be tested with plain
 * numbers. `components/motion/SoftSnap.tsx` is the thin effect that feeds it (scroll position,
 * section tops) and animates to whatever it returns.
 */

/**
 * Viewport width at which the desktop rules start. At or above it the nearest card top wins in
 * either direction; below it (phones, tablets) the gentle touch rules apply (see `pickSnapTarget`).
 */
export const MIN_WIDTH = 1024;
/** Fraction of innerHeight: only snap when the nearest card top is within this distance. */
export const THRESHOLD = 0.3;
/** Idle time (ms) after the last scroll event before deciding whether to snap. */
export const SETTLE_MS = 140;
/** Touch devices: idle time (ms) after the last scroll event / touchend. Longer than SETTLE_MS so momentum has surely ended. */
export const TOUCH_SETTLE_MS = 200;
/** Duration (ms) of the snap animation. */
export const DURATION_MS = 520;
/** Ignore scroll activity for this long after mount (hero entrance). */
export const STARTUP_IGNORE_MS = 1500;

/** At or within this many px of a card top counts as already there (no glide). */
const ALREADY_THERE_PX = 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Snapping runs at every width, and never under prefers-reduced-motion. */
export function isSnapActive(reducedMotion: boolean): boolean {
  return !reducedMotion;
}

export type SnapMode = 'desktop' | 'gentle';

/** Desktop widths use the plain nearest-edge rule; narrower (touch) viewports use the gentle one. */
export function snapMode(innerWidth: number): SnapMode {
  return innerWidth >= MIN_WIDTH ? 'desktop' : 'gentle';
}

export interface SnapInput {
  /** current scroll position (window.scrollY) */
  scrollY: number;
  /** window.innerHeight */
  viewportHeight: number;
  /** document.documentElement.scrollHeight */
  documentHeight: number;
  /**
   * Absolute top (px from the document top) of every snap target: the top-level `main > section`
   * cards and the photo footer (`main > footer`), in page order.
   */
  sectionTops: readonly number[];
  /**
   * Height of each target, parallel to `sectionTops`. Only the gentle mode reads it (to tell a
   * tall section from a one-screen one); when it is missing every target counts as one screen.
   */
  sectionHeights?: readonly number[];
  /** 'desktop' (default) or 'gentle' (touch, see `snapMode`). */
  mode?: SnapMode;
  /** A finger is on the screen right now: never snap under it. */
  touching?: boolean;
}

/**
 * The scroll position to glide to, or null to stay put.
 *
 * Null when a finger is down, when the viewport already shows the bottom of the page (nothing
 * below the footer to snap to), when there are no targets, when the nearest card top is already
 * within 2px, or when it is further than THRESHOLD of the viewport height away. Direction does
 * not matter: the nearest top wins, above or below (ties go to the earlier section).
 *
 * Gentle mode (touch widths) adds one rule: many phone sections are taller than the screen, and
 * someone reading one must not be pulled back up to its top. So a target that is already above
 * the viewport top is dropped when its section is taller than the viewport; snapping forward to
 * the next card top (within the threshold) and to one-screen sections works as on desktop.
 */
export function pickSnapTarget({
  scrollY,
  viewportHeight,
  documentHeight,
  sectionTops,
  sectionHeights,
  mode = 'desktop',
  touching = false,
}: SnapInput): number | null {
  if (touching) return null;
  if (scrollY + viewportHeight >= documentHeight - ALREADY_THERE_PX) return null;

  let best: number | null = null;
  let bestDist = Infinity;
  for (let i = 0; i < sectionTops.length; i++) {
    const top = sectionTops[i];
    if (mode === 'gentle' && top < scrollY - ALREADY_THERE_PX) {
      const height = sectionHeights?.[i] ?? 0;
      if (height > viewportHeight + ALREADY_THERE_PX) continue; // tall section already entered: no snapping back
    }
    const dist = Math.abs(top - scrollY);
    if (dist < bestDist) {
      bestDist = dist;
      best = top;
    }
  }
  if (best === null) return null;
  return bestDist > ALREADY_THERE_PX && bestDist <= THRESHOLD * viewportHeight ? best : null;
}
