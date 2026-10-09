/**
 * SANITY (NS-47): the photo gallery's reveal stagger restarts on every grid row.
 *
 * History: each tile had `delay = 0.1 * (index + 1)` across the WHOLE grid, so on a 2-column phone the
 * fifth and sixth tiles sat invisible for 0.5-0.6 s after they were already on screen. The delay is now
 * the `--reveal-delay` custom property set by class per breakpoint (no inline style), one step per
 * column: 0, 0.1 | 0, 0.1 | ... below md (2 columns) and 0, 0.1, 0.2 | ... from md (3 columns).
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Gallery } from '@/components/sections/gallery/Gallery';
import { GALLERY_IMAGES } from '@/content/home/gallery';

const holder = document.createElement('div');
holder.innerHTML = renderToStaticMarkup(<Gallery />);
const grid = holder.querySelector('#photo-gallery .grid')!;
const tiles = Array.from(grid.children) as HTMLElement[];

/** The delay (seconds) the cascade lands on for a tile at a breakpoint: the last matching class wins md over base. */
function delayAt(tile: HTMLElement, bp: 'base' | 'md'): number {
  const read = (prefix: string) => {
    const hit = Array.from(tile.classList).find((c) => c.startsWith(`${prefix}[--reveal-delay:`));
    return hit ? parseFloat(hit.slice(prefix.length + '[--reveal-delay:'.length)) : undefined;
  };
  const base = read('');
  const md = read('md:');
  return (bp === 'md' ? md ?? base : base) ?? 0;
}

describe('gallery reveal stagger restarts per row', () => {
  it('has the grid this test assumes: 2 columns below md, 3 from md, one tile per photo', () => {
    expect(grid.classList.contains('grid-cols-2')).toBe(true);
    expect(grid.classList.contains('md:grid-cols-3')).toBe(true);
    expect(tiles).toHaveLength(GALLERY_IMAGES.length);
  });

  it('every tile is a ScrollReveal with no inline delay (the class sets --reveal-delay instead)', () => {
    for (const [i, t] of tiles.entries()) {
      expect(t.getAttribute('data-reveal'), `tile ${i + 1}`).toBe('io');
      expect(t.getAttribute('style'), `tile ${i + 1} must not emit an inline --reveal-delay`).toBeNull();
    }
  });

  it.each([
    ['base', 2],
    ['md', 3],
  ] as const)('%s: delay is 0.1 s x (column index), restarting each row of %i', (bp, cols) => {
    const got = tiles.map((t) => delayAt(t, bp));
    const want = tiles.map((_, i) => +((i % cols) * 0.1).toFixed(2));
    expect(got).toEqual(want);
  });

  it('no tile waits longer than two steps after it is on screen', () => {
    for (const bp of ['base', 'md'] as const) {
      expect(Math.max(...tiles.map((t) => delayAt(t, bp))), bp).toBeLessThanOrEqual(0.2);
    }
  });
});
