/**
 * Hero — server component entry point.
 *
 * Keeps two ids that tests and layout checks select on (content/ids.ts):
 *   - ANCHOR.pageTop  (zero-height anchor above the section)
 *   - ID.hero         (the section)
 *
 * Architecture: this file is intentionally thin — it owns the section shell
 * and delegates all sub-regions to named components in ./hero/.
 */

import { ANCHOR, ID } from '@/content/ids';
import { HeroBackground } from './hero/HeroBackground';
import { HeroContent } from './hero/HeroContent';

export default function Hero() {
  return (
    <>
      {/* Anchor preserved for scroll-to-top and test selectors */}
      <div id={ANCHOR.pageTop} aria-hidden="true" className="invisible absolute" />

      <section
        id={ID.hero}
        dir="rtl"
        aria-label="כותרת ראשית"
        className="
          relative
          w-full
          overflow-hidden
          min-h-[100svh]
        "
      >
        <HeroBackground />
        <HeroContent />
      </section>
    </>
  );
}
