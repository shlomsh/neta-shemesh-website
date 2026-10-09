/**
 * Services grid and step-card details not covered by the sanity suite (tone, one-screen lock,
 * the lg:flex-1 photo chain, object-cover, quote-scale intro and the subtitle lockup are asserted
 * in tests-unit/sanity/).
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Services } from '@/components/sections/services/Services';
import { StepCard } from '@/components/sections/services/StepCard';

describe('Services mobile and desktop layout', () => {
  it('the step grid is 1 column on mobile, 2 at md and lg, and 2 rows at lg', () => {
    const { container } = render(<Services />);
    const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-2');
    expect(grid, 'Services Grid should be grid-cols-1 mobile / md:grid-cols-2 tablet+').not.toBeNull();
    expect(grid!.className).toContain('lg:grid-rows-2');
  });

  it('cards are portrait (aspect-[4/5]) below lg and height-driven at lg, never landscape', () => {
    const { container } = render(<Services />);
    const card = container.querySelector('.aspect-\\[4\\/5\\]');
    expect(card, 'Cards should be aspect-[4/5] to be portrait like the template').not.toBeNull();
    expect(card!.className).toContain('lg:aspect-auto');
    expect(card!.className).toContain('lg:h-auto');
    expect(container.querySelector('.lg\\:aspect-\\[4\\/3\\]'), 'Cards should NOT be landscape on desktop').toBeNull();
  });

  it('uses a margin-top stagger on odd cards (not translate-y, which clips inside overflow-hidden)', () => {
    const { container } = render(<Services />);
    // Odd cards get lg:mt-10, even cards the matching lg:mb-10, so the 2x2 grid stays exactly its allotted height at lg.
    const all = Array.from(container.querySelectorAll('[class]'));
    const cls = (el: Element) => el.getAttribute('class') ?? '';
    expect(all.filter(el => cls(el).includes('lg:mt-10')).length, 'two odd StepCards offset down').toBe(2);
    expect(all.filter(el => cls(el).includes('lg:mb-10')).length, 'two even StepCards offset up').toBe(2);
    expect(all.some(el => cls(el).includes('lg:mt-[53px]')), 'old large stagger is gone').toBe(false);
  });
});

describe('StepCard bullets', () => {
  it('bullets use the type-small scale class', () => {
    const li = render(<StepCard imageSrc="/x.webp" numberText="1" title="t" bullets={['a']} delay={0} />).container.querySelector('li')!;
    expect(li.className).toContain('type-small');
  });
});
