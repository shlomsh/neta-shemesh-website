/**
 * SANITY B9: desktop soft snap (JS), no CSS scroll-snap.
 *
 * History: CSS scroll-snap proximity felt loose and mandatory felt aggressive, so snapping moved
 * to SoftSnap.tsx (settle, then glide to a nearby card top; the constants and the decision live in lib/soft-snap.ts). It silently stops working if <main>
 * becomes overflow-hidden, if a constant drifts, or if it starts snapping on phones / under
 * reduced motion. This file guards the constants, the mount, and the "does nothing" paths.
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
  it('MIN_WIDTH is 1024 (desktop only)', () => expect(constant('MIN_WIDTH')).toBe(1024));
  it('THRESHOLD is between 0.2 and 0.4 of the viewport height', () => {
    expect(constant('THRESHOLD')).toBeGreaterThanOrEqual(0.2);
    expect(constant('THRESHOLD')).toBeLessThanOrEqual(0.4);
  });
  it('SETTLE_MS is 100-250', () => {
    expect(constant('SETTLE_MS')).toBeGreaterThanOrEqual(100);
    expect(constant('SETTLE_MS')).toBeLessThanOrEqual(250);
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

  it('its selector matches the solid + photo cards of the real page and excludes the footer', () => {
    const selector = findTargetSelector(snap);
    expect(selector, 'SoftSnap target selector not found').toBeTruthy();
    const targets = Array.from(home.querySelectorAll(selector!));
    expect(targets.length, 'SoftSnap targets').toBeGreaterThanOrEqual(10);
    expect(targets.some((t) => t.tagName === 'FOOTER'), 'footer must not be a snap target').toBe(false);
    const sections = topLevelSections(home).filter((s) => s.tagName === 'SECTION');
    expect(targets, 'every top-level <section> is a snap target').toEqual(sections);
  });
});

describe('behaviour (jsdom, fake timers)', () => {
  const originalMatchMedia = window.matchMedia;
  const originalScrollTo = window.scrollTo;
  let scrollTo: ReturnType<typeof vi.fn>;

  function setup(opts: { width: number; reduced: boolean; edgeDistance: number }) {
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

  /** Mount the real page, wait out the startup grace, park a card edge `edgeDistance` px below, scroll, settle. */
  async function mountScrollAndSettle(edgeDistance: number) {
    const { default: Home } = await import('@/app/page');
    render(React.createElement(Home));
    document.querySelectorAll('main > section').forEach((s) => {
      (s as HTMLElement).getBoundingClientRect = () => ({ top: 5000, bottom: 5800, left: 0, right: 1, width: 1, height: 800, x: 0, y: 5000, toJSON: () => ({}) });
    });
    const first = document.querySelector('main > section') as HTMLElement;
    first.getBoundingClientRect = () => ({ top: edgeDistance, bottom: edgeDistance + 800, left: 0, right: 1, width: 1, height: 800, x: 0, y: edgeDistance, toJSON: () => ({}) });
    await vi.advanceTimersByTimeAsync(2500);
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(400); // settle
    await vi.advanceTimersByTimeAsync(1500); // glide
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

  it('does nothing below 1024px', async () => {
    setup({ width: 800, reduced: false, edgeDistance: 150 });
    await mountScrollAndSettle(150);
    expect(scrollTo, 'SoftSnap snapped below MIN_WIDTH').not.toHaveBeenCalled();
  });

  it('does nothing under prefers-reduced-motion', async () => {
    setup({ width: 1280, reduced: true, edgeDistance: 150 });
    await mountScrollAndSettle(150);
    expect(scrollTo, 'SoftSnap snapped under prefers-reduced-motion').not.toHaveBeenCalled();
  });
});
