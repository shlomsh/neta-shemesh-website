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

// ─── v2: direction-aware, gesture-armed ───────────────────────────────────────────────────────────
// v1 (above) glides to the nearest top in EITHER direction after any scroll, so after an inertia
// overshoot it pulled the page backward (NS-36 audit: 50% of triggered glides, mean 122px). v2 only
// glides the way the reader was already going, and only after a deliberate gesture.

/**
 * The A/B modes of the `?snap=` toggle. `off` mounts no engine at all. `slides` (the JS slide
 * pager, `lib/slide-pager.ts`) and `slides-css` (native mandatory CSS snap) are the NS-48 previews.
 */
export type SnapVariant = 'off' | 'v1' | 'v2' | 'slides' | 'slides-css';
/** Every valid `?snap=` value, in menu order. */
export const SNAP_VARIANTS: readonly SnapVariant[] = ['off', 'v1', 'v2', 'slides', 'slides-css'];
/** Mode when no `?snap=` is given and nothing is stored. v1 until the owner picks a new default. */
export const DEFAULT_SNAP_MODE: SnapVariant = 'v1';
/** Query parameter that selects the mode (read once on mount). */
export const SNAP_MODE_PARAM = 'snap';
/** sessionStorage key that keeps the chosen mode across client-side navigation. */
export const SNAP_MODE_STORAGE_KEY = 'snap-mode';

/** A valid mode, or null for anything else (missing, misspelt, wrong type). */
export function parseSnapVariant(value: unknown): SnapVariant | null {
  return SNAP_VARIANTS.find((v) => v === value) ?? null;
}

/**
 * Net scroll (fraction of viewport height) in one direction since the last settle that counts as a
 * deliberate gesture. Strictly greater: a single 120px wheel notch on an 800px viewport (exactly
 * 0.15) must not arm the snap.
 */
export const V2_ARM = 0.15;
/** Fraction of viewport height: the card top AHEAD (in the gesture direction) must be this close. */
export const V2_THRESHOLD = 0.2;
/** Fraction of viewport height: a card top BEHIND the gesture direction may pull back only within this. */
export const V2_BACKWARD = 0.08;
/** Idle time (ms) after the last scroll input before v2 decides. */
export const V2_SETTLE_MS = 200;
/** Duration (ms) of the v2 glide, eased out. */
export const V2_DURATION_MS = 380;

export interface SnapInputV2 extends SnapInput {
  /**
   * Signed net scroll (px) accumulated since the last settle: positive = the reader scrolled down,
   * negative = up. The engine sums the scrollY change of every scroll event that is not its own glide.
   */
  gestureDelta: number;
}

/**
 * v2: the scroll position to glide to, or null to stay put.
 *
 * - Null while the end of the page is visible, when there are no targets, or when the gesture is not
 *   armed (|gestureDelta| must exceed V2_ARM of the viewport height).
 * - Otherwise the first card top AHEAD in the gesture direction wins if it is within V2_THRESHOLD of
 *   the viewport height (a top within 2px counts as already there and is skipped).
 * - A card top BEHIND the gesture direction is used only when it is within V2_BACKWARD of the
 *   viewport height (a tiny overshoot); when both qualify the nearer wins, ahead on a tie.
 * - Tall sections need no special case: mid-section no top is near, so the page scrolls freely; only
 *   the section's own edges (its top, and the next section's top) attract.
 */
export function pickSnapTargetV2({ scrollY, viewportHeight, documentHeight, sectionTops, gestureDelta }: SnapInputV2): number | null {
  if (scrollY + viewportHeight >= documentHeight - ALREADY_THERE_PX) return null;
  if (Math.abs(gestureDelta) <= V2_ARM * viewportHeight) return null;

  const dir = gestureDelta > 0 ? 1 : -1;
  let ahead: number | null = null;
  let aheadDist = Infinity;
  let behind: number | null = null;
  let behindDist = Infinity;
  for (const top of sectionTops) {
    const d = (top - scrollY) * dir; // > 0: further along the gesture
    if (d > ALREADY_THERE_PX) {
      if (d < aheadDist) {
        aheadDist = d;
        ahead = top;
      }
    } else if (d < -ALREADY_THERE_PX) {
      if (-d < behindDist) {
        behindDist = -d;
        behind = top;
      }
    }
  }
  const aheadOk = ahead !== null && aheadDist <= V2_THRESHOLD * viewportHeight;
  const behindOk = behind !== null && behindDist <= V2_BACKWARD * viewportHeight;
  if (aheadOk && behindOk) return behindDist < aheadDist ? behind : ahead;
  if (aheadOk) return ahead;
  if (behindOk) return behind;
  return null;
}
