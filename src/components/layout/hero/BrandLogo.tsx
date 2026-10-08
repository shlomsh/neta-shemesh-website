import Link from 'next/link';

/**
 * BrandLogo — "נטע שמש" logotype. The wordmark is a pre-rendered image
 * (public/images/logo-horizontal-light.webp, Elamy Bold baked in), so no font
 * is involved here.
 *
 * Keeps id="Fyf1hlFV3WFGVXJq" for test selectors.
 * Server component.
 */
export function BrandLogo() {
  return (
    <Link
      id="Fyf1hlFV3WFGVXJq"
      href="/"
      dir="rtl"
      aria-label="לעמוד הבית"
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
    </Link>
  );
}
