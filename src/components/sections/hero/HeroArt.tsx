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

export function HeroArt() {
  return (
    <div
      className="
        relative
        flex items-center justify-center
        w-full
        h-[clamp(17.5rem,42vw,30rem)]
      "
    >
      {/* Asymmetric organic blob */}
      <div
        aria-hidden="true"
        className={cx(
          styles.blob,
          'absolute w-[clamp(17.5rem,46vw,32.5rem)] h-[clamp(13.75rem,38vw,26.25rem)] bg-mauve [border-radius:42%_58%_55%_45%/55%_48%_52%_45%]',
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
