/**
 * HeroArt — the line-art couple illustration floating over a soft,
 * asymmetric organic blob. Part of the "05B Dark Ground" hero.
 *
 * The blob is a low-opacity mid-tone ellipse with an organic
 * border-radius; the cream illustration sits on top with a gentle
 * vertical floating animation (see `floaty` in globals.css, which is
 * disabled under prefers-reduced-motion).
 *
 * Hero motion sequence (all CSS, no JS):
 *   h1 settle       0.08 - 0.78 s (transform only, text always visible)
 *   word stroke     1.05 - 1.85 s
 *   blob bloom      1.50 - 2.60 s  (HeroBlob.module.css)
 *   couple pen      2.00 - 4.20 s
 *   hearts          4.20 s
 *
 * Server component; animation is pure CSS.
 */
import { CoupleLineArt } from './CoupleLineArt';
import styles from './HeroBlob.module.css';
import { cx } from '@/lib/cx';

/**
 * Phones: the art slot takes the room the rest of the hero leaves (it grows into it, capped, and is the one thing that
 * shrinks), so a short screen (375x667) still fits the hero in one screen with the art above the contact pill (NS-61),
 * and so a subtext that wraps to a third line (it does at 360px on every browser, and at 375px on engines that lay
 * Stanga out a pixel wider, e.g. Linux Chromium) costs the art 36px instead of pushing the hero past the screen.
 * The cap is what the hero leaves for the art when the subtext is two lines: 28rem = everything else in the hero column
 * at 375px (top bar, text block, gaps, paddings, the pill's footprint) plus 1rem of slack; --hero-h minus
 * --hero-overshoot is the screen the content lays out in (100lvh on every browser, the overshoot cancels on iOS 26).
 * The cap only bites below about 700px of screen height (375x812 and taller keep the full 17.5rem), never under 12rem,
 * and never from lg up. The slot is a row flex box so the art box stretches to its height; from lg up the art keeps its
 * fixed clamp() height and the slot is the plain `lg:flex-1` column of the hero row.
 */
export const ART_SLOT =
  'w-full lg:flex-1 max-lg:flex max-lg:grow max-lg:basis-0 max-lg:min-h-48 max-lg:max-h-[min(clamp(17.5rem,42vw,30rem),max(12rem,calc(var(--hero-h)_-_var(--hero-overshoot)_-_28rem)))]';

export function HeroArt() {
  return (
    <div
      data-testid="hero-art"
      className={cx(
        'relative flex items-center justify-center w-full lg:h-[clamp(17.5rem,42vw,30rem)]',
      )}
    >
      {/* Asymmetric organic blob */}
      <div
        aria-hidden="true"
        className={cx(
          styles.blob,
          'absolute w-[clamp(17.5rem,46vw,32.5rem)] h-[clamp(13.75rem,38vw,26.25rem)] max-lg:max-h-full bg-mauve [border-radius:42%_58%_55%_45%/55%_48%_52%_45%]',
        )}
      />

      {/* Line-art couple illustration */}
      <CoupleLineArt
        className="
          relative
          w-[clamp(15rem,42vw,30rem)]
          h-auto
          hero-floaty
          text-cream
        "
      />
    </div>
  );
}
