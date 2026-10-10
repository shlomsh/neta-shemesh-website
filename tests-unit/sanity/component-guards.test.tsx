/**
 * SANITY: three small component contracts, one file.
 *
 *  - Gallery (NS-47): the reveal stagger restarts on every grid row. Each tile used to carry
 *    `delay = 0.1 * (index + 1)` across the WHOLE grid, so on a 2-column phone the 5th and 6th tiles sat
 *    invisible for 0.5-0.6 s after they were already on screen. The delay is now the `--reveal-delay` custom
 *    property set by class per breakpoint (no inline style), one step per column.
 *  - LineArt (NS-54): decorative pen-draw SVGs, palette colours only.
 *  - Parked Testimonials (owner ruling): the block is kept in code but not mounted (SHOW_TESTIMONIALS in
 *    app/page.tsx), so the home-page suite never renders it and it could rot silently. It must still render.
 */
import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Gallery } from '@/components/sections/gallery/Gallery';
import { LineArt, LINE_ART_NAMES } from '@/components/site/LineArt';
import { Testimonials } from '@/components/sections/testimonials/Testimonials';
import { GALLERY_IMAGES } from '@/content/home/gallery';
import { ID } from '@/content/ids';

describe('gallery reveal stagger restarts per row', () => {
  const holder = document.createElement('div');
  holder.innerHTML = renderToStaticMarkup(<Gallery />);
  const grid = holder.querySelector('#photo-gallery .grid')!;
  const tiles = Array.from(grid.children) as HTMLElement[];

  /** The delay (seconds) a tile lands on at a breakpoint: a `md:` class beats the base class. */
  const delayAt = (tile: HTMLElement, bp: 'base' | 'md'): number => {
    const read = (prefix: string) => {
      const hit = Array.from(tile.classList).find((c) => c.startsWith(`${prefix}[--reveal-delay:`));
      return hit ? parseFloat(hit.slice(prefix.length + '[--reveal-delay:'.length)) : undefined;
    };
    return (bp === 'md' ? read('md:') ?? read('') : read('')) ?? 0;
  };

  it('every tile is a ScrollReveal with no inline delay, one tile per photo, in a 2-column (3 from md) grid', () => {
    expect(grid.classList.contains('grid-cols-2') && grid.classList.contains('md:grid-cols-3')).toBe(true);
    expect(tiles).toHaveLength(GALLERY_IMAGES.length);
    for (const [i, t] of tiles.entries()) {
      expect(t.getAttribute('data-reveal'), `tile ${i + 1}`).toBe('io');
      expect(t.getAttribute('style'), `tile ${i + 1} must not emit an inline --reveal-delay`).toBeNull();
    }
  });

  it.each([
    ['base', 2],
    ['md', 3],
  ] as const)('%s: delay is 0.1 s x (column index), restarting each row of %i', (bp, cols) => {
    expect(tiles.map((t) => delayAt(t, bp))).toEqual(tiles.map((_, i) => +((i % cols) * 0.1).toFixed(2)));
  });
});

describe('LineArt (NS-54)', () => {
  it.each(LINE_ART_NAMES)('%s is a decorative pen-draw SVG with palette-only strokes', (name) => {
    const html = renderToStaticMarkup(<LineArt name={name} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('data-reveal="io"');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    const paths = html.match(/<path /g) ?? [];
    expect(paths.length).toBeGreaterThanOrEqual(5);
    expect(html.match(/pathLength="1"/g)?.length).toBe(paths.length);
  });
});

describe('parked Testimonials block', () => {
  it('still renders a heading, the testimonial grid with quote icons, and no Canva-era absolute-pixel inline styles', () => {
    const { container } = render(<Testimonials />);
    expect(container.querySelector('h2')?.textContent?.trim(), 'section heading').toBeTruthy();
    const grid = container.querySelector(`#${ID.testimonialsGrid}`);
    expect(grid, 'testimonials grid').not.toBeNull();
    expect(grid!.querySelectorAll('img[alt="ציטוט"]').length, 'quote icons in the grid').toBeGreaterThan(0);
    for (const el of Array.from(container.querySelectorAll('[style]'))) {
      expect(el.getAttribute('style') ?? '', 'Canva-era blobs positioned with top:Npx / left:Npx').not.toMatch(/(?:top|left):\s*[1-9]\d*px/);
    }
  });
});
