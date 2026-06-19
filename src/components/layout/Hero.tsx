/**
 * Hero — server component entry point.
 *
 * Preserves:
 *   - id="page-1"  (anchor / test selector)
 *   - id="vcPAqaHkkrFaQQwh"  (section id / test selector)
 *
 * Architecture: this file is intentionally thin — it owns the section shell
 * and delegates all sub-regions to named components in ./hero/.
 * No Canva primitives (SectionBand, AnimatedBlock, Badge, etc.),
 * no inline style={{ }}, no cryptic IDs, no rem-scale Tailwind utilities.
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
