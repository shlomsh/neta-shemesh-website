/**
 * BrandLogo — "נטע שמש" logotype in the Elamy Bold display face.
 *
 * The original template used var(--font-display) = Elamy. With
 * font-synthesis:none active, we must
 * explicitly set font-weight:700 so the real Elamy-Bold.woff2 is loaded
 * rather than a faux-bold that renders thin.
 *
 * Preserves id="Fyf1hlFV3WFGVXJq" for test selectors.
 * Server component.
 */
export function BrandLogo() {
  return (
    <div
      id="Fyf1hlFV3WFGVXJq"
      dir="rtl"
      className="flex items-center"
    >
      <img
        src="/images/logo-horizontal-light.webp"
        alt="נטע שמש — טיפול זוגי ומשפחתי"
        width={1073}
        height={320}
        className="
          h-[48px] sm:h-[58px] md:h-[68px]
          w-auto
          object-contain
        "
        loading="eager"
      />
    </div>
  );
}
