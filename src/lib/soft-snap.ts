/**
 * Soft snap: the decision logic, free of DOM, timers and React so it can be tested with plain
 * numbers. `components/motion/SoftSnap.tsx` is the thin effect that feeds it (scroll position,
 * section tops) and animates to whatever it returns.
 */

/** Snapping is only active at or above this viewport width (desktop). */
export const MIN_WIDTH = 1024;
/** Fraction of innerHeight: only snap when the nearest card top is within this distance. */
export const THRESHOLD = 0.3;
/** Idle time (ms) after the last scroll event before deciding whether to snap. */
export const SETTLE_MS = 140;
/** Duration (ms) of the snap animation. */
export const DURATION_MS = 520;
/** Ignore scroll activity for this long after mount (hero entrance). */
export const STARTUP_IGNORE_MS = 1500;

/** At or within this many px of a card top counts as already there (no glide). */
const ALREADY_THERE_PX = 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Snapping runs on desktop widths only, and never under prefers-reduced-motion. */
export function isSnapActive(innerWidth: number, reducedMotion: boolean): boolean {
  return innerWidth >= MIN_WIDTH && !reducedMotion;
}

export interface SnapInput {
  /** current scroll position (window.scrollY) */
  scrollY: number;
  /** window.innerHeight */
  viewportHeight: number;
  /** document.documentElement.scrollHeight */
  documentHeight: number;
  /**
   * Absolute top (px from the document top) of every snap target. These are the top-level
   * `main > section` cards only: the footer is not a section, so it is never a target.
   */
  sectionTops: readonly number[];
}

/**
 * The scroll position to glide to, or null to stay put.
 *
 * Null when the viewport already shows the bottom of the page (the footer: nothing to snap to
 * there), when there are no targets, when the nearest card top is already within 2px, or when it
 * is further than THRESHOLD of the viewport height away. Direction does not matter: the nearest
 * top wins, above or below (ties go to the earlier section).
 */
export function pickSnapTarget({ scrollY, viewportHeight, documentHeight, sectionTops }: SnapInput): number | null {
  if (scrollY + viewportHeight >= documentHeight - ALREADY_THERE_PX) return null;

  let best: number | null = null;
  let bestDist = Infinity;
  for (const top of sectionTops) {
    const dist = Math.abs(top - scrollY);
    if (dist < bestDist) {
      bestDist = dist;
      best = top;
    }
  }
  if (best === null) return null;
  return bestDist > ALREADY_THERE_PX && bestDist <= THRESHOLD * viewportHeight ? best : null;
}
