import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Expertise from '@/components/layout/Expertise';

describe('Expertise Grid & Card Design', () => {
  it('Expertise grid should be constrained 2x2 on desktop to prevent massive cards', () => {
    const { container } = render(<Expertise />);
    const grid = container.querySelector('.grid');
    expect(grid?.className, 'Grid must be 2 columns').toContain('md:grid-cols-2');
    expect(grid?.className, 'Grid must not be 3 columns').not.toContain('lg:grid-cols-3');
    // Ensure the grid container is tightly constrained to prevent huge cards and fit 100vh viewport
    expect(grid?.className, 'Grid must be tightly constrained to fit 100vh').toContain('max-w-[640px]');
  });

  it('Expertise cards should have a drop shadow on the ScrollReveal wrapper, not an inner vignette', () => {
    const { container } = render(<Expertise />);
    // Look for the shadow-2xl on the ScrollReveal wrapper
    const cardWrapper = container.querySelector('.shadow-2xl');
    expect(cardWrapper, 'Expertise card is missing the drop shadow on the wrapper').not.toBeNull();
  });

  it('Expertise pill (CardLabel) should only display the title, not the description (or description should be hidden/hover-only)', () => {
    const { container } = render(<Expertise />);
    // Look at the first card's label container
    const labelContainer = container.querySelector('.absolute.top-\\[50\\%\\]');
    // Ensure the description text span is either removed or has a strict hover-only/sr-only class
    const descriptionSpan = labelContainer?.querySelector('span:nth-child(2)');
    expect(descriptionSpan?.className || '', 'Pill description should be strictly hidden or removed to match template small pills').not.toContain('sm:block');
  });
});
