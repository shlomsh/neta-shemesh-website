/**
 * Soft snap: the decision logic, free of DOM, timers and React so it can be tested with plain
 * numbers. `components/motion/SoftSnapEngine.tsx` is the thin effect that feeds it (scroll position,
 * section tops) and animates to whatever it returns; `components/motion/SoftSnap.tsx` is the gate that
 * loads that engine only where `SNAP_MEDIA` matches.
 */

/** Viewport width (px) at which snapping may start; below it the page scrolls natively. */
export const MIN_WIDTH = 1024;
/**
 * Snapping runs only where this media query matches: a desktop-width viewport (>= 1024px) whose
 * primary pointer is fine (mouse, trackpad). Touch devices (`pointer: coarse`) never snap, at any
 * width: the page scrolls natively there. The component gates on this before it even loads the
 * engine, so touch devices download no snap code.
 */
export const SNAP_MEDIA = `(min-width: ${MIN_WIDTH}px) and (pointer: fine)`;
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

/**
 * Whether snapping may run: the viewport matches SNAP_MEDIA (desktop width AND a fine pointer) and
 * the user has not asked for reduced motion. A coarse pointer is inactive at every width. There is
 * no touch mode: it was enabled below 1024px in fd0ba7b/992a790, snapped BACKWARD to the hero and
 * to one-screen cards after slow swipes, made iOS in-app browsers feel stuck, and was deleted.
 */
export function isSnapActive(snapMediaMatches: boolean, reducedMotion: boolean): boolean {
  return snapMediaMatches && !reducedMotion;
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
}

/**
 * The scroll position to glide to, or null to stay put.
 *
 * Null when the viewport already shows the bottom of the page (nothing below the footer to snap
 * to), when there are no targets, when the nearest card top is already within 2px, or when it is
 * further than THRESHOLD of the viewport height away. Direction does not matter: the nearest top
 * wins, above or below (ties go to the earlier section).
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
