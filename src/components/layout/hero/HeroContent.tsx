/**
 * HeroContent — server component that composes the text layer of the hero.
 *
 * Stacks: BrandLogo + HeroNav (top bar) → HeroHeading → HeroSubtext → HeroCTA.
 * Each block is wrapped in ScrollReveal with a staggered delay computed here
 * in the server parent (index * 0.1s) — keeps the client leaf pattern: only
 * ScrollReveal itself is a client component.
 */

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { BrandLogo } from './BrandLogo';
import { HeroNav } from './HeroNav';
import { HeroHeading } from './HeroHeading';
import { HeroSubtext } from './HeroSubtext';
import { HeroCTA } from './HeroCTA';

export function HeroContent() {
  return (
    <div
      dir="rtl"
      className="
        relative z-10
        flex flex-col
        justify-between
        w-full
        min-h-[clamp(520px,80vh,900px)]
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

      {/* ── Centre block: heading + subtext ── */}
      <div className="flex flex-col gap-[clamp(16px,2vw,28px)] max-w-[clamp(280px,60vw,720px)]">
        <ScrollReveal delay={0.1}>
          <HeroHeading />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <HeroSubtext />
        </ScrollReveal>
      </div>

      {/* ── Bottom: CTAs ── */}
      <ScrollReveal delay={0.3}>
        <HeroCTA />
      </ScrollReveal>
    </div>
  );
}
