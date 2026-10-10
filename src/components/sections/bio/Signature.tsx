import type { CSSProperties } from 'react';
import { SITE } from '@/content/site';
import { SIG_FLOURISH_DELAY, SIG_MASK_WIDTH, SIG_STROKES, SIG_TEXT, SIG_VIEWBOX } from './signature-strokes';

/**
 * Netta's handwritten signature, set at the end of the bio quote (NS-55, redrawn as a pen in NS-56).
 *
 * The name is the real Elamy text in an SVG <text>, revealed through a MASK of centerline pen strokes (see signature-strokes.ts): each stroke is its own thick mask path that draws
 * with pathLength + stroke-dashoffset, staggered in writing order (right to left, a pause between the
 * words), then the flourish draws under it, also right to left. Timing lives in per-path CSS vars
 * (--d, --delay) read by the `.sig-*` rules in globals.css. The hidden state exists only under
 * html[data-reveal-armed] and prefers-reduced-motion: no-preference, so with JS off, reduced motion or in
 * an iframe the signature is static and fully drawn. Colour is currentColor (the section tone).
 */
export function Signature() {
  return (
    <div className="mt-6 flex justify-end">
      <div className="sig-wrap relative inline-block">
        <span className="sr-only">{SITE.name}</span>
        <svg
          className="sig-mark block"
          viewBox={SIG_VIEWBOX}
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <mask id="sig-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1500" height="560">
            <g stroke="white" strokeWidth={SIG_MASK_WIDTH} strokeLinecap="round" strokeLinejoin="round">
              {SIG_STROKES.map((s) => (
                <path
                  key={s.d}
                  className="sig-pen"
                  d={s.d}
                  pathLength={1}
                  style={{ '--d': `${s.dur}s`, '--delay': `${s.delay}s` } as CSSProperties}
                />
              ))}
            </g>
            {/* Finale: fades the whole name in once the pen is done, so no mask seam can remain. Opaque (static) by default. */}
            <rect className="sig-full" x="0" y="0" width="1500" height="560" fill="white" style={{ '--delay': `${SIG_FLOURISH_DELAY}s` } as CSSProperties} />
          </mask>
          <g mask="url(#sig-mask)">
            <rect x="0" y="0" width="1500" height="560" fill="none" />
            <text
              x={SIG_TEXT.x}
              y={SIG_TEXT.y}
              direction="rtl"
              fill="currentColor"
              fontSize={SIG_TEXT.size}
              fontWeight={400}
              className="sig-text"
            >
              {SITE.name}
            </text>
          </g>
        </svg>
        <svg
          className="sig-flourish pointer-events-none absolute inset-x-0 bottom-0 h-3.5 w-full"
          viewBox="0 0 200 14"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
          focusable="false"
          style={{ '--delay': `${SIG_FLOURISH_DELAY}s` } as CSSProperties}
        >
          <path
            d="M198 8 C 160 1, 128 13, 92 6 S 34 4, 3 9"
            pathLength={1}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
