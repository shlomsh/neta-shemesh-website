/**
 * HeroHeading — main hero title: `.type-display` (Elamy, 40-72px) at weight 700
 * (headings are Elamy Bold by owner decision; numerals/signature stay 400).
 *
 * Keeps ID.heroTitle (content/ids.ts), which the layout-fit and header-fidelity specs select on.
 * Server component.
 */
import styles from './HeroUnderline.module.css';
import { ID } from '@/content/ids';

// Hand-drawn underline wave, drawn right-to-left (Hebrew pen direction); pen starts at x=197.
const UNDERLINE_D = 'M197 8 C 162 4.5, 144 2, 108 6.5 C 72 11, 38 3.5, 3 8.5';

export function HeroHeading() {
  return (
    <h1
      id={ID.heroTitle}
      className="
        type-display
        text-cream
        font-bold
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
            text-blush
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
