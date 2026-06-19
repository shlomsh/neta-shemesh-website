/**
 * BrandLogo — "נטע שמש" logotype in the Elamy Bold display face.
 *
 * The original Canva used var(--font-canva-accent) = Elamy. With
 * font-synthesis:none active, we must
 * explicitly set font-weight:700 so the real Elamy-Bold.woff2 is loaded
 * rather than a faux-bold that renders thin.
 *
 * Preserves id="Fyf1hlFV3WFGVXJq" for test selectors.
 * Server component.
 */
export function BrandLogo() {
  return (
    <p
      id="Fyf1hlFV3WFGVXJq"
      dir="rtl"
      className="
        text-[var(--color-white)]
        font-[family-name:var(--font-elamy)]
        font-bold
        text-[clamp(28px,4vw,52px)]
        leading-[1.09]
        tracking-[-0.02em]
        whitespace-nowrap
      "
    >
      נטע שמש
    </p>
  );
}
