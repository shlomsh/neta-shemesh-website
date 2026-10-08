/**
 * Hero — server component entry point.
 *
 * Keeps two ids that tests and layout checks select on:
 *   - id="page-1"            (zero-height anchor above the section)
 *   - id="vcPAqaHkkrFaQQwh"  (the section; a legacy export id, to be renamed
 *                             together with the other such ids in tech-debt batch 2)
 *
 * Architecture: this file is intentionally thin — it owns the section shell
 * and delegates all sub-regions to named components in ./hero/.
 */

import { HeroBackground } from './hero/HeroBackground';
import { HeroContent } from './hero/HeroContent';

export default function Hero() {
  return (
    <>
      {/* Anchor preserved for scroll-to-top and test selectors */}
      <div id="page-1" aria-hidden="true" className="invisible absolute" />

      <section
        id="vcPAqaHkkrFaQQwh"
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
