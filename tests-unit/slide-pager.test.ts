// @vitest-environment node
/**
 * The pure slide-pager logic (NS-48, lib/slide-pager.ts): gesture-end detection over sample wheel
 * streams, target choice including tall-card edges, key mapping, easing and duration.
 */
import { describe, expect, it } from 'vitest';
import {
  EDGE_PX,
  QUIET_MS,
  SLIDE_MS,
  SLIDE_MAX_MS,
  cubicBezier,
  decidePage,
  endTarget,
  initialGesture,
  keyAction,
  keyInTallCard,
  normalizeWheelDelta,
  slideDuration,
  slideEase,
  stepWheel,
  type PageDecision,
  type PagerInput,
} from '@/lib/slide-pager';

const VH = 900;
/** twelve contiguous one-screen cards, doc 10800 high */
const tops12 = Array.from({ length: 12 }, (_, i) => i * VH);
const page = (scrollY: number, over: Partial<PagerInput> = {}): PagerInput => ({
  scrollY,
  viewportHeight: VH,
  documentHeight: 12 * VH,
  sectionTops: tops12,
  ...over,
});

// ─── a tiny world: stream of wheel events -> pages, with a slide that takes SLIDE_MS ───────────────

interface Ev {
  t: number;
  dy: number;
}

/** Decaying trackpad stream: `start` px, 16 ms apart, exponential decay to about 2 px at `durationMs`. */
function trackpad(start: number, t0 = 0, durationMs = 1000, sign = 1): Ev[] {
  const tau = durationMs / Math.log(start / 2);
  const out: Ev[] = [];
  for (let t = 0; t <= durationMs; t += 16) out.push({ t: t0 + t, dy: sign * Math.max(1, Math.round(start * Math.exp(-t / tau))) });
  return out;
}
/** Real trackpads ramp up before they decay: a few growing events, then the decay. */
function flick(peak: number, t0 = 0, durationMs = 1000, sign = 1): Ev[] {
  const ramp = [0.05, 0.15, 0.4, 0.75].map((f, i) => ({ t: t0 + i * 16, dy: sign * Math.max(1, Math.round(peak * f)) }));
  return [...ramp, ...trackpad(peak, t0 + 64, durationMs, sign)];
}
const notches = (n: number, gapMs: number, t0 = 0, dy = 100): Ev[] => Array.from({ length: n }, (_, i) => ({ t: t0 + i * gapMs, dy }));

/** Runs a stream; returns the pages it triggered (time and target) and every action. */
function run(events: Ev[], decide: (dir: 1 | -1) => PageDecision = () => ({ kind: 'page', y: 900 })) {
  let g = initialGesture();
  let animUntil = -Infinity;
  const pages: Array<{ t: number; y: number }> = [];
  const actions: string[] = [];
  for (const ev of [...events].sort((a, b) => a.t - b.t)) {
    const [next, action] = stepWheel(g, ev, { animating: ev.t < animUntil, decide });
    g = next;
    actions.push(action.type);
    if (action.type === 'page') {
      pages.push({ t: ev.t, y: action.y });
      animUntil = ev.t + SLIDE_MS;
    }
  }
  return { pages, actions, state: g };
}

describe('stepWheel: one gesture moves exactly one card', () => {
  it.each([40, 90, 150, 300])('a decaying trackpad flick starting at %i px pages once', (peak) => {
    expect(run(flick(peak)).pages).toHaveLength(1);
  });

  it('a stream that decays from the very first event (no ramp) also pages once', () => {
    expect(run(trackpad(150)).pages).toHaveLength(1);
    expect(run(trackpad(40, 0, 1500)).pages).toHaveLength(1);
  });

  it('a long slow momentum tail (2 s) still pages once', () => {
    expect(run(flick(200, 0, 2000)).pages).toHaveLength(1);
  });

  it('everything after the first page is swallowed, nothing leaks to native scroll', () => {
    const { actions } = run(flick(150));
    expect(actions[actions.findIndex((a) => a === 'page')]).toBe('page');
    expect(actions.filter((a) => a === 'native')).toEqual([]);
  });

  it('a brush of the pad below the trigger pages nothing, but accumulates', () => {
    expect(run([{ t: 0, dy: 1 }, { t: 16, dy: 2 }, { t: 32, dy: 1 }]).pages).toEqual([]);
    expect(run([{ t: 0, dy: 3 }, { t: 16, dy: 3 }, { t: 32, dy: 3 }]).pages).toHaveLength(1);
  });

  it('sub-pixel noise events are ignored', () => {
    const { pages, state } = run([{ t: 0, dy: 0 }, { t: 5, dy: 0.2 }]);
    expect(pages).toEqual([]);
    expect(state.phase).toBe('idle');
  });

  it('a second flick after the first one ended (quiet gap) pages again, in its own direction', () => {
    const first = flick(150, 0);
    const lastT = first[first.length - 1].t;
    const second = flick(150, lastT + QUIET_MS + 50, 1000, -1);
    const { pages } = run([...first, ...second], (dir) => ({ kind: 'page', y: dir * 900 }));
    expect(pages.map((p) => p.y)).toEqual([900, -900]);
  });

  it('a gap longer than QUIET_MS inside one stream ends the gesture (a stalled tail counts as a new one)', () => {
    const { pages } = run([{ t: 0, dy: 100 }, { t: QUIET_MS + 1000, dy: 100 }]);
    expect(pages).toHaveLength(2);
  });

  it('events 60 ms apart with small deltas (a slow drag) stay one gesture', () => {
    const slow = Array.from({ length: 30 }, (_, i) => ({ t: i * 60, dy: 8 }));
    expect(run(slow).pages).toHaveLength(1);
  });
});

describe('stepWheel: a deliberate new push ends the gesture', () => {
  it('a sharp rise after the momentum tail decayed pages again, once the slide is done', () => {
    // flick ends decaying near 3 px by ~700 ms; at 760 ms the user pushes again with 60 px
    const first = flick(150, 0, 700);
    const lastT = first[first.length - 1].t;
    const tail = { t: lastT + 16, dy: 3 };
    const push = trackpad(60, lastT + 100, 600);
    const { pages } = run([...first, tail, ...push]);
    expect(pages).toHaveLength(2);
    expect(pages[1].t).toBeGreaterThan(pages[0].t + SLIDE_MS);
  });

  it('...but a rise while the slide is still in flight is ignored (one card per slide)', () => {
    const first = flick(150, 0, 700);
    const push = { t: 300, dy: 80 }; // in the middle of the slide
    const { pages } = run([...first, push]);
    expect(pages).toHaveLength(1);
  });

  it('jitter inside a decaying tail is not a rise', () => {
    const s = flick(150, 0, 1000).map((e, i) => (i % 5 === 0 ? { ...e, dy: e.dy + 2 } : e));
    expect(run(s).pages).toHaveLength(1);
  });

  it('a reversal of at least RISE_ABS after the slide pages the other way', () => {
    const first = flick(120, 0, 900);
    const back = [{ t: 800, dy: -40 }, { t: 816, dy: -50 }];
    const { pages } = run([...first, ...back], (dir) => ({ kind: 'page', y: dir * 900 }));
    expect(pages.map((p) => p.y)).toEqual([900, -900]);
  });

  it('a small opposite wobble inside the tail does not', () => {
    const first = flick(120, 0, 900);
    const wobble = [{ t: 816, dy: -6 }];
    expect(run([...first, ...wobble]).pages).toHaveLength(1);
  });
});

describe('stepWheel: mouse notches', () => {
  it('one notch moves one card', () => {
    expect(run(notches(1, 0)).pages).toHaveLength(1);
  });

  it('three notches 80 ms apart move one card (the others land inside the slide)', () => {
    expect(run(notches(3, 80)).pages).toHaveLength(1);
  });

  it('notches 100 ms apart for 3 s move one card per finished slide, never two at once', () => {
    const { pages } = run(notches(30, 100));
    expect(pages.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < pages.length; i++) expect(pages[i].t - pages[i - 1].t).toBeGreaterThanOrEqual(SLIDE_MS);
  });

  it('notches a second apart each page', () => {
    expect(run(notches(4, 1000)).pages).toHaveLength(4);
  });

  it('a Firefox line-mode notch (3 lines) counts as 120 px', () => {
    expect(normalizeWheelDelta(3, 1, 900)).toBe(120);
    expect(normalizeWheelDelta(1, 2, 900)).toBe(900);
    expect(normalizeWheelDelta(100, 0, 900)).toBe(100);
  });
});

describe('stepWheel: tall cards scroll natively, then page at the edge', () => {
  const tall = (room: number): ((d: 1 | -1) => PageDecision) => () => ({ kind: 'native', room, edgeY: 1000 });

  it('a gesture inside a tall card with room left is native end to end (nothing swallowed)', () => {
    const { actions, pages } = run(flick(150), tall(100000));
    expect(pages).toEqual([]);
    expect(new Set(actions)).toEqual(new Set(['native']));
  });

  it('an event larger than the room left is clamped to the edge, and the rest of the gesture is swallowed', () => {
    const { actions } = run([{ t: 0, dy: 3 }, { t: 16, dy: 10 }, { t: 32, dy: 60 }, { t: 48, dy: 50 }, { t: 64, dy: 40 }], () => ({ kind: 'native', room: 20, edgeY: 777 }));
    expect(actions).toEqual(['native', 'native', 'clamp', 'swallow', 'swallow']);
  });

  it('the clamp action carries the edge position', () => {
    let g = initialGesture();
    const [, a] = stepWheel(g, { t: 0, dy: 50 }, { animating: false, decide: () => ({ kind: 'native', room: 20, edgeY: 777 }) });
    expect(a).toEqual({ type: 'clamp', y: 777 });
    g = initialGesture();
  });

  it('a native gesture that reaches the edge by itself ends there (no paging inside the same gesture)', () => {
    let room = 100;
    const decide = (): PageDecision => (room > EDGE_PX ? { kind: 'native', room, edgeY: 0 } : { kind: 'page', y: 900 });
    let g = initialGesture();
    const out: string[] = [];
    for (const [i, dy] of [20, 20, 20, 20, 20, 20].entries()) {
      room = 100 - (i + 1) * 20 + 20; // after each event the card has scrolled by dy
      const [n, a] = stepWheel(g, { t: i * 16, dy }, { animating: false, decide });
      g = n;
      out.push(a.type);
    }
    expect(out).not.toContain('page');
    expect(out[out.length - 1]).toBe('swallow');
  });

  it('after a quiet gap a new gesture at the edge pages', () => {
    const decide = (): PageDecision => ({ kind: 'page', y: 1800 });
    const { pages } = run([{ t: 0, dy: 50 }], decide);
    expect(pages).toHaveLength(1);
  });

  it('a mouse notch inside a native gesture, once the card reached its edge, pages', () => {
    let atEdge = false;
    const decide = (): PageDecision => (atEdge ? { kind: 'page', y: 1800 } : { kind: 'native', room: 5000, edgeY: 5000 });
    let g = initialGesture();
    const acts: string[] = [];
    for (const [i, t] of [0, 80, 160].entries()) {
      atEdge = i === 2;
      const [n, a] = stepWheel(g, { t, dy: 100 }, { animating: false, decide });
      g = n;
      acts.push(a.type);
    }
    expect(acts).toEqual(['native', 'native', 'page']);
  });

  it('where the page ends, events pass through and nothing locks', () => {
    const { actions, state } = run(flick(150), () => ({ kind: 'none' }));
    expect(new Set(actions)).toEqual(new Set(['native']));
    expect(state.phase).toBe('idle');
  });

  it('an animation in flight (key slide, anchor) swallows a fresh wheel gesture', () => {
    const [, a] = stepWheel(initialGesture(), { t: 0, dy: 120 }, { animating: true, decide: () => ({ kind: 'page', y: 900 }) });
    expect(a).toEqual({ type: 'swallow' });
  });
});

describe('decidePage: target choice', () => {
  it('at a card top, down goes to the next top and up to the previous', () => {
    expect(decidePage(page(1800), 1)).toEqual({ kind: 'page', y: 2700 });
    expect(decidePage(page(1800), -1)).toEqual({ kind: 'page', y: 900 });
  });

  it('at the very top there is nothing above; at the very bottom nothing below', () => {
    expect(decidePage(page(0), -1)).toEqual({ kind: 'none' });
    expect(decidePage(page(12 * VH - VH), 1)).toEqual({ kind: 'none' });
  });

  it('the last page step lands on the footer top (and is clamped to the end of the page)', () => {
    expect(decidePage(page(10 * VH), 1)).toEqual({ kind: 'page', y: 11 * VH });
    // a footer shorter than the viewport: the top cannot be reached, clamp to the end
    expect(decidePage(page(0, { documentHeight: VH + 600, sectionTops: [0, VH] }), 1)).toEqual({ kind: 'page', y: 600 });
  });

  it('a position a little before a top (an anchor landing with an offset) counts as that card: down goes past it', () => {
    expect(decidePage(page(1800 - 60), 1)).toEqual({ kind: 'page', y: 2700 });
    expect(decidePage(page(1800 + 40), -1)).toEqual({ kind: 'page', y: 900 });
  });

  it('between two cards, a step goes to the adjacent top in its direction', () => {
    expect(decidePage(page(1800 + 300), 1)).toEqual({ kind: 'page', y: 2700 });
    expect(decidePage(page(1800 + 300), -1)).toEqual({ kind: 'page', y: 1800 });
    expect(decidePage(page(1800 + 600), 1)).toEqual({ kind: 'page', y: 2700 });
    expect(decidePage(page(1800 + 600), -1)).toEqual({ kind: 'page', y: 1800 });
  });

  describe('tall cards (viewport 700, cards 720)', () => {
    const vh = 700;
    const tops = Array.from({ length: 6 }, (_, i) => i * 720);
    const at = (y: number): PagerInput => ({ scrollY: y, viewportHeight: vh, documentHeight: 6 * 720, sectionTops: tops });

    it('down from a card top scrolls natively for exactly the 20 px that are below the viewport, then pages', () => {
      expect(decidePage(at(720), 1)).toEqual({ kind: 'native', room: 20, edgeY: 740 });
      expect(decidePage(at(740), 1)).toEqual({ kind: 'page', y: 1440 });
    });

    it('up from the bottom edge scrolls natively to the card top, then pages to the previous top', () => {
      expect(decidePage(at(740), -1)).toEqual({ kind: 'native', room: 20, edgeY: 720 });
      expect(decidePage(at(720), -1)).toEqual({ kind: 'page', y: 0 });
    });

    it('a very tall card (2000 px) is native until its bottom edge, in both directions', () => {
      const t: PagerInput = { scrollY: 720, viewportHeight: vh, documentHeight: 720 + 2000 + 720, sectionTops: [0, 720, 2720] };
      expect(decidePage(t, 1)).toEqual({ kind: 'native', room: 2000 - vh, edgeY: 720 + 2000 - vh });
      expect(decidePage({ ...t, scrollY: 1500 }, 1)).toMatchObject({ kind: 'native', room: 2720 - 700 - 1500 });
      expect(decidePage({ ...t, scrollY: 2720 - vh }, 1)).toEqual({ kind: 'page', y: 2720 });
      expect(decidePage({ ...t, scrollY: 1500 }, -1)).toEqual({ kind: 'native', room: 1500 - 720, edgeY: 720 });
      expect(decidePage({ ...t, scrollY: 720 }, -1)).toEqual({ kind: 'page', y: 0 });
    });

    it('inside the last, taller card the page scrolls natively to the end', () => {
      const t: PagerInput = { scrollY: 1000, viewportHeight: vh, documentHeight: 3000, sectionTops: [0, 720, 1000] };
      expect(decidePage(t, 1)).toEqual({ kind: 'native', room: 3000 - vh - 1000, edgeY: 3000 - vh });
    });
  });

  it('endTarget: Home is the first top, End the last top clamped to what can be scrolled', () => {
    expect(endTarget(page(3000), 'first')).toBe(0);
    expect(endTarget(page(3000), 'last')).toBe(11 * VH);
    expect(endTarget(page(0, { documentHeight: VH + 600, sectionTops: [0, VH] }), 'last')).toBe(600);
  });
});

describe('keyAction', () => {
  it.each([
    [{ key: 'ArrowDown' }, { kind: 'step', dir: 1, size: 'line' }],
    [{ key: 'PageDown' }, { kind: 'step', dir: 1, size: 'page' }],
    [{ key: ' ' }, { kind: 'step', dir: 1, size: 'page' }],
    [{ key: 'ArrowUp' }, { kind: 'step', dir: -1, size: 'line' }],
    [{ key: 'PageUp' }, { kind: 'step', dir: -1, size: 'page' }],
    [{ key: ' ', shiftKey: true }, { kind: 'step', dir: -1, size: 'page' }],
    [{ key: 'Home' }, { kind: 'jump', to: 'first' }],
    [{ key: 'End' }, { kind: 'jump', to: 'last' }],
  ])('%j', (key, want) => expect(keyAction(key)).toEqual(want));

  it('ignores other keys and anything with Ctrl, Meta or Alt (browser shortcuts)', () => {
    for (const k of ['a', 'Enter', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight']) expect(keyAction({ key: k })).toBeNull();
    for (const mod of ['ctrlKey', 'metaKey', 'altKey'] as const) expect(keyAction({ key: 'ArrowDown', [mod]: true })).toBeNull();
    expect(keyAction({ key: 'ArrowDown', shiftKey: true })).toBeNull(); // extends a selection
  });

  it('inside a tall card a key scrolls natively only when its step fits in the room left', () => {
    expect(keyInTallCard(500, 'line', 900)).toBe('native');
    expect(keyInTallCard(20, 'line', 900)).toBe('clamp');
    expect(keyInTallCard(500, 'page', 900)).toBe('clamp');
    expect(keyInTallCard(2000, 'page', 900)).toBe('native');
  });
});

describe('easing and duration', () => {
  it('cubic-bezier(.5, 0, .2, 1): 0 at 0, 1 at 1, starts gently, is well ahead of linear mid-way, lands softly, monotonic', () => {
    expect(slideEase(0)).toBe(0);
    expect(slideEase(1)).toBe(1);
    expect(slideEase(0.1)).toBeLessThan(0.05);
    expect(slideEase(0.1)).toBeGreaterThan(0.005);
    expect(slideEase(0.5)).toBeGreaterThan(0.6);
    expect(slideEase(0.95)).toBeGreaterThan(0.98);
    expect(slideEase(0.95)).toBeLessThan(1);
    let prev = 0;
    for (let i = 1; i <= 100; i++) {
      const v = slideEase(i / 100);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('cubicBezier matches the CSS keyword ease-in-out at a known point', () => {
    expect(cubicBezier(0.42, 0, 0.58, 1)(0.5)).toBeCloseTo(0.5, 3);
    expect(cubicBezier(0, 0, 1, 1)(0.3)).toBeCloseTo(0.3, 3); // linear
  });

  it('duration: SLIDE_MS for a screen, shorter for a hop, longer for a jump, capped', () => {
    expect(slideDuration(900, 900)).toBe(SLIDE_MS);
    expect(slideDuration(-900, 900)).toBe(SLIDE_MS);
    expect(slideDuration(20, 700)).toBeLessThan(SLIDE_MS / 2);
    expect(slideDuration(20, 700)).toBeGreaterThan(100);
    expect(slideDuration(5 * 900, 900)).toBeGreaterThan(SLIDE_MS);
    expect(slideDuration(100 * 900, 900)).toBe(SLIDE_MAX_MS);
  });
});
