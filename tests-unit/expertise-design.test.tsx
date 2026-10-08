import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Expertise from '@/components/layout/Expertise';

describe('Expertise Grid & Card Design', () => {
  it('Expertise grid is a 2x2 at lg (4 landscape-ish photos) that fills the remaining 100svh height', () => {
    const { container } = render(<Expertise />);
    const grid = container.querySelector('.grid');
    expect(grid?.className, 'Grid must be 2 columns at md').toContain('md:grid-cols-2');
    expect(grid?.className, 'Grid is 2 rows at lg').toContain('lg:grid-rows-2');
    expect(grid?.className, 'Grid must not be 3 columns at lg').not.toContain('lg:grid-cols-3');
    expect(grid?.className, 'Grid takes the remaining height').toContain('lg:flex-1');
    expect(grid?.className, 'Grid keeps real photos on short viewports').toContain('lg:min-h-[320px]');
    const section = container.querySelector('section');
    expect(section?.className, 'Section is exactly one screen at lg').toContain('lg:h-[100svh]');
    expect(section?.className).toContain('min-h-[100svh]');
    expect(section?.className, 'nothing may be clipped').not.toContain('overflow-hidden');
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
