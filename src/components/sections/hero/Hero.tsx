/**
 * Hero — server component entry point.
 *
 * Keeps two ids that tests and layout checks select on (content/ids.ts):
 *   - ANCHOR.pageTop  (zero-height anchor above the section)
 *   - ID.hero         (the section)
 *
 * Architecture: this file is intentionally thin — it owns the section shell
 * and the background, and delegates the content to HeroContent.
 */

import { ANCHOR, ID } from '@/content/ids';
import { HeroContent } from './HeroContent';

export function Hero() {
  return (
    <>
      {/* Anchor preserved for scroll-to-top and test selectors */}
      <div id={ANCHOR.pageTop} aria-hidden="true" className="invisible absolute" />

      <section
        id={ID.hero}
        aria-labelledby={ID.heroTitle}
        className="
          relative
          w-full
          overflow-hidden
          min-h-[100svh]
        "
      >
        {/* "05B Dark Ground": a solid deep-plum field (--color-plum / #7A5978); all hero text and
            the line-art illustration sit on top of it in lighter palette tones. */}
        <div
          className="grain-surface absolute inset-0 bg-plum"
          aria-hidden="true"
        />
        <HeroContent />
      </section>
    </>
  );
}
