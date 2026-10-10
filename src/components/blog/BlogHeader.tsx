import { BrandLogo } from '@/components/site/BrandLogo';
import { SiteNav } from '@/components/site/SiteNav';

/**
 * BlogHeader — same visual header as the hero, on a plum band.
 * Reuses BrandLogo and SiteNav so sizing and spacing are pixel-identical,
 * eliminating the layout shift when navigating between / and /blog.
 * Hash anchors are prefixed with '/' so they cross-navigate correctly.
 */
export function BlogHeader() {
  return (
    <header className="w-full bg-plum">
      <div className="flex w-full items-center justify-between gap-4 px-[clamp(1.25rem,5vw,5rem)] py-[clamp(0.875rem,2vw,1.375rem)]">
        <BrandLogo />
        <SiteNav crossRoute />
      </div>
    </header>
  );
}
