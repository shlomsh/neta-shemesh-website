import { SITE } from '@/content/site';

/**
 * Netta's handwritten signature, set at the end of the bio quote (NS-55).
 *
 * "Writes itself" in two CSS-only beats once its ScrollReveal wrapper is revealed (see `.sig-*` in
 * globals.css): a right-to-left clip-path wipe over the Elamy name, then a hand-drawn flourish that
 * pen-draws under it. The hidden state exists only under html[data-reveal-armed] and
 * prefers-reduced-motion: no-preference, so with JS off or reduced motion it is static and fully visible.
 * The clip box is the Elamy ink box (NS-45 padding on `.type-signature`), so no glyph is clipped.
 * Colour follows the section tone (`currentColor` from [data-bg-tone]).
 */
export function Signature() {
  return (
    <div className="mt-6 flex justify-end">
      <div className="relative inline-block pb-3">
        <p className="sig-name type-signature">{SITE.name}</p>
        <svg
          className="sig-flourish pointer-events-none absolute inset-x-0 bottom-0 h-[14px] w-full"
          viewBox="0 0 200 14"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
          focusable="false"
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
