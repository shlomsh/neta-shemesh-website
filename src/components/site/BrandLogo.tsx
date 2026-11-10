import Link from 'next/link';
import { ID } from '@/content/ids';
import { HERO } from '@/content/home/hero';

/**
 * BrandLogo — the shared "מקום בטוח לצמוח בו ביחד" wordmark. The lettering is a pre-rendered image
 * (public/images/logo-tagline-light.webp, Elamy baked in), so no font
 * is involved here.
 *
 * Keeps ID.brandLogo (content/ids.ts) for test selectors.
 * Server component.
 */
export function BrandLogo({ tone = 'light', compact = false }: { tone?: 'light' | 'plum'; compact?: boolean }) {
  return (
    <Link
      id={ID.brandLogo}
      href="/"
      prefetch={false}
      aria-label="לעמוד הבית"
      className={`flex items-center${compact ? ' self-start md:self-auto' : ''}`}
    >
      <img // eslint-disable-line @next/next/no-img-element -- above-the-fold logo with explicit size, preloaded as a static webp (LCP); kept raw on purpose
        src={`/images/logo-tagline-${tone}${compact ? '-compact' : ''}.webp?v=3`}
        alt={HERO.brandMessage}
        width={1073}
        height={320}
        className={`${compact ? 'w-39 sm:w-48 md:w-54' : 'w-60 sm:w-72 md:w-80'} h-auto max-w-full object-contain`}
        loading="eager"
        fetchPriority={compact ? 'high' : 'low'}
      />
    </Link>
  );
}
