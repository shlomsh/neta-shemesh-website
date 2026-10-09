import { FooterBackground } from './footer/FooterBackground';
import { FooterCTA } from './footer/FooterCTA';
import { FooterBrand } from './footer/FooterBrand';
import { FooterCopyright } from './footer/FooterCopyright';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';

/**
 * Footer — server component, App Router.
 *
 * Layout: full-bleed photo card (min 100svh) with a dark scrim. Centered RTL
 * column, top-to-bottom: tagline → CTA → brand name → copyright pinned near
 * the bottom. Each block fades in via ScrollReveal with a small stagger.
 *
 * All styling via Tailwind utility classes + CSS vars.
 */
export default function Footer() {
  return (
    <footer
      dir="rtl"
      className="relative w-full overflow-hidden flex flex-col items-center justify-between px-6 py-[clamp(48px,6vw,96px)] min-h-[100svh]"
    >
      {/* Background photo + scrim — absolutely positioned */}
      <FooterBackground />

      {/* Content column — sits above the background via z-10 */}
      <div className="relative z-10 flex flex-col items-center gap-[clamp(32px,6vw,90px)] w-full max-w-[894px] text-center">

        {/* 1. Tagline */}
        <ScrollReveal className="h-full">
          <SectionTitle as="p" onDark dir="rtl" className="text-center w-full h-full flex items-center justify-center">
            התגברו על אתגרים וחדשו את הקשר הרגשי והפיזי.
          </SectionTitle>
        </ScrollReveal>

        {/* 2. CTA link */}
        <ScrollReveal delay={0.1}>
          <FooterCTA />
        </ScrollReveal>

        {/* 3. Brand name */}
        <ScrollReveal delay={0.2}>
          <FooterBrand />
        </ScrollReveal>

      </div>

      {/* 4. Copyright — pinned to bottom; extra bottom padding below md clears the ContactFAB pill (bottom-left) */}
      <div className="relative z-10 mt-auto pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-0">
        <ScrollReveal delay={0.3}>
          <FooterCopyright />
        </ScrollReveal>
      </div>
    </footer>
  );
}
