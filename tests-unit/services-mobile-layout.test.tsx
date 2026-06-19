import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Services from '@/components/layout/Services';

describe('Services mobile layout', () => {
  it('Services uses grid for mobile layout', () => {
    const { container } = render(<Services />);
    
    // Find the cards container
    const cardsContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    expect(cardsContainer).not.toBeNull();
  });
});
