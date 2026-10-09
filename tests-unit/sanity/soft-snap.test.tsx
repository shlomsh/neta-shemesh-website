/**
 * SANITY B9: the slide pager (JS), no CSS scroll-snap, NO paging on touch.
 *
 * History: CSS scroll-snap proximity felt loose and mandatory felt aggressive, then a JS "soft snap"
 * (settle, glide to a nearby card top) felt cumbersome; NS-48 replaced it with a slide pager: one wheel /
 * trackpad gesture or key moves exactly one card (components/motion/SlidePager.tsx, pure decisions in
 * lib/slide-pager.ts, table-tested in tests-unit/slide-pager.test.ts). SoftSnap.tsx is the tiny gate: only
 * where `(min-width: 1024px) and (pointer: fine)` matches and motion is not reduced does it mount the
 * pager (dynamic import, started eagerly there), so touch devices download and run no pager code at any width.
 * A gentle touch snap shipped in 992a790 and made iPhones feel stuck; it was deleted.
 * It silently stops working if <main> becomes overflow-hidden or the target selector drifts.
 * This file guards the mount, the targets (cards AND the footer), the gate, and the "does nothing" paths.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { findTargetSelector, parseExportedNumber, readSources, renderHome, sourceNamed, topLevelSections } from './helpers';

const gate = sourceNamed('SoftSnap.tsx').text; // the tiny client gate
const pager = sourceNamed('SlidePager.tsx').text; // the pager: target selector, listeners
const tuning = sourceNamed('lib/soft-snap.ts').text; // MIN_WIDTH, SNAP_MEDIA, isSnapActive
const pure = sourceNamed('lib/slide-pager.ts').text; // the pure decisions and their constants

function constant(name: string): number {
  const v = parseExportedNumber(pure, name);
  if (v === null) throw new Error(`SlidePager: constant ${name} not found / not a plain number`);
  return v;
}

describe('constants stay in sane ranges', () => {
  it('MIN_WIDTH is 1024 (paging is desktop-only: it does nothing below it)', () => {
    expect(parseExportedNumber(tuning, 'MIN_WIDTH')).toBe(1024);
  });
  it('there is no touch constant or mode left in lib/soft-snap.ts or lib/slide-pager.ts', () => {
    for (const text of [tuning, pure]) {
      expect(text).not.toMatch(/TOUCH_SETTLE_MS|snapMode|SnapMode|gentle|touching|largeViewportHeight|lvh/);
    }
  });
  it('SLIDE_MS is 400-900 (a short slide, not a scroll)', () => {
    expect(constant('SLIDE_MS')).toBeGreaterThanOrEqual(400);
    expect(constant('SLIDE_MS')).toBeLessThanOrEqual(900);
  });
  it('QUIET_MS is 100-300 (the gesture-end silence)', () => {
    expect(constant('QUIET_MS')).toBeGreaterThanOrEqual(100);
    expect(constant('QUIET_MS')).toBeLessThanOrEqual(300);
  });
});

describe('the gate (SoftSnap.tsx) and the pager (SlidePager.tsx)', () => {
  it('the gate gates on the snap media query and reduced motion, and loads the pager only by dynamic import()', () => {
    expect(gate).toContain('SNAP_MEDIA');
    expect(gate).toContain('prefers-reduced-motion');
    expect(gate).toMatch(/import\(\s*['"]\.\/SlidePager['"]\s*\)/);
    expect(gate, 'a static import would ship the pager to touch devices').not.toMatch(/^import[^;]*SlidePager/m);
  });
  it('no other module imports the pager statically', () => {
    const hits = readSources()
      .filter((f) => !f.path.endsWith('SlidePager.tsx') && /from\s+['"][^'"]*SlidePager['"]/.test(f.text))
      .map((f) => f.path);
    expect(hits).toEqual([]);
  });
  it('neither file has touch handlers, a gentle mode or the lvh probe', () => {
    for (const text of [gate, pager]) {
      expect(text).not.toMatch(/touch(start|end|cancel|move)|TOUCH_SETTLE_MS|gentle|lvh|snapMode/i);
    }
  });
  it('the gate and the pager are client components (they use hooks and window listeners)', () => {
    expect(gate.trimStart().startsWith("'use client'")).toBe(true);
    expect(pager.trimStart().startsWith("'use client'")).toBe(true);
  });
  it('the pager skips paging while the mobile menu is open (main[inert] / body scroll lock)', () => {
    expect(pager).toContain('main[inert]');
    expect(pager).toContain("document.body.style.overflow === 'hidden'");
  });
});

describe('no CSS scroll-snap anywhere', () => {
  it('no scroll-snap-type / snap utilities in css or tsx (the pager is JS; CSS snap fights it)', () => {
    const hits = readSources()
      .filter((s) => /scroll-snap-type|scrollSnapType|\bsnap-(x|y|both|mandatory|proximity)\b/.test(s.text))
      .map((s) => s.path);
    expect(hits, 'CSS scroll-snap reintroduced (it fights the JS slide pager)').toEqual([]);
  });
});

describe('targets', () => {
  let home: HTMLElement;
  beforeAll(async () => {
    home = await renderHome();
  });

  it('its selector matches the solid + photo cards of the real page AND the footer, in page order', () => {
    const selector = findTargetSelector(pager);
    expect(selector, 'SoftSnap target selector not found').toBeTruthy();
    const targets = Array.from(home.querySelectorAll(selector!));
    expect(targets.length, 'SoftSnap targets').toBeGreaterThanOrEqual(10);
    expect(targets[targets.length - 1]?.tagName, 'the footer is the last snap target').toBe('FOOTER');
    expect(targets, 'every top-level <section> and the footer is a snap target').toEqual(topLevelSections(home));
  });
});

const pagerMounts = vi.hoisted(() => ({ count: 0 }));
// Counts MOUNTS of the pager (not module evaluations, which are cached per file and so order-dependent):
// it must never mount on touch / reduced-motion / narrow viewports. The real pager still runs inside the wrapper.
vi.mock('@/components/motion/SlidePager', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/components/motion/SlidePager')>();
  const { createElement, useEffect } = await import('react');
  return {
    SlidePager: () => {
      useEffect(() => {
        pagerMounts.count++;
      }, []);
      return createElement(real.SlidePager);
    },
  };
});

describe('behaviour (jsdom, fake rAF)', () => {
  const originalMatchMedia = window.matchMedia;
  const originalScrollTo = window.scrollTo;
  const CARD = 800;
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
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: opts.width });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: CARD });
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
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
    // like a browser: a scrollTo moves scrollY
    scrollTo = vi.fn((_x: number, y: number) => {
      Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: y });
    });
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  }

  /** Mount the real page, stack its cards `CARD` px tall from the document top, and let the gate load the pager. */
  async function mountPage() {
    const { default: Home } = await import('@/app/page');
    render(React.createElement(Home));
    const cards = document.querySelectorAll<HTMLElement>('main > section, main > footer');
    cards.forEach((el, i) => {
      el.getBoundingClientRect = () => {
        const top = i * CARD - window.scrollY;
        return { top, bottom: top + CARD, left: 0, right: 1, width: 1, height: CARD, x: 0, y: top, toJSON: () => ({}) };
      };
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: cards.length * CARD });
    await act(async () => {
      for (let i = 0; i < 25; i++) {
        await vi.dynamicImportSettled();
        await Promise.resolve();
      }
    });
  }

  const frames = async (ms: number) => {
    for (let t = 0; t < ms; t += 16) await vi.advanceTimersByTimeAsync(16);
  };

  const wheel = (dy = 100) => {
    const ev = new WheelEvent('wheel', { deltaY: dy, cancelable: true, bubbles: true });
    Object.defineProperty(ev, 'timeStamp', { value: performance.now() }); // jsdom stamps with the real clock; the test runs on the faked one
    window.dispatchEvent(ev);
    return ev;
  };

  /** A touch event carrying `count` fingers (jsdom's TouchEvent does not take a touches list). */
  function touch(type: 'touchstart' | 'touchend', count: number) {
    const ev = new Event(type);
    Object.defineProperty(ev, 'touches', { value: Array.from({ length: count }, () => ({})) });
    window.dispatchEvent(ev);
  }

  beforeEach(() => {
    cleanup();
    pagerMounts.count = 0;
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

  it('touch (coarse pointer, 390px): touch swipe and wheel events, 3s later: no event cancelled, no scrollTo at all, and the pager never mounted', async () => {
    setup({ width: 390, reduced: false, pointer: 'coarse' });
    await mountPage();
    touch('touchstart', 1);
    expect(wheel(100).defaultPrevented, 'the pager cancelled a scroll on a touch device').toBe(false);
    window.scrollY = 110;
    window.dispatchEvent(new Event('scroll'));
    await frames(1000);
    touch('touchend', 0);
    await frames(3000);
    expect(scrollTo, 'the pager acted on a touch device (it must scroll natively)').not.toHaveBeenCalled();
    expect(pagerMounts.count, 'the pager mounted on a touch device').toBe(0);
  });

  it('a coarse pointer on a DESKTOP-width screen (touch laptop in tablet mode, iPad landscape) does nothing either', async () => {
    setup({ width: 1366, reduced: false, pointer: 'coarse' });
    await mountPage();
    expect(wheel().defaultPrevented).toBe(false);
    await frames(1500);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(pagerMounts.count).toBe(0);
  });

  it('below 1024px with a fine pointer (narrow desktop window) does nothing', async () => {
    setup({ width: 900, reduced: false, pointer: 'fine' });
    await mountPage();
    expect(wheel().defaultPrevented).toBe(false);
    await frames(1500);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(pagerMounts.count).toBe(0);
  });

  it('does nothing under prefers-reduced-motion, and never mounts the pager', async () => {
    setup({ width: 1280, reduced: true, pointer: 'fine' });
    await mountPage();
    expect(wheel().defaultPrevented, 'the pager cancelled a scroll under prefers-reduced-motion').toBe(false);
    await frames(1500);
    expect(scrollTo, 'the pager paged under prefers-reduced-motion').not.toHaveBeenCalled();
    expect(pagerMounts.count).toBe(0);
  });

  it('control: on desktop (1440, fine pointer) the pager mounts in the real page and one wheel notch slides exactly one card', async () => {
    setup({ width: 1440, reduced: false });
    await mountPage();
    expect(pagerMounts.count, 'the gate did not mount the pager on desktop').toBe(1);
    expect(wheel().defaultPrevented, 'SoftSnap is not mounted in the page or no longer pages on desktop').toBe(true);
    await frames(1200);
    expect(window.scrollY).toBe(CARD);
  });

  it('while the mobile menu is open (main[inert], body scroll locked) it never pages; once closed it does', async () => {
    setup({ width: 1280, reduced: false });
    await mountPage();
    const main = document.querySelector('main') as HTMLElement;
    main.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    expect(wheel().defaultPrevented, 'paged under the open menu overlay').toBe(false);
    await frames(1500);
    expect(scrollTo).not.toHaveBeenCalled();

    main.removeAttribute('inert');
    document.body.style.overflow = '';
    expect(wheel().defaultPrevented).toBe(true);
    await frames(1200);
    expect(scrollTo).toHaveBeenCalled();
  });

  it('when the media query flips from match to no-match (rotate to a phone-sized viewport, pointer becomes coarse) the pager unmounts and stops paging', async () => {
    setup({ width: 1440, reduced: false });
    await mountPage();
    expect(pagerMounts.count, 'precondition: the pager mounted on desktop').toBe(1);
    expect(changeListeners.length, 'the gate subscribed to matchMedia change events').toBeGreaterThan(0);

    env.width = 390;
    env.pointer = 'coarse';
    await act(async () => {
      changeListeners.forEach((l) => l());
    });
    expect(wheel().defaultPrevented, 'the pager kept cancelling scrolls after the media query stopped matching').toBe(false);
    await frames(1500);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  describe('a slide in flight yields to input that is not ours (cancel-on-input)', () => {
    /** Mount, start a slide with a wheel notch, let it run a little but not finish. */
    async function startSlide() {
      setup({ width: 1440, reduced: false });
      await mountPage();
      wheel();
      await frames(200);
      expect(scrollTo.mock.calls.length, 'precondition: the slide has started').toBeGreaterThan(0);
      return scrollTo.mock.calls.length;
    }

    const FOREIGN: Array<[string, () => void]> = [
      ['a scroll we did not make (anchor link, find-in-page, scrollIntoView)', () => {
        Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 2400 });
        window.dispatchEvent(new Event('scroll'));
      }],
      ['a scrollbar drag (pointerdown on <html>) followed by the scroll it causes', () => {
        document.documentElement.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 2400 });
        window.dispatchEvent(new Event('scroll'));
      }],
      ['a hashchange', () => window.dispatchEvent(new Event('hashchange'))],
    ];

    it.each(FOREIGN)('%s stops the slide: no further scrollTo after it', async (_name, act_) => {
      const before = await startSlide();
      act_();
      await frames(constant('SLIDE_MS') * 2);
      expect(scrollTo.mock.calls.length, 'the slide kept fighting the user after input').toBe(before);
    });

    it('control: with no foreign input the same slide runs to the next card top', async () => {
      await startSlide();
      await frames(constant('SLIDE_MS') * 2);
      expect(window.scrollY).toBe(CARD);
    });
  });
});
