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
import styles from './HeroPaper.module.css';

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
          overflow-clip
          hero-fit
        "
      >
        <div
          className={`${styles.wash} absolute inset-0 bg-cream`}
          aria-hidden="true"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-plum/35 sm:inset-6" />
        <HeroContent />
      </section>
    </>
  );
}
