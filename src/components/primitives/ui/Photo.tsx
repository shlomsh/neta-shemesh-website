import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { ParallaxFrame } from '@/components/motion/ParallaxFrame';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

/**
 * Corner radius of the frame: `card` (24px), `tile` (12px) or `none` (full-bleed bands). A rounded
 * frame also gets `safari-clip`, the WebKit fix for an `overflow-hidden` rounded parent (see `safariClip`).
 */
export type PhotoRadius = 'card' | 'tile' | 'none';

/**
 * Aspect ratio of the frame (width / height). Whole class strings in the maps: Tailwind reads them
 * verbatim. '100/62' and '100/58' are the blog covers (height = 62% / 58% of the width). Never fake a
 * ratio with a `padding-top` spacer div: use `ratio`.
 */
export type PhotoRatio = 'square' | '4/3' | '4/5' | '2/3' | '348/531' | '100/62' | '100/58';

const RADIUS_CLASS: Record<PhotoRadius, string> = {
  card: 'rounded-card',
  tile: 'rounded-tile',
  none: '',
};

// Tailwind needs verbatim class strings, so the ratio is a closed union: a template type (`aspect-[${string}]`)
// would compile and silently emit no CSS.
const RATIO_CLASS: Record<PhotoRatio, string> = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '4/5': 'aspect-[4/5]',
  '2/3': 'aspect-[2/3]',
  '348/531': 'aspect-[348/531]',
  '100/62': 'aspect-[100/62]',
  '100/58': 'aspect-[100/58]',
};

/** From lg the grid cell decides the height; the ratio would fight the flex chain (see Section `fit="lock"`). */
const FILL_CELL_AT_LG = 'lg:aspect-auto lg:h-full';
const OUTLINE = 'outline outline-[1.5px] outline-plum';

/**
 * Slow scale-up of the photo.
 *   'self'  when the photo itself is hovered (gallery tiles)
 *   'group' when the enclosing `group` (a linked card) is hovered
 */
export type PhotoZoom = 'self' | 'group';
const ZOOM_CLASS: Record<PhotoZoom, string> = {
  self: 'motion-safe:hover:scale-105 transition-transform duration-700 ease-out',
  group: 'transition-transform duration-500 motion-safe:group-hover:scale-[1.04]',
};

/**
 * How the image is delivered.
 *   engine 'img' (default): a plain `<img>`, lazy unless told otherwise.
 *   engine 'next': `next/image` with `fill`; `sizes` is required because it decides the srcset.
 * Never switch an existing call site between the two: that changes the srcset and so the pixels.
 */
type PhotoEngine =
  | { engine?: 'img'; /** Lazy by default; `eager` for an above-the-fold photo (the first blog row, an article cover). */ loading?: 'lazy' | 'eager'; sizes?: never }
  | { engine: 'next'; loading?: never; sizes: string };

/**
 * What moves the frame.
 *   none:               a plain `<div>` frame; `children` are overlays drawn over the photo.
 *   { parallax: n }:    the photo drifts n% inside the frame while it scrolls (ParallaxFrame); no overlays.
 *   { reveal: delay }:  the frame itself fades in on scroll (ScrollReveal is the frame element); no overlays.
 */
type PhotoMotion =
  | { motion?: undefined; style?: CSSProperties; children?: ReactNode }
  | { motion: { parallax: number }; style?: CSSProperties; children?: never }
  | { motion: { reveal: number }; style?: never; children?: never };

type PhotoProps = PhotoEngine &
  PhotoMotion & {
    src: string;
    /** Required: pass `""` for a decorative photo. */
    alt: string;
    radius: PhotoRadius;
    /** Aspect ratio of the frame; without it the caller sizes the frame (`h-full`, a grid cell, ...). */
    ratio?: PhotoRatio;
    /** Drop the ratio from lg and take the grid cell's height instead (`lg:aspect-auto lg:h-full`). */
    fillCellAtLg?: boolean;
    /** CSS `object-position` crop, e.g. `"48.1% 47.7%"`. Centre when omitted. */
    objectPosition?: string;
    /**
     * The WebKit rounded-clip fix (`safari-clip`), on by default for `card` and `tile`. Turn it off only
     * where an ancestor already carries it: stacking it on a second, nested frame shifts the antialiasing
     * of the rounded edge by a level in Chromium (ExpertiseCard, inside the `safari-clip` grid cell).
     */
    safariClip?: boolean;
    /** Plum 1.5px outline (the framed portraits). */
    outlined?: boolean;
    zoom?: PhotoZoom;
    /** Placement and one-off surface extras of the frame (`w-full`, `h-full`, `shadow-*`, grid placement). */
    className?: string;
  };

/**
 * A photo in a clipped frame, cover-fitted: the frame is `relative overflow-hidden` with the radius
 * and optional aspect ratio, the photo fills it (`absolute inset-0 object-cover`). One component for
 * every framed photo on the site, so the radius, the Safari clip and the cover fit are written once.
 */
export function Photo(props: PhotoProps) {
  const { src, alt, radius, ratio, fillCellAtLg, objectPosition, outlined, zoom, className, motion, safariClip = true } = props;

  const frame = cx(
    ratio && RATIO_CLASS[ratio],
    fillCellAtLg && FILL_CELL_AT_LG,
    RADIUS_CLASS[radius],
    radius !== 'none' && safariClip && 'safari-clip',
    outlined && OUTLINE,
    className,
  );
  const imageStyle: CSSProperties | undefined = objectPosition ? { objectPosition } : undefined;
  const zoomClass = zoom && ZOOM_CLASS[zoom];

  const image =
    props.engine === 'next' ? (
      <Image src={src} alt={alt} fill sizes={props.sizes} className={cx('object-cover', zoomClass)} style={imageStyle} />
    ) : (
      <img
        src={src}
        alt={alt}
        loading={props.loading ?? 'lazy'}
        className={cx('absolute inset-0 w-full h-full object-cover', zoomClass)}
        style={imageStyle}
      />
    );

  if (motion && 'parallax' in motion) {
    return (
      <ParallaxFrame className={frame} style={props.style} amount={motion.parallax}>
        {image}
      </ParallaxFrame>
    );
  }
  if (motion && 'reveal' in motion) {
    return (
      <ScrollReveal className={cx('relative overflow-hidden', frame)} delay={motion.reveal}>
        {image}
      </ScrollReveal>
    );
  }
  return (
    <div className={cx('relative overflow-hidden', frame)} style={props.style}>
      {image}
      {props.children}
    </div>
  );
}
