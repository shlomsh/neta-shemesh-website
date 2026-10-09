/**
 * Decorative, abstract map for the map facade: invented streets, blocks, a park and a river in
 * palette tones, with a pin. Pure artwork (no Google tiles, no real geography), so it is
 * `aria-hidden`. It fills its box with `slice`, so the pin stays near the horizontal centre
 * at every aspect ratio. Server component; it ships as HTML only.
 */
export function MapIllustration() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      {/* park + river */}
      <path d="M-10 214 C70 186 120 238 196 214 S330 168 410 196 V310 H-10 Z" className="fill-mauve/25" />
      <path d="M-10 236 C70 208 120 258 196 234 S330 188 410 216" className="fill-none stroke-blush/35" strokeWidth="14" strokeLinecap="round" />
      <ellipse cx="318" cy="86" rx="46" ry="30" className="fill-blush/15" />

      {/* city blocks */}
      <g className="fill-mauve/20">
        <rect x="14" y="20" width="84" height="52" rx="6" />
        <rect x="112" y="20" width="62" height="52" rx="6" />
        <rect x="14" y="88" width="62" height="66" rx="6" />
        <rect x="224" y="20" width="70" height="38" rx="6" />
        <rect x="250" y="112" width="58" height="48" rx="6" />
        <rect x="322" y="124" width="64" height="40" rx="6" />
        <rect x="92" y="92" width="80" height="56" rx="6" />
      </g>

      {/* streets: wide arteries, then thin lanes */}
      <g className="fill-none stroke-mauve/60" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-10 168 C80 150 150 176 230 150 S350 132 410 148" strokeWidth="9" />
        <path d="M206 -10 C196 60 214 110 200 170 S186 260 196 310" strokeWidth="9" />
        <path d="M-10 84 L410 70" strokeWidth="5" />
        <path d="M100 -10 C104 60 96 120 108 310" strokeWidth="5" />
        <path d="M300 -10 C296 70 312 130 306 310" strokeWidth="5" />
      </g>
      <g className="fill-none stroke-blush/40" strokeLinecap="round">
        <path d="M-10 124 L410 112" strokeWidth="2.5" />
        <path d="M-10 36 L410 28" strokeWidth="2.5" />
        <path d="M54 -10 L58 310" strokeWidth="2.5" />
        <path d="M156 -10 L152 310" strokeWidth="2.5" />
        <path d="M252 -10 L256 310" strokeWidth="2.5" />
        <path d="M352 -10 L356 310" strokeWidth="2.5" />
        <path d="M-10 196 L410 190" strokeWidth="2.5" />
      </g>

      {/* pin: soft ground shadow, cream teardrop, plum dot */}
      <ellipse cx="200" cy="94" rx="17" ry="5" className="fill-plum/60" />
      <path
        d="M200 92 C186 74 176 62 176 48 A24 24 0 0 1 224 48 C224 62 214 74 200 92 Z"
        className="fill-cream stroke-blush"
        strokeWidth="2"
      />
      <circle cx="200" cy="48" r="9" className="fill-plum" />
    </svg>
  );
}
