/**
 * HeroHeading — main hero title: `.type-display` (Elamy, 40-72px) at weight 700
 * (headings are Elamy Bold by owner decision; numerals/signature stay 400).
 *
 * Keeps ID.heroTitle (content/ids.ts), which the layout-fit and header-fidelity specs select on.
 * Server component.
 */
import { ID } from '@/content/ids';
import { SITE } from '@/content/site';
import { HERO } from '@/content/home/hero';

export function HeroHeading() {
  return (
    <h1
      id={ID.heroTitle}
      className="
        type-display
        text-plum
        font-bold
      "
    >
      <span className="whitespace-nowrap">{SITE.name}</span>
      {' '}
      <span className="block type-title mt-3">
        {HERO.profession}
      </span>
    </h1>
  );
}
