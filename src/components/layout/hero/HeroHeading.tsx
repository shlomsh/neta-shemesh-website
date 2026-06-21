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
        {/* Highlight underline accent */}
        <span
          aria-hidden="true"
          className="
            absolute inset-x-0 bottom-[0.08em] -z-10
            h-[0.16em]
            bg-[var(--color-blush)]
            opacity-[0.55]
            rounded-[6px]
            rotate-[-1.2deg]
          "
        />
      </span>
    </h1>
  );
}
