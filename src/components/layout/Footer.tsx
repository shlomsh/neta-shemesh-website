import { FooterBackground } from './footer/FooterBackground';
import { FooterCTA } from './footer/FooterCTA';
import { FooterBrand } from './footer/FooterBrand';
import { FooterCopyright } from './footer/FooterCopyright';
import { FooterReveal } from './footer/FooterReveal';

/**
 * Footer — server component, App Router.
 *
 * Layout: full-bleed photo band (~720px @1280, fluid below) with a dark scrim.
 * Centered RTL column, top-to-bottom: tagline → CTA (with badge highlights,
 * hidden ≤768) → brand name → copyright pinned near bottom.
 *
 * All styling via Tailwind utility classes + CSS vars. No inline style objects
 * except the min-height clamp (dynamic value, not expressible as a static class).
 */
export default function Footer() {
  return (
    <footer
      id="contact"
      dir="rtl"
      className="relative w-full overflow-hidden flex flex-col items-center justify-between px-6 py-[clamp(48px,6vw,96px)] min-h-[100svh]"
    >
      {/* Background photo + scrim — absolutely positioned */}
      <FooterBackground />

      {/* Content column — sits above the background via z-10 */}
      <div className="relative z-10 flex flex-col items-center gap-[clamp(32px,6vw,90px)] w-full max-w-[894px] text-center">

        {/* 1. Tagline */}
        <FooterReveal delay={0} className="h-full">
          <p
            className="text-[color:var(--color-white)] font-[family-name:var(--font-canva-accent)] text-[clamp(24px,4.4vw,56px)] leading-[1.1] tracking-[-0.02em] text-center w-full h-full flex items-center justify-center"
            dir="rtl"
          >
            התגברו על אתגרים וחדשו את הקשר הרגשי והפיזי.
          </p>
        </FooterReveal>

        {/* 2. CTA link with badge highlights */}
        <FooterReveal delay={0.1}>
          <FooterCTA />
        </FooterReveal>

        {/* 3. Brand name */}
        <FooterReveal delay={0.2}>
          <FooterBrand />
        </FooterReveal>

      </div>

      {/* 4. Copyright — pinned to bottom */}
      <div className="relative z-10 mt-auto">
        <FooterReveal delay={0.3}>
          <FooterCopyright />
        </FooterReveal>
      </div>
    </footer>
  );
}
