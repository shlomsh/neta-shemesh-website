import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { ANCHOR, anchorHref } from '@/content/ids';
import { FooterBackground } from './FooterBackground';

/**
 * Footer — server component, App Router.
 *
 * Layout: full-bleed photo card filling the *visible* screen (min 100dvh, with 100svh as the
 * fallback) with a dark scrim. `svh` alone left a strip of the previous card showing on phones
 * once Safari's toolbar collapsed, because the visible height is then larger than svh.
 * Centered RTL column: the tagline → CTA → brand name group sits in the vertical middle of the
 * free space (`my-auto`), the copyright at the bottom. Each block fades in via ScrollReveal with
 * a small stagger. SoftSnap treats this footer as the last snap target.
 *
 * All styling via Tailwind utility classes + CSS vars.
 */
export function Footer() {
  return (
    <footer
      className="relative w-full overflow-clip flex flex-col items-center px-6 py-section-mid screen-visible"
    >
      {/* Background photo + scrim — absolutely positioned */}
      <FooterBackground />

      {/* Content column — sits above the background via z-10; my-auto centres it between the top padding and the copyright */}
      {/* gap stays a clamp (NS-61): one-screen phone card, 32/6vw/90 is 12px past `section-mid` at 375. */}
      <div className="relative z-10 my-auto flex flex-col items-center gap-[clamp(2rem,6vw,5.625rem)] w-full max-w-[55.875rem] text-center">

        {/* 1. Tagline */}
        <SectionTitle as="p" onDark className="text-center h-full flex items-center justify-center">
          התגברו על אתגרים וחדשו את הקשר הרגשי והפיזי.
        </SectionTitle>

        {/* 2. CTA link */}
        <ScrollReveal delay={0.1}>
          {/* A single cream ButtonLink pill (secondary variant) on the photo footer; the pill is its own fill. */}
          <div className="relative flex items-center justify-center">
            <ButtonLink href={anchorHref(ANCHOR.contact, '/')} variant="secondary" size="sm" halo className="relative z-10 min-h-12">
              מוזמנים ליצור איתי קשר
            </ButtonLink>
          </div>
        </ScrollReveal>

        {/* 3. Brand name, in the handwritten signature style (.type-signature) */}
        <ScrollReveal delay={0.2}>
          <p
            className="type-signature ink-box text-cream text-center"
          >
            נטע שמש
          </p>
        </ScrollReveal>

      </div>

      {/* 4. Copyright — last flex item, so it rests at the bottom; extra bottom padding below md clears the ContactFAB pill (bottom-left) */}
      <div className="relative z-10 pb-[calc(env(safe-area-inset-bottom)+4.5rem)] md:pb-0">
        <ScrollReveal delay={0.3}>
          <p
            className="type-small text-cream text-center"
          >
            כל הזכויות שמורות <span className="font-latin">©</span> 2026.
          </p>
        </ScrollReveal>
      </div>
    </footer>
  );
}
