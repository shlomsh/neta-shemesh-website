import { BrandLogo } from '@/components/layout/hero/BrandLogo';
import { HeroNav } from '@/components/layout/hero/HeroNav';

/**
 * BlogHeader — same visual header as the hero, on a plum band.
 * Reuses BrandLogo and HeroNav so sizing and spacing are pixel-identical,
 * eliminating the layout shift when navigating between / and /blog.
 * Hash anchors are prefixed with '/' so they cross-navigate correctly.
 */
export function BlogHeader() {
  return (
    <header dir="rtl" className="w-full bg-[var(--color-plum)]">
      <div className="flex w-full items-center justify-between gap-[16px] px-[clamp(20px,5vw,80px)] py-[clamp(14px,2vw,22px)]">
        <BrandLogo />
        <HeroNav basePath="/" />
      </div>
    </header>
  );
}
