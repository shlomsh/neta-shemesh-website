/**
 * HeroContent — composes the warm, framed-paper hero.
 *
 * Top bar (logo + nav) is pinned at the top. Below it, two zones sit
 * centered in a vertical stack at every width, with the illustration below the text.
 *
 * Each block is wrapped in a plain div with the pure-CSS `.hero-enter`
 * settle (staggered via `.hero-enter-N` delay modifiers, see globals.css). It is transform-only:
 * the text (logo/nav, H1, subtext, CTA) is visible in the first paint of the server HTML (NS-26).
 * Only the decorative strokes, blob and line art fade/draw in afterwards.
 * The hero is above the fold, so it must never gate on JS (no ScrollReveal here: a reveal wrapper
 * hides its content until the client observer arms it). Everything in this file stays server-side.
 */

import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { BrandLogo } from '@/components/site/BrandLogo';
import { SiteNav } from '@/components/site/SiteNav';
import { ANCHOR, ID, anchorHref } from '@/content/ids';
import { HeroHeading } from './HeroHeading';
import { HeroArt, ART_SLOT } from './HeroArt';

export function HeroContent() {
  // px stays a clamp() (NS-61): gutter-wide is 4px wider at 375, which narrows the hero text column by 8px and re-wraps
  // the subtext to three lines. Hero composition is not moved to a step.
  // Phones: bottom padding = the iOS 26 overshoot (--hero-overshoot, 0 elsewhere) + the ContactFAB's footprint
  // (1rem offset + 2.75rem pill) + 0.5rem gap, so the art ends above the pill. Desktop uses compact panel padding.
  return (
    <div
      className="
        relative z-10
        flex flex-col
        w-full
        hero-fit
        px-[clamp(1.25rem,5vw,5rem)]
        pt-region lg:pt-panel
        pb-[calc(var(--hero-overshoot)+4.25rem)] lg:pb-panel
        gap-panel
      "
    >
      {/* ── Top bar: logo + nav ── */}
      <div className="hero-enter hero-enter-0 flex flex-col items-center justify-between w-full gap-stack md:flex-row md:gap-4">
        <BrandLogo tone="plum" compact />
        <SiteNav lightSurface expandedOnMobile />
      </div>

      {/* ── Two zones: text + art (the skip link lands here, past the nav) ── */}
      <div
        id={ID.mainContent}
        className="
          flex flex-col lg:flex-row
          items-center justify-center
          gap-stack lg:gap-region
          my-auto w-full
          max-lg:my-0 max-lg:flex-1 max-lg:justify-center
        "
      >
        {/* Text block */}
        <div className="flex flex-col items-center gap-stack w-full max-w-3xl text-center lg:flex-1 lg:items-start lg:text-start">
          {/* The H1 is static (CLAUDE.md rule 9): Elamy swash tops are cut by iPhone Safari after any animated repaint. */}
          <div>
            <HeroHeading />
          </div>

          {/* Subtext: two lines of supporting copy at .type-quote (Stanga 400, 24-32px) */}
          <div className="hero-enter hero-enter-2">
            <p
              className="
        type-quote
        text-plum
        w-full max-w-prose
      "
            >
              ליווי מקצועי בתהליכי שינוי, משבר וצמיחה זוגית ומשפחתית.
              <br />
              בואו נמצא את הדרך חזרה אחד לשנייה.
            </p>
          </div>

          {/* CTA → contact section: plum button on the cream paper surface. */}
          <div className="hero-enter hero-enter-3">
            <div
              className="flex flex-col items-center gap-stack w-full lg:items-start"
            >
              <ButtonLink href={anchorHref(ANCHOR.contact)} variant="primary" size="sm">
                ליצירת קשר
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Art block */}
        <div className={ART_SLOT}>
          <HeroArt />
        </div>
      </div>
    </div>
  );
}
