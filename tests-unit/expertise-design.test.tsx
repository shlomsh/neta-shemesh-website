/**
 * Expertise grid and card details not covered by the sanity suite (section tone, one-screen lock,
 * the lg:flex-1 photo chain, object-cover and the subtitle lockup are asserted in tests-unit/sanity/).
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Expertise from '@/components/layout/Expertise';
import { ExpertiseCard } from '@/components/layout/expertise/ExpertiseCard';

describe('Expertise Grid & Card Design', () => {
  it('grid is 1 column on mobile, 2 at md, a 2x2 at lg (never 3 columns)', () => {
    const { container } = render(<Expertise />);
    const grid = container.querySelector('.grid');
    expect(grid?.className, 'mobile single column').toContain('grid-cols-1');
    expect(grid?.className, 'Grid must be 2 columns at md').toContain('md:grid-cols-2');
    expect(grid?.className, 'Grid is 2 rows at lg').toContain('lg:grid-rows-2');
    expect(grid?.className, 'Grid must not be 3 columns at lg').not.toContain('lg:grid-cols-3');
    // The section now clips like every Section (batch 3a measured 0 px vs the unclipped version at 1280x600..1920x1080,
    // 768x1024 and 375x812): what keeps the cards from being cut is the flex chain + floor-320 grid asserted in sanity/.
  });

  it('cards are 4/5 stacked below lg (prevents 0px collapse) and height-driven at lg', () => {
    const { container } = render(<Expertise />);
    const cards = container.querySelectorAll('.aspect-\\[4\\/5\\]');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].className).toContain('lg:aspect-auto');
  });

  it('ExpertiseCard: the outermost wrapper is w-full h-full', () => {
    const { container } = render(
      <ExpertiseCard
        title="טיפול זוגי"
        description="test"
        imageSrc="/images/test.jpg"
        imageAlt="test"
        delay={0}
      />
    );
    // ScrollReveal (mocked as a plain div) is the outermost element
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv, 'outermost element not found').toBeTruthy();
    expect(outerDiv.className).toContain('w-full');
    expect(outerDiv.className).toContain('h-full');
  });

  it('cards have a drop shadow on the ScrollReveal wrapper, not an inner vignette', () => {
    const { container } = render(<Expertise />);
    expect(container.querySelector('.shadow-2xl'), 'Expertise card is missing the drop shadow on the wrapper').not.toBeNull();
  });

  it('the pill (CardLabel) shows only the title; the description is not displayed', () => {
    const { container } = render(<Expertise />);
    const labelContainer = container.querySelector('.absolute.top-\\[50\\%\\]');
    const descriptionSpan = labelContainer?.querySelector('span:nth-child(2)');
    expect(descriptionSpan?.className || '', 'Pill description should be strictly hidden or removed to match template small pills').not.toContain('sm:block');
  });
});
