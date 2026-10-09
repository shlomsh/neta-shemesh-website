// @vitest-environment node
/**
 * Behaviour of the soft-snap decision (src/lib/soft-snap.ts), table-driven with plain numbers.
 * The effect around it (listeners, timers, the glide) is covered by sanity/soft-snap.test.tsx
 * (jsdom, fake timers) and soft-snap-wiring.test.tsx.
 *
 * Fixture: 900px viewport, 11 stacked 900px cards (tops 0, 900, ... 9000), a 9900px document
 * whose last 900px is the footer. The footer is not a snap target, so it is not in `sectionTops`.
 * THRESHOLD is 0.3, so 270px at this viewport.
 */
import { describe, expect, it } from 'vitest';
import {
  DURATION_MS,
  MIN_WIDTH,
  THRESHOLD,
  easeOutCubic,
  isSnapActive,
  pickSnapTarget,
  type SnapInput,
} from '@/lib/soft-snap';

const VH = 900;
const TOPS = Array.from({ length: 11 }, (_, i) => i * 900); // 0 .. 9000, the last card ends at 9900
const DOC = 9900 + 900; // + the footer
const at = (scrollY: number, over: Partial<SnapInput> = {}): number | null =>
  pickSnapTarget({ scrollY, viewportHeight: VH, documentHeight: DOC, sectionTops: TOPS, ...over });

describe('pickSnapTarget: near a card edge it returns that edge', () => {
  it.each([
    ['just past a top', 1000, 900],
    ['just before a top', 800, 900],
    ['a few px past a top', 905, 900],
    ['a few px before a top', 4490, 4500],
    ['picks the nearer of two tops (below)', 1790, 1800],
    ['picks the nearer of two tops (above)', 1820, 1800],
    ['the second-to-last card top', 8800, 9000],
  ])('%s (scrollY %i) -> %i', (_name, y, want) => {
    expect(at(y)).toBe(want);
  });

  it('works in both directions: the nearest top wins above or below', () => {
    expect(at(900 + 100)).toBe(900);
    expect(at(900 - 100)).toBe(900);
  });
});

describe('pickSnapTarget: far from every edge it returns null', () => {
  it.each([
    ['middle of a card', 1350],
    ['middle of a card (other)', 5850],
    ['300px below a top', 1200],
    ['300px above a top', 600],
  ])('%s (scrollY %i) -> null', (_name, y) => {
    expect(at(y)).toBeNull();
  });
});

describe('pickSnapTarget: the threshold boundary (THRESHOLD x viewport height)', () => {
  const limit = THRESHOLD * VH; // 270

  it('exactly at the threshold still snaps (<=), just beyond does not', () => {
    expect(at(900 + limit)).toBe(900);
    expect(at(900 + limit + 0.5)).toBeNull();
    expect(at(900 - limit)).toBe(900);
    expect(at(900 - limit - 0.5)).toBeNull();
  });

  it('the threshold scales with the viewport height', () => {
    expect(at(900 + 200, { viewportHeight: 600 })).toBeNull(); // limit 180
    expect(at(900 + 180, { viewportHeight: 600 })).toBe(900);
    expect(at(900 + 200, { viewportHeight: 1000 })).toBe(900); // limit 300
  });

  it('already on an edge (within 2px) does nothing, so a settled page is not re-animated', () => {
    expect(at(900)).toBeNull();
    expect(at(901)).toBeNull();
    expect(at(902)).toBeNull(); // exactly 2px: still "there"
    expect(at(898)).toBeNull();
    expect(at(902.5)).toBe(900); // beyond 2px: snaps
    expect(at(897.5)).toBe(900);
  });

  it('on a tie between two tops the earlier section wins', () => {
    // 2000px viewport: limit 600, scrollY 1350 is 450px from both 900 and 1800.
    expect(at(1350, { viewportHeight: 2000, documentHeight: 20000 })).toBe(900);
  });
});

describe('pickSnapTarget: the footer and the page bottom are never snapped to', () => {
  it('the footer is not a target: standing on the first screen of the footer (last card ends) snaps nowhere', () => {
    // the footer starts at 9900; 300px into it the nearest card top is 9000, 900px away
    expect(at(9900 + 300, { documentHeight: DOC + 400 })).toBeNull();
  });

  it('when the viewport already shows the end of the document it returns null, even beside a card top', () => {
    // docHeight 10800, vh 900: scrollY 9900 shows the end. Pretend a card top sits at 9850.
    const input = { documentHeight: 10800, sectionTops: [...TOPS, 9850] };
    expect(at(9900, input)).toBeNull();
    expect(at(9898, input)).toBeNull(); // 9898 + 900 = 10798 = docHeight - 2: still the end
    expect(at(9897, input)).toBe(9850); // one px earlier the end is not fully visible: normal rule
  });

  it('a page shorter than the viewport never snaps', () => {
    expect(at(0, { documentHeight: 700, sectionTops: [0, 100] })).toBeNull();
  });
});

describe('pickSnapTarget: degenerate input', () => {
  it('no targets -> null', () => {
    expect(at(1000, { sectionTops: [] })).toBeNull();
  });
  it('a single target', () => {
    expect(at(120, { sectionTops: [0] })).toBe(0);
  });
  it('does not mutate its input', () => {
    const tops = [...TOPS];
    at(1000, { sectionTops: tops });
    expect(tops).toEqual(TOPS);
  });
});

describe('isSnapActive: desktop widths without reduced motion only', () => {
  it.each([
    [MIN_WIDTH - 1, false, false],
    [MIN_WIDTH, false, true],
    [1440, false, true],
    [375, false, false],
    [1440, true, false],
    [MIN_WIDTH, true, false],
  ])('width %i, reduced motion %s -> %s', (width, reduced, want) => {
    expect(isSnapActive(width, reduced)).toBe(want);
  });
});

describe('easeOutCubic', () => {
  it('starts at 0, ends at 1, never overshoots and decelerates', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    let prev = 0;
    let prevStep = Infinity;
    for (let i = 1; i <= 20; i++) {
      const v = easeOutCubic(i / 20);
      expect(v).toBeGreaterThan(prev);
      expect(v).toBeLessThanOrEqual(1);
      expect(v - prev, 'each step is smaller than the last').toBeLessThan(prevStep);
      prevStep = v - prev;
      prev = v;
    }
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 10);
  });

  it('the glide time constant is the documented one', () => {
    expect(DURATION_MS).toBe(520);
  });
});
