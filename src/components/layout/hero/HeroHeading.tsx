/**
 * HeroHeading — main hero title in Elamy Bold.
 *
 * The original template used var(--font-display) = Stanga with no
 * explicit font-weight, causing it to fall through to the light/regular
 * face under font-synthesis:none.  Explicitly specifying font-weight:700
 * ensures Stanga-Bold.woff2 is used so the heading renders heavy.
 *
 * Preserves id="yWav85A872J3eebD" required by layout-fit and
 * computed-style-golden test suites.
 * Server component.
 */
import styles from './HeroUnderline.module.css';

// Hand-drawn underline wave, drawn right-to-left (Hebrew pen direction); pen starts at x=197.
const UNDERLINE_D = 'M197 8 C 162 4.5, 144 2, 108 6.5 C 72 11, 38 3.5, 3 8.5';

export function HeroHeading() {
  return (
    <h1
      id="yWav85A872J3eebD"
      dir="rtl"
      className="
        text-[var(--color-white)]
        font-[family-name:var(--font-display)]
        font-bold
        text-[clamp(48px,12vw,72px)]
        leading-[1.1]
        tracking-[-0.02em]
        w-full
      "
    >
      מקום בטוח לצמוח בו{' '}
      <span className="relative whitespace-nowrap">
        ביחד.
        {/* Highlight underline accent: hand-drawn pen stroke, drawn right-to-left, CSS only */}
        <span
          aria-hidden="true"
          className="
            absolute inset-x-0 bottom-[0.08em] -z-10
            h-[0.22em]
            text-[var(--color-blush)]
            opacity-[0.6]
            rotate-[-1.2deg]
          "
        >
          <svg
            viewBox="0 0 200 14"
            preserveAspectRatio="none"
            focusable="false"
            className="block h-full w-full overflow-visible"
          >
            <path
              d={UNDERLINE_D}
              pathLength={1}
              stroke="currentColor"
              strokeWidth={7}
              strokeLinecap="round"
              fill="none"
              className={styles.stroke}
            />
          </svg>
        </span>
      </span>
    </h1>
  );
}
