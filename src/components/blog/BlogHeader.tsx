import { BrandLogo } from '@/components/site/BrandLogo';
import { SiteNav } from '@/components/site/SiteNav';

/**
 * BlogHeader — shared paper-surface header used across the site.
 * Reuses BrandLogo and SiteNav so sizing and spacing are pixel-identical,
 * eliminating the layout shift when navigating between / and /blog.
 * Hash anchors are prefixed with '/' so they cross-navigate correctly.
 */
export function BlogHeader() {
  return (
    <header className="paper-surface w-full border-b border-plum/15">
      <div className="flex w-full items-center justify-between gap-4 px-gutter-wide py-stack">
        <BrandLogo tone="plum" />
        <SiteNav crossRoute lightSurface />
      </div>
    </header>
  );
}
