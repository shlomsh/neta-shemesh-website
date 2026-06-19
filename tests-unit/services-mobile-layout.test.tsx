import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Services from '../src/components/layout/Services';

vi.mock('../src/components/layout/services/SuccessStories', () => ({
  SuccessStories: () => <div data-testid="success-stories">Success Stories</div>,
}));
vi.mock('../src/components/ui/ScrollReveal', () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

test('Services uses flex-col for mobile layout to ensure 1-up stacking and prevent squish', () => {
  const { container } = render(<Services />);
  
  // Find the main container
  const mainFlex = container.querySelector('.max-w-\\[1440px\\]');
  expect(mainFlex).not.toBeNull();
  expect(mainFlex?.className).toContain('flex-col');
  expect(mainFlex?.className).toContain('lg:flex-row');

  // Find the cards container
  const cardsContainer = container.querySelector('.flex-1.flex.flex-col');
  expect(cardsContainer).not.toBeNull();
  
  // Find individual card wrappers
  const stickyWrappers = container.querySelectorAll('.sticky.top-0');
  expect(stickyWrappers.length).toBeGreaterThan(0);
});
