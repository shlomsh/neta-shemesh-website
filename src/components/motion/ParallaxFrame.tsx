'use client';

import { CSSProperties, ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cx } from '@/lib/cx';

interface ParallaxFrameProps {
  /**
   * The image element to drift — an `<Image fill>` or a plain
   * `<img className="absolute inset-0 w-full h-full object-cover">`.
   * It fills the (oversized) drifting layer, so it should be absolutely
   * positioned / `fill`, not aspect-driven by an inner spacer.
   */
  children: ReactNode;
  /** Frame mask classes: size / aspect / rounding. `overflow-hidden` is added. */
  className?: string;
  /** Inline styles for the frame (e.g. CSS grid-area). */
  style?: CSSProperties;
  /** Vertical drift as a % of frame height in each direction. Default 8. */
  amount?: number;
}

/**
 * ParallaxFrame — contained photo parallax.
 *
 * The frame is a fixed mask (`overflow-hidden`); the photo inside is
 * slightly oversized and drifts vertically as the frame travels through
 * the viewport, so the image "breathes" within its window without ever
 * exposing an edge. Drift is Y-axis only (RTL-safe) and the photo is
 * scaled just enough to cover the drift range.
 *
 * Honours `prefers-reduced-motion`: same tree on server and client (no
 * `useReducedMotion()` branch, which would mismatch SSR styles); the
 * `[data-parallax]` rule in globals.css collapses it to a static, full-cover image.
 */
export function ParallaxFrame({
  children,
  className,
  style,
  amount = 8,
}: ParallaxFrameProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 0 when the frame's top edge enters from the bottom of the viewport,
  // 1 when its bottom edge exits past the top — a full traverse.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  // The frame must be a positioning context for the absolute inner layer.
  // Default to `relative`, but step aside if the caller positions it
  // themselves (e.g. `absolute inset-0` for a full-bleed band) — otherwise
  // Tailwind's `relative` would override their `absolute` and collapse it.
  const hasPosition = /\b(absolute|fixed|sticky|relative)\b/.test(className ?? '');

  return (
    <div ref={ref} className={cx(!hasPosition && 'relative', 'overflow-hidden', className)} style={style}>
      <motion.div
        data-parallax=""
        className="absolute inset-0"
        // Scale up so the ±amount% drift stays covered (overflow each edge).
        style={{ y, scale: 1 + (amount * 2 + 1) / 100 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
