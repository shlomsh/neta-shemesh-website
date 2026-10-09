/**
 * SANITY B9: soft snap (JS), no CSS scroll-snap, NO snap on touch.
 *
 * History: CSS scroll-snap proximity felt loose and mandatory felt aggressive, so snapping moved
 * to JS (settle, then glide to a nearby card top; the constants and the decision live in lib/soft-snap.ts).
 * A gentle touch mode shipped in 992a790 and made the page feel stuck on iPhones (it snapped BACKWARD
 * to the hero and to one-screen cards after slow swipes); it was deleted. SoftSnap.tsx is now a tiny
 * gate: only where `(min-width: 1024px) and (pointer: fine)` matches and motion is not reduced does it
 * dynamic-import the engine (SoftSnapEngine.tsx), so touch devices download and run no snap code at any width.
 * It silently stops working if <main> becomes overflow-hidden or a constant drifts.
 * This file guards the constants, the mount, the targets (cards AND the footer), the gate, and the "does nothing" paths.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { findTargetSelector, parseExportedNumber, readSources, renderHome, sourceNamed, topLevelSections } from './helpers';

const gate = sourceNamed('SoftSnap.tsx').text; // the tiny client gate
const snap = sourceNamed('SoftSnapEngine.tsx').text; // the engine: target selector, listeners
const tuning = sourceNamed('lib/soft-snap.ts').text; // the pure decision logic and its constants

function constant(name: string): number {
  const v = parseExportedNumber(tuning, name);
  if (v === null) throw new Error(`SoftSnap: constant ${name} not found / not a plain number`);
  return v;
}

describe('constants stay in sane ranges', () => {
  it('MIN_WIDTH is 1024 (snapping is desktop-only: it does nothing below it)', () => expect(constant('MIN_WIDTH')).toBe(1024));
  it('there is no touch constant or mode left in lib/soft-snap.ts', () => {
    expect(tuning).not.toMatch(/TOUCH_SETTLE_MS|snapMode|SnapMode|gentle|touching|largeViewportHeight|lvh/);
  });
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

describe('the gate (SoftSnap.tsx) and the engine (SoftSnapEngine.tsx)', () => {
  it('the gate gates on the snap media query and reduced motion, and loads the engine only by dynamic import()', () => {
    expect(gate).toContain('SNAP_MEDIA');
    expect(gate).toContain('prefers-reduced-motion');
    expect(gate).toMatch(/import\(\s*['"]\.\/SoftSnapEngine['"]\s*\)/);
    expect(gate, 'a static import would ship the engine to touch devices').not.toMatch(/^import[^;]*SoftSnapEngine/m);
  });
  it('no other module imports the engine statically', () => {
    const hits = readSources()
      .filter((f) => !f.path.endsWith('SoftSnapEngine.tsx') && /from\s+['"][^'"]*SoftSnapEngine['"]/.test(f.text))
      .map((f) => f.path);
    expect(hits).toEqual([]);
  });
  it('neither file has touch handlers, a gentle mode or the lvh probe', () => {
    for (const text of [gate, snap]) {
      expect(text).not.toMatch(/touch(start|end|cancel|move)|TOUCH_SETTLE_MS|gentle|lvh|snapMode/i);
    }
  });
  it('the engine skips snapping while the mobile menu is open (main[inert] / body scroll lock)', () => {
    expect(snap).toContain('main[inert]');
    expect(snap).toContain("document.body.style.overflow === 'hidden'");
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

const engineMounts = vi.hoisted(() => ({ count: 0 }));
// Counts MOUNTS of the engine (not module evaluations, which are cached per file and so order-dependent):
// it must never mount on touch / reduced-motion / narrow viewports. The real engine still runs inside the wrapper.
vi.mock('@/components/motion/SoftSnapEngine', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/components/motion/SoftSnapEngine')>();
  const { createElement, useEffect } = await import('react');
  return {
    SoftSnapEngine: () => {
      useEffect(() => {
        engineMounts.count++;
      }, []);
      return createElement(real.SoftSnapEngine);
    },
  };
});

describe('behaviour (jsdom, fake timers)', () => {
  const originalMatchMedia = window.matchMedia;
  const originalScrollTo = window.scrollTo;
  let scrollTo: ReturnType<typeof vi.fn>;
  let env: { width: number; pointer: 'fine' | 'coarse'; reduced: boolean };
  let changeListeners: Array<() => void> = [];

  /** Evaluates the real query strings against the simulated device: min-width, pointer, reduced motion. */
  function evaluate(query: string, o: { width: number; pointer: 'fine' | 'coarse'; reduced: boolean }): boolean {
    if (query.includes('prefers-reduced-motion')) return o.reduced;
    return query.split(/\band\b/).every((term) => {
      const minWidth = /min-width:\s*(\d+)px/.exec(term);
      if (minWidth) return o.width >= Number(minWidth[1]);
      const pointer = /pointer:\s*(fine|coarse)/.exec(term);
      if (pointer) return o.pointer === pointer[1];
      return false;
    });
  }

  function setup(opts: { width: number; reduced: boolean; pointer?: 'fine' | 'coarse' }) {
    env = { width: opts.width, pointer: opts.pointer ?? 'fine', reduced: opts.reduced };
    changeListeners = [];
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: opts.width });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 1000 });
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 20000 });
    window.matchMedia = vi.fn((query: string) => ({
      matches: evaluate(query, env),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((type: string, fn: () => void) => {
        if (type === 'change') changeListeners.push(fn);
      }),
      removeEventListener: vi.fn((type: string, fn: () => void) => {
        changeListeners = changeListeners.filter((l) => l !== fn);
      }),
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
    // the gate's import() of the engine resolves in real (not faked) time; under load it can take several turns
    for (let i = 0; i < 25; i++) {
      await vi.dynamicImportSettled();
      await vi.advanceTimersByTimeAsync(0);
    }
    await vi.advanceTimersByTimeAsync(2500);
    return first;
  }

  /** mountPage, then scroll, settle, and let the glide finish. */
  async function mountScrollAndSettle(edgeDistance: number, height = 800) {
    await mountPage(edgeDistance, height);
    window.dispatchEvent(new Event('wheel'));
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
    engineMounts.count = 0;
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
    vi.useRealTimers();
    window.matchMedia = originalMatchMedia;
    window.scrollTo = originalScrollTo;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
  });

  it('touch (coarse pointer, 390px): touchstart, scroll to 110, touchend, 3s later: no scrollTo at all, and the engine never mounted', async () => {
    setup({ width: 390, reduced: false, pointer: 'coarse' });
    await mountPage(150);
    touch('touchstart', 1);
    window.scrollY = 110;
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(1000);
    touch('touchend', 0);
    await vi.advanceTimersByTimeAsync(3000);
    expect(scrollTo, 'SoftSnap acted on a touch device (it snapped backward and made iOS feel stuck)').not.toHaveBeenCalled();
    expect(
      scrollTo.mock.calls.filter(([, y]) => typeof y === 'number' && y < 110),
      'no scrollTo below the swipe position',
    ).toEqual([]);
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(3000);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(engineMounts.count, 'the snap engine mounted on a touch device').toBe(0);
  });

  it('a coarse pointer on a DESKTOP-width screen (touch laptop in tablet mode, iPad landscape) does nothing either', async () => {
    setup({ width: 1366, reduced: false, pointer: 'coarse' });
    await mountScrollAndSettle(150);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(engineMounts.count).toBe(0);
  });

  it('below 1024px with a fine pointer (narrow desktop window) does nothing', async () => {
    setup({ width: 900, reduced: false, pointer: 'fine' });
    await mountScrollAndSettle(150);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(engineMounts.count).toBe(0);
  });

  it('does nothing under prefers-reduced-motion, and never mounts the engine', async () => {
    setup({ width: 1280, reduced: true, pointer: 'fine' });
    await mountScrollAndSettle(150);
    expect(scrollTo, 'SoftSnap snapped under prefers-reduced-motion').not.toHaveBeenCalled();
    expect(engineMounts.count).toBe(0);
  });

  it('control: on desktop (1440, fine pointer), near a card edge after a wheel tick, the engine loads and it glides', async () => {
    setup({ width: 1440, reduced: false });
    await mountScrollAndSettle(150);
    expect(engineMounts.count, 'the gate did not mount the engine on desktop').toBe(1);
    expect(scrollTo, 'SoftSnap is not mounted in the page or no longer snaps on desktop').toHaveBeenCalled();
  });

  it('control: far from every card edge it leaves the page alone', async () => {
    setup({ width: 1280, reduced: false, pointer: 'fine' });
    await mountScrollAndSettle(700);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('while the mobile menu is open (main[inert], body scroll locked) it never snaps; once closed it does', async () => {
    setup({ width: 1280, reduced: false });
    await mountPage(150);
    const main = document.querySelector('main') as HTMLElement;
    main.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(2000);
    expect(scrollTo, 'snapped under the open menu overlay').not.toHaveBeenCalled();

    main.removeAttribute('inert');
    document.body.style.overflow = '';
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(2000);
    expect(scrollTo).toHaveBeenCalled();
  });

  it('when the media query flips from match to no-match (rotate to a phone-sized viewport, pointer becomes coarse) the engine unmounts and stops snapping', async () => {
    setup({ width: 1440, reduced: false });
    await mountPage(150);
    expect(engineMounts.count, 'precondition: the engine mounted on desktop').toBe(1);
    expect(changeListeners.length, 'the gate subscribed to matchMedia change events').toBeGreaterThan(0);

    env.width = 390;
    env.pointer = 'coarse';
    await act(async () => {
      changeListeners.forEach((l) => l());
    });
    window.dispatchEvent(new Event('wheel'));
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(3000);
    expect(scrollTo, 'the engine kept snapping after the media query stopped matching').not.toHaveBeenCalled();
  });
});
