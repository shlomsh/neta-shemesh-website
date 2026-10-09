/**
 * SANITY B9: soft snap (JS), no CSS scroll-snap.
 *
 * History: CSS scroll-snap proximity felt loose and mandatory felt aggressive, so snapping moved
 * to SoftSnap.tsx (settle, then glide to a nearby card top; the constants and the decision live in lib/soft-snap.ts).
 * It runs at every width: the desktop rule at >= 1024px, a gentler one on touch widths (waits for momentum to end, never
 * acts under a finger, never pulls the reader back up a tall section). It silently stops working if <main>
 * becomes overflow-hidden, if a constant drifts, or if it starts snapping under reduced motion or under a finger.
 * This file guards the constants, the mount, the targets (cards AND the footer), and the "does nothing" paths.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { findTargetSelector, parseExportedNumber, readSources, renderHome, sourceNamed, topLevelSections } from './helpers';

const snap = sourceNamed('SoftSnap.tsx').text; // the effect: target selector, listeners
const tuning = sourceNamed('lib/soft-snap.ts').text; // the pure decision logic and its constants

function constant(name: string): number {
  const v = parseExportedNumber(tuning, name);
  if (v === null) throw new Error(`SoftSnap: constant ${name} not found / not a plain number`);
  return v;
}

describe('constants stay in sane ranges', () => {
  it('MIN_WIDTH is 1024 (where the desktop rules start; below it the gentle touch rules apply)', () => expect(constant('MIN_WIDTH')).toBe(1024));
  it('THRESHOLD is between 0.2 and 0.4 of the viewport height', () => {
    expect(constant('THRESHOLD')).toBeGreaterThanOrEqual(0.2);
    expect(constant('THRESHOLD')).toBeLessThanOrEqual(0.4);
  });
  it('SETTLE_MS is 100-250', () => {
    expect(constant('SETTLE_MS')).toBeGreaterThanOrEqual(100);
    expect(constant('SETTLE_MS')).toBeLessThanOrEqual(250);
  });
  it('TOUCH_SETTLE_MS is 150-400 and longer than SETTLE_MS (momentum must have ended)', () => {
    expect(constant('TOUCH_SETTLE_MS')).toBeGreaterThanOrEqual(150);
    expect(constant('TOUCH_SETTLE_MS')).toBeLessThanOrEqual(400);
    expect(constant('TOUCH_SETTLE_MS')).toBeGreaterThan(constant('SETTLE_MS'));
  });
  it('DURATION_MS is 350-700', () => {
    expect(constant('DURATION_MS')).toBeGreaterThanOrEqual(350);
    expect(constant('DURATION_MS')).toBeLessThanOrEqual(700);
  });
  it('STARTUP_IGNORE_MS is at least 1000 (hero entrance must not be snapped over)', () => {
    expect(constant('STARTUP_IGNORE_MS')).toBeGreaterThanOrEqual(1000);
  });
});

describe('no CSS scroll-snap anywhere', () => {
  it('no scroll-snap-type / snap utilities in css or tsx', () => {
    const hits = readSources()
      .filter((s) => /scroll-snap-type|scrollSnapType|\bsnap-(x|y|both|mandatory|proximity)\b/.test(s.text))
      .map((s) => s.path);
    expect(hits, 'CSS scroll-snap reintroduced (it fights the JS soft snap)').toEqual([]);
  });
});

describe('targets', () => {
  let home: HTMLElement;
  beforeAll(async () => {
    home = await renderHome();
  });

  it('its selector matches the solid + photo cards of the real page AND the footer, in page order', () => {
    const selector = findTargetSelector(snap);
    expect(selector, 'SoftSnap target selector not found').toBeTruthy();
    const targets = Array.from(home.querySelectorAll(selector!));
    expect(targets.length, 'SoftSnap targets').toBeGreaterThanOrEqual(10);
    expect(targets[targets.length - 1]?.tagName, 'the footer is the last snap target').toBe('FOOTER');
    expect(targets, 'every top-level <section> and the footer is a snap target').toEqual(topLevelSections(home));
  });
});

describe('behaviour (jsdom, fake timers)', () => {
  const originalMatchMedia = window.matchMedia;
  const originalScrollTo = window.scrollTo;
  let scrollTo: ReturnType<typeof vi.fn>;

  function setup(opts: { width: number; reduced: boolean; edgeDistance?: number }) {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: opts.width });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 1000 });
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 20000 });
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? opts.reduced : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  }

  /** Mount the real page and park every card far away, except the first, `edgeDistance` px below the viewport top (height `height`). */
  async function mountPage(edgeDistance: number, height = 800) {
    const { default: Home } = await import('@/app/page');
    render(React.createElement(Home));
    document.querySelectorAll('main > section, main > footer').forEach((s) => {
      (s as HTMLElement).getBoundingClientRect = () => ({ top: 5000, bottom: 5800, left: 0, right: 1, width: 1, height: 800, x: 0, y: 5000, toJSON: () => ({}) });
    });
    const first = document.querySelector('main > section') as HTMLElement;
    first.getBoundingClientRect = () => ({ top: edgeDistance, bottom: edgeDistance + height, left: 0, right: 1, width: 1, height, x: 0, y: edgeDistance, toJSON: () => ({}) });
    await vi.advanceTimersByTimeAsync(2500);
    return first;
  }

  /** mountPage, then scroll, settle, and let the glide finish. */
  async function mountScrollAndSettle(edgeDistance: number, height = 800) {
    await mountPage(edgeDistance, height);
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(400); // settle
    await vi.advanceTimersByTimeAsync(1500); // glide
  }

  /** A touch event carrying `count` fingers (jsdom's TouchEvent does not take a touches list). */
  function touch(type: 'touchstart' | 'touchend', count: number) {
    const ev = new Event(type);
    Object.defineProperty(ev, 'touches', { value: Array.from({ length: count }, () => ({})) });
    window.dispatchEvent(ev);
  }

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.matchMedia = originalMatchMedia;
    window.scrollTo = originalScrollTo;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
  });

  it('control: on desktop, near a card edge, it glides (scrollTo is called)', async () => {
    setup({ width: 1280, reduced: false, edgeDistance: 150 });
    await mountScrollAndSettle(150);
    expect(scrollTo, 'SoftSnap is not mounted in the page or no longer snaps on desktop').toHaveBeenCalled();
  });

  it('control: far from every card edge it leaves the page alone', async () => {
    setup({ width: 1280, reduced: false, edgeDistance: 700 });
    await mountScrollAndSettle(700);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('below 1024px it also snaps (gently): a one-screen card edge nearby is glided to', async () => {
    setup({ width: 390, reduced: false });
    await mountScrollAndSettle(150);
    expect(scrollTo, 'SoftSnap no longer snaps on touch widths').toHaveBeenCalled();
  });

  it('below 1024px, mid-way through a section taller than the screen it does not move', async () => {
    setup({ width: 390, reduced: false });
    // window.scrollY is 1000: this card's top is 150px above the viewport top (desktop would pull back to it) and it is 2400px tall.
    await mountScrollAndSettle(-150, 2400);
    expect(scrollTo, 'SoftSnap pulled a reader back up a tall section').not.toHaveBeenCalled();
  });

  it('below 1024px, it waits for the finger: nothing while it is down, a glide once it lifts and the page is still', async () => {
    setup({ width: 390, reduced: false });
    await mountPage(150);
    touch('touchstart', 1);
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(1000);
    expect(scrollTo, 'SoftSnap acted under a finger').not.toHaveBeenCalled();
    touch('touchend', 0);
    await vi.advanceTimersByTimeAsync(100); // less than TOUCH_SETTLE_MS: still waiting for momentum
    expect(scrollTo).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1500);
    expect(scrollTo, 'SoftSnap never snapped after the touch ended').toHaveBeenCalled();
  });

  it('does nothing under prefers-reduced-motion', async () => {
    setup({ width: 1280, reduced: true, edgeDistance: 150 });
    await mountScrollAndSettle(150);
    expect(scrollTo, 'SoftSnap snapped under prefers-reduced-motion').not.toHaveBeenCalled();
  });
});
