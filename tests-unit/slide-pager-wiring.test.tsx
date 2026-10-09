/**
 * The NS-48 preview modes `?snap=slides` (JS pager) and `?snap=slides-css` (native CSS snap): their
 * gating (desktop width + fine pointer + no reduced motion, menu closed) and what the real
 * components do in jsdom. The decisions themselves are table-tested in slide-pager.test.ts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SoftSnap } from '@/components/motion/SoftSnap';

const src = (rel: string) => readFileSync(resolve(__dirname, '..', rel), 'utf8');

interface Env {
  width: number;
  pointer: 'fine' | 'coarse';
  reduced: boolean;
}

function evaluate(query: string, o: Env): boolean {
  if (query.includes('prefers-reduced-motion')) return o.reduced;
  return query.split(/\band\b/).every((term) => {
    const minWidth = /min-width:\s*(\d+)px/.exec(term);
    if (minWidth) return o.width >= Number(minWidth[1]);
    const pointer = /pointer:\s*(fine|coarse)/.exec(term);
    return pointer ? o.pointer === pointer[1] : false;
  });
}

async function mount(search: string, env: Env = { width: 1440, pointer: 'fine', reduced: false }) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: evaluate(query, env),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
  window.history.replaceState({}, '', `/${search}`);
  const utils = render(<SoftSnap />);
  await act(async () => {
    for (let i = 0; i < 10; i++) {
      await vi.dynamicImportSettled();
      await Promise.resolve();
    }
  });
  return utils;
}

/** A page of five 900 px cards inside <main>, viewport 900. */
function buildPage(vh = 900, cardH = 900) {
  document.body.innerHTML = '<main>' + '<section></section>'.repeat(4) + '<footer></footer></main>';
  document.querySelectorAll('main > section, main > footer').forEach((el, i) => {
    (el as HTMLElement).getBoundingClientRect = () =>
      ({ top: i * cardH - window.scrollY, bottom: (i + 1) * cardH - window.scrollY, left: 0, right: 1, width: 1, height: cardH, x: 0, y: i * cardH - window.scrollY, toJSON: () => ({}) });
  });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: vh });
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5 * cardH });
}

const wheel = (dy: number, over: WheelEventInit = {}) => {
  const ev = new WheelEvent('wheel', { deltaY: dy, cancelable: true, bubbles: true, ...over });
  Object.defineProperty(ev, 'timeStamp', { value: performance.now() }); // jsdom stamps with the real clock; the test runs on the faked one
  window.dispatchEvent(ev);
  return ev;
};

describe('?snap=slides-css', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    document.documentElement.removeAttribute('data-snap');
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
    document.documentElement.removeAttribute('data-snap');
  });

  it('sets html[data-snap="slides-css"] and renders the scoped mandatory-snap rules, nothing else on html', async () => {
    const { baseElement } = await mount('?snap=slides-css');
    expect(document.documentElement.getAttribute('data-snap')).toBe('slides-css');
    const css = baseElement.querySelector('style')?.textContent ?? '';
    expect(css).toMatch(/html\[data-snap="slides-css"\]\s*\{\s*scroll-snap-type:\s*y mandatory/);
    expect(css).toMatch(/main > section[\s\S]*main > footer[\s\S]*scroll-snap-align:\s*start;\s*scroll-snap-stop:\s*always/);
    expect(css).toMatch(/@media \(min-width: 1024px\) and \(pointer: fine\) and \(prefers-reduced-motion: no-preference\)/);
  });

  it('removes the attribute again when unmounted', async () => {
    const { unmount } = await mount('?snap=slides-css');
    unmount();
    expect(document.documentElement.hasAttribute('data-snap')).toBe(false);
  });

  it.each<[string, Env]>([
    ['touch (coarse pointer, 390)', { width: 390, pointer: 'coarse', reduced: false }],
    ['a coarse pointer on a desktop-width screen', { width: 1366, pointer: 'coarse', reduced: false }],
    ['a narrow desktop window (900, fine)', { width: 900, pointer: 'fine', reduced: false }],
    ['prefers-reduced-motion', { width: 1440, pointer: 'fine', reduced: true }],
  ])('%s: no attribute and no style', async (_n, env) => {
    const { baseElement } = await mount('?snap=slides-css', env);
    expect(document.documentElement.hasAttribute('data-snap')).toBe(false);
    expect(baseElement.querySelector('style')).toBeNull();
  });
});

describe('?snap=slides (the JS pager)', () => {
  let scrollTo: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    window.sessionStorage.clear();
    document.body.style.overflow = '';
    scrollTo = vi.fn((_x: number, y: number) => {
      Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: y });
    });
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    window.history.replaceState({}, '', '/');
  });

  /** advances rAF time in 16 ms frames */
  const frames = async (ms: number) => {
    for (let t = 0; t < ms; t += 16) await vi.advanceTimersByTimeAsync(16);
  };

  it('a wheel notch slides exactly one card (900 px) and ends exactly on the card top; its own wheel event is cancelled', async () => {
    buildPage();
    await mount('?snap=slides');
    const ev = wheel(100);
    expect(ev.defaultPrevented).toBe(true);
    await frames(1200);
    expect(scrollTo).toHaveBeenCalled();
    expect(scrollTo.mock.calls.at(-1)).toEqual([0, 900]);
    expect(window.scrollY).toBe(900);
  });

  it('the rest of a gesture (a 1 s decaying tail, 16 ms apart) is swallowed (cancelled) and moves nothing more', async () => {
    buildPage();
    await mount('?snap=slides');
    wheel(100);
    await frames(16);
    const ys: number[] = [];
    for (let i = 0; i < 62; i++) {
      expect(wheel(Math.max(1, Math.round(100 * Math.exp(-i / 14)))).defaultPrevented).toBe(true);
      await frames(16);
      ys.push(window.scrollY);
    }
    await frames(1000);
    expect(window.scrollY, 'one gesture, one card').toBe(900);
  });

  it('keys: ArrowDown pages, Shift+Space / PageUp page back, End and Home jump; typing fields keep their keys', async () => {
    buildPage();
    await mount('?snap=slides');
    const key = (k: string, o: KeyboardEventInit = {}) => {
      const ev = new KeyboardEvent('keydown', { key: k, cancelable: true, bubbles: true, ...o });
      window.dispatchEvent(ev);
      return ev;
    };
    expect(key('ArrowDown').defaultPrevented).toBe(true);
    await frames(1200);
    expect(window.scrollY).toBe(900);
    key('PageDown');
    await frames(1200);
    expect(window.scrollY).toBe(1800);
    key(' ', { shiftKey: true });
    await frames(1200);
    expect(window.scrollY).toBe(900);
    key('End');
    await frames(1500);
    expect(window.scrollY).toBe(3600); // last top (4 * 900), clamped to doc - viewport
    key('Home');
    await frames(1500);
    expect(window.scrollY).toBe(0);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    expect(key('ArrowDown').defaultPrevented).toBe(false);
    input.blur();
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    expect(key(' ').defaultPrevented).toBe(false); // Space presses a focused button
    expect(key('ArrowDown').defaultPrevented).toBe(true);
  });

  it('keys pressed mid-slide retarget from where the slide is heading (three quick presses = three cards)', async () => {
    buildPage();
    await mount('?snap=slides');
    for (let i = 0; i < 3; i++) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
      await frames(100);
    }
    await frames(1500);
    expect(window.scrollY).toBe(2700);
  });

  it('a scroll we did not make (anchor link, scrollbar, scrollIntoView) cancels the slide instead of fighting it', async () => {
    buildPage();
    await mount('?snap=slides');
    wheel(100);
    await frames(200);
    const calls = scrollTo.mock.calls.length;
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 3000 }); // someone else moved the page
    window.dispatchEvent(new Event('scroll'));
    await frames(1200);
    expect(scrollTo.mock.calls.length).toBe(calls);
    expect(window.scrollY).toBe(3000);
  });

  it('does not touch wheel events while the menu is open, on ctrl+wheel (zoom), or horizontal', async () => {
    buildPage();
    await mount('?snap=slides');
    expect(wheel(100, { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(wheel(5, { deltaX: 100 }).defaultPrevented).toBe(false);
    document.body.style.overflow = 'hidden';
    expect(wheel(100).defaultPrevented).toBe(false);
    await frames(1200);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('a card taller than the viewport scrolls natively (event not cancelled) until its bottom edge', async () => {
    buildPage(700, 720);
    await mount('?snap=slides');
    const ev = wheel(10); // 20 px of card below the viewport
    expect(ev.defaultPrevented).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(400); // gesture ends
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 20 }); // browser scrolled to the edge
    const ev2 = wheel(100);
    expect(ev2.defaultPrevented).toBe(true);
    await frames(1200);
    expect(window.scrollY).toBe(720);
  });

  it.each<[string, Env]>([
    ['touch (coarse pointer, 390)', { width: 390, pointer: 'coarse', reduced: false }],
    ['a coarse pointer on a desktop-width screen', { width: 1366, pointer: 'coarse', reduced: false }],
    ['a narrow desktop window (900, fine)', { width: 900, pointer: 'fine', reduced: false }],
    ['prefers-reduced-motion', { width: 1440, pointer: 'fine', reduced: true }],
  ])('%s: no listeners, no cancelled wheel, no scrollTo, no key hijack', async (_n, env) => {
    buildPage();
    await mount('?snap=slides', env);
    expect(wheel(100).defaultPrevented).toBe(false);
    const k = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    window.dispatchEvent(k);
    expect(k.defaultPrevented).toBe(false);
    await frames(1500);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('?snap=slides is remembered across client navigation (sessionStorage)', async () => {
    buildPage();
    await mount('?snap=slides');
    expect(window.sessionStorage.getItem('snap-mode')).toBe('slides');
  });
});

describe('source rules for the preview modes', () => {
  const pager = src('src/components/motion/SlidePager.tsx');
  const css = src('src/components/motion/SlidesCss.tsx');
  const gate = src('src/components/motion/SoftSnap.tsx');
  it('the default mode is still v1 (production unchanged)', () => {
    expect(src('src/lib/soft-snap.ts')).toMatch(/DEFAULT_SNAP_MODE: SnapVariant = 'v1'/);
  });
  it('the gate loads both preview components by dynamic import() only', () => {
    expect(gate).toMatch(/import\(\s*['"]\.\/SlidePager['"]\s*\)/);
    expect(gate).toMatch(/import\(\s*['"]\.\/SlidesCss['"]\s*\)/);
    expect(gate).not.toMatch(/^import[^;]*(SlidePager|SlidesCss)/m);
  });
  it('the pager registers its wheel listener as non-passive (it must be able to cancel) and has no touch handling', () => {
    expect(pager).toMatch(/addEventListener\('wheel',\s*onWheel,\s*\{\s*passive:\s*false\s*\}\)/);
    expect(pager).not.toMatch(/touch(start|end|cancel|move)/i);
    expect(css).not.toMatch(/touch(start|end|cancel|move)/i);
  });
});
