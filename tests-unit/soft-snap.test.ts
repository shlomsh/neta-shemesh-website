// @vitest-environment node
/**
 * The gate's pure predicate (src/lib/soft-snap.ts): where the slide pager may run. The pager's
 * decisions are table-tested in slide-pager.test.ts; the component wiring in slide-pager-wiring.test.tsx
 * and sanity/soft-snap.test.tsx.
 *
 * There is no touch mode: SNAP_MEDIA / isSnapActive keep touch (coarse pointer) devices out entirely.
 */
import { describe, expect, it } from 'vitest';
import { MIN_WIDTH, SNAP_MEDIA, isSnapActive } from '@/lib/soft-snap';

/** Minimal evaluator for the two terms SNAP_MEDIA uses, so the tests can ask "does this device match?". */
function matchesSnapMedia(width: number, pointer: 'fine' | 'coarse'): boolean {
  const minWidth = Number(/min-width:\s*(\d+)px/.exec(SNAP_MEDIA)?.[1]);
  const wantsFine = /pointer:\s*fine/.test(SNAP_MEDIA);
  return width >= minWidth && (!wantsFine || pointer === 'fine');
}

describe('SNAP_MEDIA / isSnapActive: desktop width AND a fine pointer, and not under reduced motion', () => {
  it('SNAP_MEDIA is the documented query', () => {
    expect(MIN_WIDTH).toBe(1024);
    expect(SNAP_MEDIA).toBe('(min-width: 1024px) and (pointer: fine)');
  });

  it.each([
    [1440, 'fine', false, true],
    [MIN_WIDTH, 'fine', false, true],
    [1440, 'fine', true, false], // reduced motion
    [MIN_WIDTH - 1, 'fine', false, false], // narrow desktop window
    [768, 'fine', false, false],
    [390, 'fine', false, false],
  ] as const)('width %i, %s pointer, reduced motion %s -> active %s', (width, pointer, reduced, want) => {
    expect(isSnapActive(matchesSnapMedia(width, pointer), reduced)).toBe(want);
  });

  it('a coarse pointer is inactive at any width (phones, tablets, iPad landscape, touch-only large screens)', () => {
    for (const width of [320, 390, 768, 1023, 1024, 1180, 1366, 1440, 2560, 5120]) {
      for (const reduced of [false, true]) {
        expect(isSnapActive(matchesSnapMedia(width, 'coarse'), reduced), `width ${width}, reduced ${reduced}`).toBe(false);
      }
    }
  });
});
