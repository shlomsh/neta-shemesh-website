/**
 * NS-13: RevealObserver arms the hidden state only after the first IntersectionObserver callback, marks
 * what is on screen `data-revealed`, and does nothing at all (everything stays visible) under reduced
 * motion, without IntersectionObserver, or inside a frame.
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { RevealObserver, amountFor } from '@/components/motion/RevealObserver';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
class FakeIO {
  static instances: FakeIO[] = [];
  observed = new Set<Element>();
  disconnected = false;
  constructor(public cb: Callback, public options: IntersectionObserverInit) {
    FakeIO.instances.push(this);
  }
  observe(el: Element) { this.observed.add(el); }
  unobserve(el: Element) { this.observed.delete(el); }
  disconnect() { this.disconnected = true; this.observed.clear(); }
  takeRecords() { return []; }
  fire(entries: Array<[Element, number, boolean?]>) {
    this.cb(entries.map(([target, ratio, isIntersecting]) => ({
      target, intersectionRatio: ratio, isIntersecting: isIntersecting ?? ratio > 0,
    })));
  }
}

const realIO = window.IntersectionObserver;
const realMatchMedia = window.matchMedia;
const root = document.documentElement;
const armed = () => root.hasAttribute('data-reveal-armed');

function setReduced(reduce: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: reduce && q.includes('reduce'), media: q, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function page() {
  return render(
    <>
      <ScrollReveal className="a"><p>a</p></ScrollReveal>
      <ScrollReveal className="b"><p>b</p></ScrollReveal>
      <ScrollReveal className="c"><p>c</p></ScrollReveal>
      <RevealObserver />
    </>,
  );
}
const els = (c: HTMLElement) => ({
  a: c.querySelector('.a')!, b: c.querySelector('.b')!, c: c.querySelector('.c')!,
});

beforeEach(() => {
  FakeIO.instances = [];
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeIO;
  setReduced(false);
});
afterEach(() => {
  cleanup();
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = realIO;
  window.matchMedia = realMatchMedia;
  delete root.dataset.revealArmed;
  vi.restoreAllMocks();
});

describe('RevealObserver', () => {
  it('renders nothing', () => {
    const { container } = render(<RevealObserver />);
    expect(container.innerHTML).toBe('');
  });

  it('uses ONE observer over the ScrollReveal elements only (the [data-reveal="io"] ones)', () => {
    const { container } = page();
    expect(FakeIO.instances).toHaveLength(1);
    const e = els(container);
    expect([...FakeIO.instances[0].observed]).toEqual([e.a, e.b, e.c]);
    expect(FakeIO.instances[0].options.threshold).toEqual(expect.arrayContaining([0, 0.05, 0.1, 0.15, 0.2]));
  });

  it('arms only after the first callback, revealing what is on screen first', () => {
    const { container } = page();
    const e = els(container);
    expect(armed()).toBe(false);
    act(() => FakeIO.instances[0].fire([[e.a, 1], [e.b, 0.3], [e.c, 0, false]]));
    expect(armed()).toBe(true);
    expect(e.a.hasAttribute('data-revealed')).toBe(true);
    expect(e.b.hasAttribute('data-revealed')).toBe(true); // a peeking element is not hidden by arming
    expect(e.c.hasAttribute('data-revealed')).toBe(false);
    expect(FakeIO.instances[0].observed.has(e.a)).toBe(false);
    expect(FakeIO.instances[0].observed.has(e.c)).toBe(true);
  });

  it('later intersections reveal once the amount is reached, then unobserve', () => {
    const { container } = page();
    const e = els(container);
    act(() => FakeIO.instances[0].fire([[e.a, 1], [e.b, 0, false], [e.c, 0, false]]));
    act(() => FakeIO.instances[0].fire([[e.b, 0.05]])); // below the 0.2 amount
    expect(e.b.hasAttribute('data-revealed')).toBe(false);
    act(() => FakeIO.instances[0].fire([[e.b, 0.2]]));
    expect(e.b.hasAttribute('data-revealed')).toBe(true);
    expect(FakeIO.instances[0].observed.has(e.b)).toBe(false);
    act(() => FakeIO.instances[0].fire([[e.c, 0, false]])); // leaving / not intersecting never reveals
    expect(e.c.hasAttribute('data-revealed')).toBe(false);
  });

  it('a tall element reveals at 90% of what a viewport can show, not at 20% of itself', () => {
    const { container } = page();
    const e = els(container);
    Object.defineProperty(e.c, 'offsetHeight', { value: 10 * window.innerHeight, configurable: true });
    act(() => FakeIO.instances[0].fire([[e.a, 1], [e.b, 1], [e.c, 0, false]]));
    act(() => FakeIO.instances[0].fire([[e.c, 0.05]]));
    expect(e.c.hasAttribute('data-revealed')).toBe(false);
    act(() => FakeIO.instances[0].fire([[e.c, 0.09]]));
    expect(e.c.hasAttribute('data-revealed')).toBe(true);
  });

  it('amountFor never exceeds 0.2, snaps down onto the observer ladder, and handles zero height', () => {
    const el = document.createElement('div');
    const h = (n: number) => Object.defineProperty(el, 'offsetHeight', { value: n, configurable: true });
    h(0); expect(amountFor(el, 800)).toBeCloseTo(0.2);
    h(100); expect(amountFor(el, 800)).toBeCloseTo(0.2);
    h(8000); expect(amountFor(el, 800)).toBeCloseTo(0.09); // 0.9/10 = 0.09
    h(5600); expect(amountFor(el, 800)).toBeCloseTo(0.12); // 0.9/7 = 0.1286 -> 0.12
    h(1e6); expect(amountFor(el, 800)).toBe(0);
  });

  it('does nothing under prefers-reduced-motion: reduce', () => {
    setReduced(true);
    const { container } = page();
    expect(FakeIO.instances).toHaveLength(0);
    expect(armed()).toBe(false);
    expect(container.querySelectorAll('[data-revealed]')).toHaveLength(0);
  });

  it('does nothing without IntersectionObserver', () => {
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
    page();
    expect(armed()).toBe(false);
  });

  it('does nothing inside an iframe, nor when window.top throws (sandboxed frame)', () => {
    const top = vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window & typeof globalThis);
    page();
    expect(FakeIO.instances).toHaveLength(0);
    cleanup();
    top.mockImplementation(() => { throw new DOMException('blocked', 'SecurityError'); });
    page();
    expect(FakeIO.instances).toHaveLength(0);
    expect(armed()).toBe(false);
  });

  it('never arms when the first callback does not fire', () => {
    page();
    expect(armed()).toBe(false);
  });

  it('disarms and disconnects on unmount', () => {
    const { container, unmount } = page();
    act(() => FakeIO.instances[0].fire([[els(container).a, 1]]));
    expect(armed()).toBe(true);
    unmount();
    expect(armed()).toBe(false);
    expect(FakeIO.instances[0].disconnected).toBe(true);
  });
});

/** The `?reveal=` previews: opt-in by query only, the default is untouched. */
describe('RevealObserver ?reveal= previews', () => {
  const setQuery = (q: string) => window.history.replaceState({}, '', `/${q}`);
  const mode = () => root.dataset.revealMode;
  afterEach(() => {
    setQuery('');
    delete root.dataset.revealMode;
  });

  function desktopMatchMedia() {
    window.matchMedia = ((q: string) => ({
      matches: q.includes('min-width: 1024px'), media: q, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }

  it('without the query (or with an unknown value) nothing changes: no mode, no rootMargin, the 0.2 ladder', () => {
    setQuery('?reveal=nonsense');
    page();
    expect(mode()).toBeUndefined();
    expect(FakeIO.instances[0].options.rootMargin).toBeUndefined();
    expect(Math.max(...(FakeIO.instances[0].options.threshold as number[]))).toBeCloseTo(0.2);
  });

  it('late: sets html[data-reveal-mode], observes a viewport shrunk at the bottom, and needs 0.5 of the element', () => {
    setQuery('?reveal=late');
    const { container } = page();
    const e = els(container);
    expect(mode()).toBe('late');
    expect(FakeIO.instances[0].options.rootMargin).toBe('0px 0px -25% 0px');
    expect(Math.max(...(FakeIO.instances[0].options.threshold as number[]))).toBeCloseTo(0.5);
    act(() => FakeIO.instances[0].fire([[e.a, 0, false], [e.b, 0, false], [e.c, 0, false]]));
    expect(armed()).toBe(true);
    act(() => FakeIO.instances[0].fire([[e.b, 0.4]]));
    expect(e.b.hasAttribute('data-revealed')).toBe(false);
    act(() => FakeIO.instances[0].fire([[e.b, 0.5]]));
    expect(e.b.hasAttribute('data-revealed')).toBe(true);
  });

  it('late: an element parked in the bottom strip (never intersecting the shrunk viewport) is revealed once the scroll is idle', () => {
    vi.useFakeTimers();
    try {
      setQuery('?reveal=late');
      const { container } = page();
      const e = els(container);
      Object.defineProperty(e.c, 'offsetHeight', { value: 100, configurable: true });
      let top = window.innerHeight + 10; // below the fold when the observer arms
      e.c.getBoundingClientRect = () => ({ top, bottom: top + 100, height: 100 }) as DOMRect;
      act(() => FakeIO.instances[0].fire([[e.a, 0, false], [e.b, 0, false], [e.c, 0, false]]));
      top = window.innerHeight - 60; // scrolled so 60% of it is in the bottom strip, where the shrunk viewport never sees it
      act(() => { window.dispatchEvent(new Event('scroll')); });
      expect(e.c.hasAttribute('data-revealed')).toBe(false);
      act(() => { window.dispatchEvent(new Event('scrollend')); });
      expect(e.c.hasAttribute('data-revealed')).toBe(true); // 60% of it is on screen, above the default 0.2
      expect(e.a.hasAttribute('data-revealed')).toBe(false); // off screen: still waiting
    } finally {
      vi.useRealTimers();
    }
  });

  it('settle (desktop with the card snap): holds reveals until scrollend, then reveals in document order, one stagger step apart', () => {
    setQuery('?reveal=settle');
    desktopMatchMedia();
    const main = document.createElement('main');
    main.setAttribute('data-snap-cards', '');
    document.body.appendChild(main);
    try {
      const { container } = render(
        <>
          <ScrollReveal className="a"><p>a</p></ScrollReveal>
          <ScrollReveal className="b"><p>b</p></ScrollReveal>
          <RevealObserver />
        </>,
        { container: main },
      );
      const a = container.querySelector('.a')!;
      const b = container.querySelector('.b')!;
      expect(mode()).toBe('settle');
      expect(FakeIO.instances[0].options.rootMargin).toBeUndefined();
      act(() => FakeIO.instances[0].fire([[a, 0, false], [b, 0, false]]));
      act(() => { window.dispatchEvent(new Event('scroll')); });
      act(() => FakeIO.instances[0].fire([[b, 0.5], [a, 0.5]])); // reported out of order on purpose
      expect(a.hasAttribute('data-revealed')).toBe(false);
      expect(b.hasAttribute('data-revealed')).toBe(false);
      act(() => { window.dispatchEvent(new Event('scrollend')); });
      expect(a.hasAttribute('data-revealed') && b.hasAttribute('data-revealed')).toBe(true);
      expect((a as HTMLElement).style.getPropertyValue('--reveal-delay')).toBe('0s');
      expect((b as HTMLElement).style.getPropertyValue('--reveal-delay')).toBe('0.12s');
    } finally {
      main.remove();
    }
  });

  it('settle on a phone behaves as late', () => {
    setQuery('?reveal=settle');
    page();
    expect(mode()).toBe('settle');
    expect(FakeIO.instances[0].options.rootMargin).toBe('0px 0px -25% 0px');
  });

  it('under prefers-reduced-motion the previews do nothing either', () => {
    setQuery('?reveal=late');
    setReduced(true);
    page();
    expect(mode()).toBeUndefined();
    expect(FakeIO.instances).toHaveLength(0);
  });

  it('unmount removes the mode', () => {
    setQuery('?reveal=scale');
    const { container, unmount } = page();
    act(() => FakeIO.instances[0].fire([[els(container).a, 1]]));
    expect(mode()).toBe('scale');
    unmount();
    expect(mode()).toBeUndefined();
  });
});

