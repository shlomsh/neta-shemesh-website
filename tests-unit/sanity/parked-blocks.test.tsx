/**
 * SANITY: parked blocks still render (smoke). Shrunk from the legacy testimonials-structure.test.tsx (NS-20).
 *
 * The "לקוחות ממליצים" block is kept in code but not mounted (SHOW_TESTIMONIALS in app/page.tsx),
 * so the home-page suite never renders it and it could rot silently. This only proves it still
 * renders its heading, its grid and its quote icons, and carries no Canva-era absolute-pixel blobs.
 * Layout classes are deliberately not asserted.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Testimonials } from '@/components/sections/testimonials/Testimonials';
import { ID } from '@/content/ids';

describe('parked Testimonials block', () => {
  it('renders a heading, the testimonial grid with quote icons, and no absolute-pixel inline styles', () => {
    const { container } = render(<Testimonials />);
    expect(container.querySelector('h2')?.textContent?.trim(), 'section heading').toBeTruthy();

    const grid = container.querySelector(`#${ID.testimonialsGrid}`);
    expect(grid, 'testimonials grid').not.toBeNull();
    expect(grid!.querySelectorAll('img[alt="ציטוט"]').length, 'quote icons in the grid').toBeGreaterThan(0);

    for (const el of Array.from(container.querySelectorAll('[style]'))) {
      const style = el.getAttribute('style') ?? '';
      expect(style, 'Canva-era blobs positioned with top:Npx / left:Npx').not.toMatch(/(?:top|left):\s*[1-9]\d*px/);
    }
  });
});
