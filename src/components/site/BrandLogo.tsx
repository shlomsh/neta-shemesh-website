import Link from 'next/link';
import { ID } from '@/content/ids';
import { SITE } from '@/content/site';

/**
 * BrandLogo — "נטע שמש" logotype. The wordmark is a pre-rendered image
 * (public/images/logo-horizontal-light.webp, Elamy Bold baked in), so no font
 * is involved here.
 *
 * Keeps ID.brandLogo (content/ids.ts) for test selectors.
 * Server component.
 */
export function BrandLogo() {
  return (
    <Link
      id={ID.brandLogo}
      href="/"
      prefetch={false}
      aria-label="לעמוד הבית"
      className="flex items-center"
    >
      <img // eslint-disable-line @next/next/no-img-element -- above-the-fold logo with explicit size, preloaded as a static webp (LCP); kept raw on purpose
        src="/images/logo-horizontal-light.webp"
        alt={`${SITE.name} — ${SITE.tagline}`}
        width={1073}
        height={320}
        className="
          h-12 sm:h-[3.625rem] md:h-[4.25rem]
          w-auto
          object-contain
        "
        loading="eager"
      />
    </Link>
  );
}
