import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Services from '@/components/layout/Services';

describe('Services mobile and desktop layout', () => {
  it('Services uses grid-cols-1 for mobile (single column) and grid-cols-2 for tablet/desktop', () => {
    const { container } = render(<Services />);

    // Services uses colsMobile={1} colsTablet={2} colsDesktop={2} via Grid primitive
    // At mobile: single column (grid-cols-1); at tablet/desktop: 2-column (md:grid-cols-2)
    const cardsContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    expect(cardsContainer, 'Services Grid should be grid-cols-1 mobile / md:grid-cols-2 tablet+').not.toBeNull();
  });

  it('Services cards should be portrait (aspect-[4/5]) on desktop to match template, not landscape', () => {
    const { container } = render(<Services />);

    // Find the first card wrapper
    const firstCard = container.querySelector('.aspect-\\[4\\/5\\]');
    expect(firstCard, 'Cards should be aspect-[4/5] to be portrait like the template').not.toBeNull();

    // Ensure no landscape aspect ratio is used on desktop
    const landscapeCard = container.querySelector('.lg\\:aspect-\\[4\\/3\\]');
    expect(landscapeCard, 'Cards should NOT be landscape on desktop').toBeNull();
  });

  it('Services grid uses margin-top stagger on odd cards (not translate-y which clips in overflow-hidden)', () => {
    const { container } = render(<Services />);

    // Stagger was changed from translate-y (out-of-flow, clips in overflow-hidden) to mt-[Xpx].
    // The second column (odd cards) gets a modest lg:mt-10 offset, the first column the
    // matching lg:mb-10, so the 2x2 grid stays exactly its allotted height at lg+.
    const allElements = Array.from(container.querySelectorAll('[class]'));
    const cls = (el: Element) => el.getAttribute('class') ?? '';
    expect(allElements.filter(el => cls(el).includes('lg:mt-10')).length, 'two odd StepCards offset down').toBe(2);
    expect(allElements.filter(el => cls(el).includes('lg:mb-10')).length, 'two even StepCards offset up').toBe(2);
    expect(allElements.some(el => cls(el).includes('lg:mt-[53px]')), 'old large stagger is gone').toBe(false);
  });

  it('Services section is blush (light); paragraph sits directly on it at the AA-large quote scale; no inner card', () => {
    const { container } = render(<Services />);

    const section = container.querySelector('#cQd2ufFBWvr5c6ki');
    expect(section?.getAttribute('data-bg-tone'), 'Services section is light (blush)').toBe('light');
    expect(section!.className).not.toContain('bg-[var(--color-cream)]');

    // The blush section makes an inner blush card redundant.
    expect(section!.querySelector('div[data-bg-tone]'), 'no nested tone card').toBeNull();

    const para = Array.from(section!.querySelectorAll('p')).find(p =>
      p.textContent?.includes('התהליך בקליניקה')
    );
    expect(para, 'intro paragraph').toBeDefined();
    expect(para!.className).toContain('type-quote');
    // the quote class owns the 24-32px size: no ad-hoc override
    expect(para!.className).not.toMatch(/text-\[(clamp|\d)/);
    expect(para!.className).not.toContain('type-body');
    expect(para!.className).not.toContain('bg-[var(--color-cream)]');

    const cta = section!.querySelector('a[href="#contact"]');
    expect(cta?.textContent).toContain('צרו קשר');
    expect(cta!.className).toContain('bg-[var(--color-plum)]');
  });

});
