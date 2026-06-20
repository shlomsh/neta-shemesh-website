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
    // The second card (index 1) gets lg:mt-[53px] via the staggerClass prop on StepCard.
    // We search for any element that carries the lg:mt-[53px] stagger.
    const allElements = container.querySelectorAll('[class]');
    const staggered = Array.from(allElements).find(el =>
      el.className.includes('lg:mt-[53px]')
    );
    expect(staggered, 'Odd-indexed StepCards should have lg:mt-[53px] margin-top stagger').not.toBeUndefined();
  });

});
