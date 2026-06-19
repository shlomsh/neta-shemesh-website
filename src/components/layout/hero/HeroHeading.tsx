/**
 * HeroHeading — main hero title in Elamy Bold.
 *
 * The original Canva used var(--font-canva-accent) = Stanga with no
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
        font-[family-name:var(--font-canva-accent)]
        font-bold
        text-[clamp(34px,5vw,64px)]
        leading-[1.1]
        tracking-[-0.02em]
        w-full
      "
    >
      מקום בטוח לצמוח בו ביחד.
    </h1>
  );
}
