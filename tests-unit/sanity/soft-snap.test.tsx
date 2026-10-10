/**
 * SANITY B9: the slide pager's gate and wiring on the REAL page: it runs only at >= 1024px with a fine
 * pointer and no reduced motion, there is NO paging on touch, and no CSS scroll-snap anywhere (that ban,
 * and "nobody imports the pager statically", live in source-scan.test.ts).
 *
 * History: CSS scroll-snap felt loose/aggressive, a JS "soft snap" felt cumbersome, and a gentle touch snap
 * made iPhones feel stuck and was deleted. NS-48 replaced it with a slide pager: one wheel/trackpad gesture
 * or key moves exactly one card (components/motion/SlidePager.tsx; the pure decisions are table-tested in
 * tests-unit/slide-pager.test.ts). SoftSnap.tsx is the tiny gate that mounts it (dynamic import) only where
 * `(min-width: 64rem) and (pointer: fine)` (64rem = 1024px at the default root) matches and motion is not reduced, so touch devices download and
 * run no pager code at any width.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { MIN_WIDTH } from '@/lib/soft-snap';
import { QUIET_MS, SLIDE_MS } from '@/lib/slide-pager';
import { readSources } from './helpers';

const pagerMounts = vi.hoisted(() => ({ count: 0 }));
// Counts MOUNTS of the pager (module evaluations are cached per file and so order-dependent): it must never
// mount on touch / reduced-motion / narrow viewports. The real pager still runs inside the wrapper.
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

describe('constants and source rules', () => {
  it('paging is desktop-only (MIN_WIDTH 1024), a slide is short (SLIDE_MS 400-900) and a gesture ends after a short silence (QUIET_MS 100-300)', () => {
    expect(MIN_WIDTH).toBe(1024);
    expect(SLIDE_MS).toBeGreaterThanOrEqual(400);
    expect(SLIDE_MS).toBeLessThanOrEqual(900);
    expect(QUIET_MS).toBeGreaterThanOrEqual(100);
    expect(QUIET_MS).toBeLessThanOrEqual(300);
  });

  it('there is no touch paging: no touch handlers, TOUCH_SETTLE_MS, gentle mode or lvh probe in the gate, the pager or their libs (CLAUDE.md: do not reintroduce touch snap)', () => {
    const files = readSources().filter((f) => /(?:SoftSnap|SlidePager)\.tsx$|lib\/(?:soft-snap|slide-pager)\.ts$/.test(f.path));
    expect(files.length, 'the four pager files').toBe(4);
    for (const f of files) expect(f.text, f.path).not.toMatch(/touch(start|end|cancel|move)|TOUCH_SETTLE_MS|gentle|lvh|snapMode/i);
  });
});

describe('behaviour on the real page (jsdom, fake rAF)', () => {
  const originalMatchMedia = window.matchMedia;
  const originalScrollTo = window.scrollTo;
  const CARD = 800;
  type Env = { width: number; pointer: 'fine' | 'coarse'; reduced: boolean };
  let scrollTo: ReturnType<typeof vi.fn>;
  let env: Env;
  let changeListeners: Array<() => void> = [];
  let cards: HTMLElement[] = [];

  /** Evaluates the real query strings against the simulated device: min-width, pointer, reduced motion. */
  function evaluate(query: string, o: Env): boolean {
    if (query.includes('prefers-reduced-motion')) return o.reduced;
    return query.split(/\band\b/).every((term) => {
      const minWidth = /min-width:\s*(\d+(?:\.\d+)?)(px|rem)/.exec(term); // rem = the default 16px root here
      if (minWidth) return o.width >= Number(minWidth[1]) * (minWidth[2] === 'rem' ? 16 : 1);
      const pointer = /pointer:\s*(fine|coarse)/.exec(term);
      return pointer ? o.pointer === pointer[1] : false;
    });
  }

  function setup(opts: Partial<Env> & { width: number }) {
    env = { pointer: 'fine', reduced: false, ...opts };
    changeListeners = [];
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: env.width });
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
      removeEventListener: vi.fn((_type: string, fn: () => void) => {
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
    cards = Array.from(document.querySelectorAll<HTMLElement>('main > section, main > footer'));
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
  const wheel = (dy = 100, init: WheelEventInit = {}) => {
    const ev = new WheelEvent('wheel', { deltaY: dy, cancelable: true, bubbles: true, ...init });
    Object.defineProperty(ev, 'timeStamp', { value: performance.now() }); // jsdom stamps with the real clock; the test runs on the faked one
    window.dispatchEvent(ev);
    return ev;
  };
  const key = (k: string, init: KeyboardEventInit = {}) => {
    const ev = new KeyboardEvent('keydown', { key: k, cancelable: true, bubbles: true, ...init });
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
    document.body.innerHTML = '';
    vi.useRealTimers();
    window.matchMedia = originalMatchMedia;
    window.scrollTo = originalScrollTo;
    window.history.replaceState({}, '', '/');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
  });

  it.each<[string, Env]>([
    ['touch (coarse pointer, 390px)', { width: 390, pointer: 'coarse', reduced: false }],
    ['a coarse pointer on a DESKTOP-width screen (touch laptop in tablet mode, iPad landscape)', { width: 1366, pointer: 'coarse', reduced: false }],
    ['below 1024px with a fine pointer (narrow desktop window)', { width: 900, pointer: 'fine', reduced: false }],
    ['prefers-reduced-motion', { width: 1280, pointer: 'fine', reduced: true }],
  ])('%s: the pager never mounts, no wheel or key is cancelled, no scrollTo, even with touch events and a scroll', async (_name, device) => {
    setup(device);
    await mountPage();
    touch('touchstart', 1);
    expect(wheel(100).defaultPrevented, 'the pager cancelled a scroll').toBe(false);
    expect(key('ArrowDown').defaultPrevented, 'the pager hijacked a key').toBe(false);
    window.scrollY = 110;
    window.dispatchEvent(new Event('scroll'));
    touch('touchend', 0);
    await frames(2000);
    expect(scrollTo, 'the pager acted (it must scroll natively)').not.toHaveBeenCalled();
    expect(pagerMounts.count, 'the pager mounted').toBe(0);
  });

  it('control: on desktop (1440, fine pointer) the pager mounts, one wheel notch slides exactly one card, and End lands on the footer (the last target)', async () => {
    setup({ width: 1440 });
    await mountPage();
    expect(pagerMounts.count, 'the gate did not mount the pager on desktop').toBe(1);
    expect(wheel().defaultPrevented, 'the pager no longer pages on desktop').toBe(true);
    await frames(1200);
    expect(window.scrollY).toBe(CARD);
    expect(cards.at(-1)!.tagName, 'the footer is the last card').toBe('FOOTER');
    key('End');
    await frames(1500);
    expect(window.scrollY, 'End must land on the footer top').toBe((cards.length - 1) * CARD);
  });

  it('keys page one card (ArrowDown / PageUp) but typing fields and a focused button keep their keys', async () => {
    setup({ width: 1280 });
    await mountPage();
    expect(key('ArrowDown').defaultPrevented).toBe(true);
    await frames(1200);
    expect(window.scrollY).toBe(CARD);
    key('PageUp');
    await frames(1200);
    expect(window.scrollY).toBe(0);
    const input = document.body.appendChild(document.createElement('input'));
    input.focus();
    expect(key('ArrowDown').defaultPrevented, 'arrow keys move the caret in a field').toBe(false);
    input.blur();
    const button = document.body.appendChild(document.createElement('button'));
    button.focus();
    expect(key(' ').defaultPrevented, 'Space presses a focused button').toBe(false);
  });

  it('does not touch pinch-zoom (ctrl+wheel), horizontal wheel, or any wheel while the mobile menu is open (main[inert], body scroll locked); pages again once it is closed', async () => {
    setup({ width: 1280 });
    await mountPage();
    expect(wheel(100, { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(wheel(5, { deltaX: 100 }).defaultPrevented).toBe(false);
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

  it('?snap=off is the hidden escape hatch (native scroll, nothing stored); any other ?snap= value changes nothing', async () => {
    setup({ width: 1280 });
    window.history.replaceState({}, '', '/?snap=off');
    await mountPage();
    expect(wheel().defaultPrevented).toBe(false);
    expect(key('ArrowDown').defaultPrevented).toBe(false);
    await frames(1500);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(window.sessionStorage.length).toBe(0);
  });

  it('when the media query stops matching (rotated to a phone-sized viewport, pointer becomes coarse) the pager unmounts and stops paging', async () => {
    setup({ width: 1440 });
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
      setup({ width: 1440 });
      await mountPage();
      wheel();
      await frames(200);
      expect(scrollTo.mock.calls.length, 'precondition: the slide has started').toBeGreaterThan(0);
      return scrollTo.mock.calls.length;
    }
    const moveTo2400 = () => Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 2400 });

    it.each<[string, () => void]>([
      ['a scroll we did not make (anchor link, find-in-page, scrollIntoView)', () => { moveTo2400(); window.dispatchEvent(new Event('scroll')); }],
      ['a scrollbar drag (pointerdown on <html>) followed by the scroll it causes', () => { document.documentElement.dispatchEvent(new Event('pointerdown', { bubbles: true })); moveTo2400(); window.dispatchEvent(new Event('scroll')); }],
      ['a hashchange', () => window.dispatchEvent(new Event('hashchange'))],
    ])('%s stops the slide: no further scrollTo after it', async (_name, foreign) => {
      const before = await startSlide();
      foreign();
      await frames(SLIDE_MS * 2);
      expect(scrollTo.mock.calls.length, 'the slide kept fighting the user after input').toBe(before);
    });

    it('control: with no foreign input the same slide runs to the next card top', async () => {
      await startSlide();
      await frames(SLIDE_MS * 2);
      expect(window.scrollY).toBe(CARD);
    });
  });
});
