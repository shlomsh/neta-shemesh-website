import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Services from '@/components/layout/Services';

describe('Services mobile and desktop layout', () => {
  it('Services uses grid-cols-2 for mobile layout instead of grid-cols-1', () => {
    const { container } = render(<Services />);
    
    // Find the cards container
    const cardsContainer = container.querySelector('.grid.grid-cols-2');
    expect(cardsContainer).not.toBeNull();
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

  it('Services grid should use translate-y for a masonry stagger effect on alternating cards', () => {
    const { container } = render(<Services />);
    
    // The second card (index 1) should have a translate-y class for masonry stagger
    const staggeredCard = container.querySelector('.lg\\:translate-y-\\[64px\\]');
    expect(staggeredCard, 'Odd-indexed cards should be staggered down using translate-y').not.toBeNull();
  });

});
