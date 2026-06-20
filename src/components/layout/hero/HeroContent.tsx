/**
 * HeroContent — composes the "05B Dark Ground" hero.
 *
 * Top bar (logo + nav) is pinned at the top. Below it, two zones sit
 * side-by-side on desktop and stack on mobile:
 *   - Text block (right in RTL): heading → subtext → CTA
 *   - Art block (left in RTL): floating line-art illustration over a blob
 *
 * Each block is wrapped in ScrollReveal with a staggered delay. Only
 * ScrollReveal is a client component; everything else stays server-side.
 */

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { BrandLogo } from './BrandLogo';
import { HeroNav } from './HeroNav';
import { HeroHeading } from './HeroHeading';
import { HeroSubtext } from './HeroSubtext';
import { HeroCTA } from './HeroCTA';
import { HeroArt } from './HeroArt';

export function HeroContent() {
  return (
    <div
      dir="rtl"
      className="
        relative z-10
        flex flex-col
        w-full
        min-h-[100svh]
        px-[clamp(20px,5vw,80px)]
        py-[clamp(32px,4vw,56px)]
        gap-[clamp(24px,3vw,40px)]
      "
    >
      {/* ── Top bar: logo + nav ── */}
      <ScrollReveal delay={0} className="flex items-center justify-between w-full flex-wrap gap-[16px]">
        <BrandLogo />
        <HeroNav />
      </ScrollReveal>

      {/* ── Two zones: text + art ── */}
      <div
        className="
          flex flex-col lg:flex-row
          items-center
          gap-[clamp(32px,5vw,56px)]
          my-auto w-full
        "
      >
        {/* Text block */}
        <div className="flex flex-col gap-[clamp(16px,2vw,28px)] w-full lg:flex-[0_0_520px] max-w-[560px]">
          <ScrollReveal delay={0.1}>
            <HeroHeading />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <HeroSubtext />
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <HeroCTA />
          </ScrollReveal>
        </div>

        {/* Art block */}
        <ScrollReveal delay={0.2} className="w-full lg:flex-1">
          <HeroArt />
        </ScrollReveal>
      </div>
    </div>
  );
}
