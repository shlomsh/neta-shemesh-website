/**
 * REGRESSION: Height/layout class assertions (class-level only — jsdom has no layout engine).
 * Verifies the new 2x2 CSS Grid architecture for Expertise and Services.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import Expertise from '@/components/layout/Expertise';
import Services from '@/components/layout/Services';
import { ExpertiseCard } from '@/components/layout/expertise/ExpertiseCard';

describe('Expertise.tsx — Grid layout classes', () => {
  it('contains the 2x2 grid container', () => {
    const { container } = render(<Expertise />);
    const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    expect(grid, 'Expertise missing grid layout').not.toBeNull();
  });

  it('contains aspect ratio classes on the card containers to prevent 0px height collapse', () => {
    const { container } = render(<Expertise />);
    const cards = container.querySelectorAll('.aspect-\\[4\\/5\\]');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].className).toContain('lg:aspect-square');
  });
});

describe('Services.tsx — Grid layout classes', () => {
  it('contains the 2x2 grid container', () => {
    const { container } = render(<Services />);
    const grid = container.querySelector('.grid.grid-cols-2');
    expect(grid, 'Services missing grid layout').not.toBeNull();
  });

  it('contains aspect ratio classes on the StepCards to prevent 0px height collapse', () => {
    const { container } = render(<Services />);
    // In Services, the StepCards render the 4/5 aspect ratio.
    const cards = container.querySelectorAll('.aspect-\\[4\\/5\\]');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].className).toContain('aspect-[4/5]');
  });
});

describe('ExpertiseCard — ScrollReveal carries w-full h-full', () => {
  it('outermost rendered div has both w-full and h-full classes', () => {
    const { container } = render(
      <ExpertiseCard
        title="טיפול זוגי"
        description="test"
        imageSrc="/images/test.jpg"
        imageAlt="test"
        delay={0}
      />
    );
    // ScrollReveal (mocked as plain div) is the outermost element
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv, 'outermost element not found').toBeTruthy();
    expect(outerDiv.className).toContain('w-full');
    expect(outerDiv.className).toContain('h-full');
  });
});
