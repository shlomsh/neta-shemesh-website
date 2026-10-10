/**
 * HeroContent — composes the "05B Dark Ground" hero.
 *
 * Top bar (logo + nav) is pinned at the top. Below it, two zones sit
 * side-by-side on desktop and stack on mobile:
 *   - Text block (right in RTL): heading → subtext → CTA
 *   - Art block (left in RTL): floating line-art illustration over a blob
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
import { HeroArt } from './HeroArt';

export function HeroContent() {
  // px stays a clamp() (NS-61): gutter-wide is 4px wider at 375, which narrows the hero text column by 8px and re-wraps
  // the subtext to three lines. Hero composition is not moved to a step.
  return (
    <div
      className="
        relative z-10
        flex flex-col
        w-full
        hero-fit
        px-[clamp(1.25rem,5vw,5rem)]
        py-region
        gap-panel
      "
    >
      {/* ── Top bar: logo + nav ── */}
      <div className="hero-enter hero-enter-0 flex items-center justify-between w-full flex-wrap gap-4">
        <BrandLogo />
        <SiteNav />
      </div>

      {/* ── Two zones: text + art (the skip link lands here, past the nav) ── */}
      <div
        id={ID.mainContent}
        className="
          flex flex-col lg:flex-row
          items-center
          gap-region
          my-auto w-full
        "
      >
        {/* Text block */}
        <div className="flex flex-col gap-stack w-full lg:flex-[0_0_32.5rem] max-w-[35rem]">
          <div className="hero-enter hero-enter-1">
            <HeroHeading />
          </div>

          {/* Subtext: two lines of supporting copy at .type-quote (Stanga 400, 24-32px) */}
          <div className="hero-enter hero-enter-2">
            <p
              className="
        type-quote
        text-blush
        w-full
      "
            >
              ליווי מקצועי בתהליכי שינוי, משבר וצמיחה זוגית ומשפחתית.
              <br />
              בואו נמצא את הדרך חזרה אחד לשנייה.
            </p>
          </div>

          {/* CTA → contact section: secondary ButtonLink (cream fill + plum text, 5.55:1 on the plum hero) */}
          <div className="hero-enter hero-enter-3">
            <div
              className="flex flex-col items-start gap-stack w-full"
            >
              <ButtonLink href={anchorHref(ANCHOR.contact)} variant="secondary" size="sm">
                ייעוץ עם נטע שמש
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Art block */}
        <div className="w-full lg:flex-1">
          <HeroArt />
        </div>
      </div>
    </div>
  );
}
