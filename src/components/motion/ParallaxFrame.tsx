import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/lib/cx';

interface ParallaxFrameProps {
  /**
   * The image element to drift — an `<Image fill>` or a plain
   * `<img className="absolute inset-0 w-full h-full object-cover">`.
   * It fills the (oversized) drifting layer, so it should be absolutely
   * positioned / `fill`, not aspect-driven by an inner spacer.
   */
  children: ReactNode;
  /** Frame mask classes: size / aspect / rounding. `overflow-clip` is added. */
  className?: string;
  /** Inline styles for the frame (e.g. CSS grid-area). */
  style?: CSSProperties;
  /** Vertical drift as a % of frame height in each direction. Default 8. */
  amount?: number;
}

/**
 * ParallaxFrame — contained photo parallax.
 *
 * The frame is a fixed mask (`overflow-clip`); the photo inside is
 * slightly oversized and drifts vertically as the frame travels through
 * the viewport, so the image "breathes" within its window without ever
 * exposing an edge. Drift is Y-axis only (RTL-safe) and the photo is
 * scaled just enough to cover the drift range.
 *
 * A server component: no JS. The drift is a CSS scroll-driven animation (the `[data-parallax]` block in
 * globals.css): the inner layer runs `translateY(-amount%) -> translateY(amount%)` on its own `view()`
 * timeline, `cover 0% -> cover 100%` (the frame's top edge entering at the bottom of the viewport to its
 * bottom edge leaving at the top). `view()` follows the NEAREST SCROLL CONTAINER, so every ancestor up to
 * <main> must clip with `overflow-clip`, never `overflow-hidden` (which makes a scroll container that never
 * scrolls and freezes the drift): this frame, `Section`, the Footer. Browsers without `animation-timeline`
 * show the static midpoint (translateY 0, same scale).
 *
 * Honours `prefers-reduced-motion` in CSS only: the animation exists only under `no-preference`, and the
 * reduce rule collapses the layer to a static, full-cover image.
 */
export function ParallaxFrame({
  children,
  className,
  style,
  amount = 8,
}: ParallaxFrameProps) {
  // The frame must be a positioning context for the absolute inner layer.
  // Default to `relative`, but step aside if the caller positions it
  // themselves (e.g. `absolute inset-0` for a full-bleed band) — otherwise
  // Tailwind's `relative` would override their `absolute` and collapse it.
  const hasPosition = /\b(absolute|fixed|sticky|relative)\b/.test(className ?? '');

  return (
    <div className={cx(!hasPosition && 'relative', 'overflow-clip', className)} style={style}>
      <div
        data-parallax=""
        className="absolute inset-0"
        // Scale up so the ±amount% drift stays covered (overflow each edge); the same factor as before.
        style={{ '--parallax-amount': `${amount}%`, '--parallax-scale': 1 + (amount * 2 + 1) / 100 } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
