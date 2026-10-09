/**
 * Where the slide pager runs. The pager itself (`components/motion/SlidePager.tsx`) and its pure
 * decisions (`lib/slide-pager.ts`) know nothing about devices; `components/motion/SoftSnap.tsx` is the
 * gate that mounts the pager only where `SNAP_MEDIA` matches and motion is not reduced.
 */

/** Viewport width (px) at which paging may start; below it the page scrolls natively. */
export const MIN_WIDTH = 1024;
/**
 * Paging runs only where this media query matches: a desktop-width viewport (>= 1024px) whose
 * primary pointer is fine (mouse, trackpad). Touch devices (`pointer: coarse`) never page, at any
 * width: the page scrolls natively there. The gate checks this before it even loads the pager, so
 * touch devices download no pager code.
 */
export const SNAP_MEDIA = `(min-width: ${MIN_WIDTH}px) and (pointer: fine)`;

/**
 * Whether paging may run: the viewport matches SNAP_MEDIA (desktop width AND a fine pointer) and
 * the user has not asked for reduced motion. A coarse pointer is inactive at every width. There is
 * no touch mode: it was enabled below 1024px in fd0ba7b/992a790, snapped BACKWARD to the hero and
 * to one-screen cards after slow swipes, made iOS in-app browsers feel stuck, and was deleted.
 */
export function isSnapActive(snapMediaMatches: boolean, reducedMotion: boolean): boolean {
  return snapMediaMatches && !reducedMotion;
}
