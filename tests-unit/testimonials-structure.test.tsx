import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Testimonials from '../src/components/layout/Testimonials';

describe('Testimonials Structure', () => {
  // Skipped: the "לקוחות ממליצים" section is currently hidden behind the
  // SHOW_TESTIMONIALS flag in Testimonials.tsx (awaiting real client testimonials).
  it.skip('renders clean grid layout without legacy raw DOM blobs', () => {
    const { container } = render(<Testimonials />);

    // Ignore next/image which uses absolute positioning internally
    const allElements = container.querySelectorAll('[style]');
    allElements.forEach(el => {
      const isNextImage = el.tagName === 'IMG' && el.getAttribute('style')?.includes('color: transparent');
      if (isNextImage) return;
      
      const style = el.getAttribute('style') || '';
      // Canva legacy blobs had specific px values like top: 123px; left: 456px;
      expect(style).not.toMatch(/top:\s*[1-9]\d*px/);
      expect(style).not.toMatch(/left:\s*[1-9]\d*px/);
    });

    // Verify grid layout structure
    const gridContainer = container.querySelector('#GEF7BLoFlyc3GavU');
    expect(gridContainer).toBeTruthy();
    expect(gridContainer?.className).toContain('grid');
    expect(gridContainer?.className).toContain('md:grid-cols-3');

    // Verify exactly 3 quote icons rendered inside the grid
    const quotes = gridContainer?.querySelectorAll('img[alt="ציטוט"]');
    expect(quotes?.length).toBe(3);
  });
});
