/**
 * The v2 engine wiring (jsdom, fake timers): it feeds the net scroll of the gesture into
 * pickSnapTargetV2 and settles after V2_SETTLE_MS. Decision tables live in soft-snap.test.ts.
 * Page: viewport 900, section tops 0 / 2000 / 4000, a long document.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { SoftSnapEngine } from '@/components/motion/SoftSnapEngine';

const TOPS = [0, 2000, 4000];
let scrollTo: ReturnType<typeof vi.fn>;
const originalScrollTo = window.scrollTo;

function mount(mode: 'v1' | 'v2') {
  for (const top of TOPS) {
    const s = document.createElement('section');
    s.getBoundingClientRect = () => ({ top: top - window.scrollY, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
    document.querySelector('main')!.appendChild(s);
  }
  return render(<SoftSnapEngine mode={mode} />);
}

/** Scroll in steps of `step` px, 16ms apart, from the current position to `to`. */
async function scrollBy(to: number, step = 40) {
  while (window.scrollY !== to) {
    const dir = Math.sign(to - window.scrollY);
    window.scrollY = dir > 0 ? Math.min(to, window.scrollY + step) : Math.max(to, window.scrollY - step);
    window.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(16);
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<main></main>';
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 1000 });
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 20000 });
  scrollTo = vi.fn();
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.scrollTo = originalScrollTo;
});

describe('SoftSnapEngine mode v2', () => {
  it('a tiny nudge (60px) next to a top does not glide', async () => {
    window.scrollY = 1880;
    mount('v2');
    await vi.advanceTimersByTimeAsync(2000); // startup ignore
    await scrollBy(1940);
    await vi.advanceTimersByTimeAsync(600);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('a deliberate downward gesture that stops just short of a top glides forward to it', async () => {
    mount('v2');
    await vi.advanceTimersByTimeAsync(2000);
    await scrollBy(1850); // +850 from 1000, 150 short of 2000
    await vi.advanceTimersByTimeAsync(150);
    expect(scrollTo, 'must wait for the settle time').not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(700);
    expect(scrollTo).toHaveBeenCalled();
    const last = scrollTo.mock.calls.at(-1)!;
    expect(last[1]).toBe(2000);
    expect(scrollTo.mock.calls.every(([, y]) => (y as number) >= 1850)).toBe(true); // never backward
  });

  it('overshooting a top by 150px on a downward gesture does not pull back', async () => {
    mount('v2');
    await vi.advanceTimersByTimeAsync(2000);
    await scrollBy(2150);
    await vi.advanceTimersByTimeAsync(1000);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('the same overshoot DOES pull back in v1 (control)', async () => {
    mount('v1');
    await vi.advanceTimersByTimeAsync(2000);
    await scrollBy(2150);
    await vi.advanceTimersByTimeAsync(1000);
    expect(scrollTo).toHaveBeenCalled();
  });

  it('a wheel event cancels a running glide at once', async () => {
    mount('v2');
    await vi.advanceTimersByTimeAsync(2000);
    await scrollBy(1850);
    await vi.advanceTimersByTimeAsync(300); // settle fired, glide running
    const calls = scrollTo.mock.calls.length;
    expect(calls).toBeGreaterThan(0);
    window.dispatchEvent(new Event('wheel'));
    await vi.advanceTimersByTimeAsync(600);
    expect(scrollTo.mock.calls.length).toBe(calls);
  });
});
