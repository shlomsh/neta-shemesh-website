/**
 * Slide pager (NS-48 preview, `?snap=slides`): the decision logic, free of DOM, timers and React so
 * it can be tested with plain numbers. `components/motion/SlidePager.tsx` is the thin effect that
 * feeds it (wheel events, keys, section tops) and animates to whatever it returns.
 *
 * The idea: one scroll gesture moves exactly one card, like a presentation. Three pure pieces:
 *
 * - `stepWheel`: a gesture state machine. The first wheel event of a gesture pages; everything
 *   until the gesture ends is swallowed. A gesture ends after QUIET_MS of silence, or when a
 *   deliberate new push shows up (a sharp rise after the momentum tail decayed, a reversal, or a
 *   discrete mouse notch once the slide has finished).
 * - `decidePage`: which card top to page to, or "scroll natively" while a card taller than the
 *   screen still has content past the viewport edge.
 * - `keyAction`: the keyboard map.
 */

/** Slide animation length (ms) for a one-card move. */
export const SLIDE_MS = 650;
/** Slide easing: cubic-bezier(.65, 0, .35, 1), an ease-in-out with a decided middle. */
export const SLIDE_BEZIER = [0.65, 0, 0.35, 1] as const;
/** Longest slide (Home / End across the whole page). */
export const SLIDE_MAX_MS = 1100;

/** A gesture ends after this much wheel silence (trackpad momentum sends a ~1 s decaying tail). */
export const QUIET_MS = 180;
/** Accumulated |deltaY| (px) a gesture needs before it pages: a brush of the pad does nothing. */
export const TRIGGER_PX = 6;
/** A wheel event with |deltaY| at least this, far above the decayed tail, can be a new deliberate push... */
export const RISE_ABS = 24;
/** ...when it is also at least this many times the smallest magnitude since the tail began decaying. */
export const RISE_FACTOR = 3;
/** A discrete mouse notch: at least this big and at least NOTCH_GAP_MS after the previous event. */
export const NOTCH_MIN = 40;
export const NOTCH_GAP_MS = 50;

/** Distance (px) to the card edge that counts as "at the edge". */
export const EDGE_PX = 4;
/** A card top within this fraction of the viewport (min NEAR_MIN_PX) of the scroll position counts as "the current card". */
export const NEAR_FRAC = 0.12;
export const NEAR_MIN_PX = 24;

/** Keyboard native step sizes (px) used to decide whether a key press would overshoot a tall card's edge. */
export const KEY_LINE_PX = 40;
export const KEY_PAGE_FRAC = 0.875;

export type Dir = 1 | -1;

// ─── easing and duration ───────────────────────────────────────────────────────────────────────────

/** CSS `cubic-bezier(x1, y1, x2, y2)` as a function of time (0..1) to progress (0..1). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number) => ((ay * s + by) * s + cy) * s;
  const sampleDX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(s) - x;
      if (Math.abs(err) < 1e-6) return sampleY(s);
      const d = sampleDX(s);
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }
    let lo = 0;
    let hi = 1;
    s = x;
    for (let i = 0; i < 24; i++) {
      const v = sampleX(s);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return sampleY(s);
  };
}

export const slideEase = cubicBezier(...SLIDE_BEZIER);

/**
 * Duration (ms) of a slide covering `distance` px on a `viewportHeight` screen: SLIDE_MS for about
 * one screen, shorter for a short hop (clamping to a tall card's edge), a little longer for many
 * cards at once (Home / End), never above SLIDE_MAX_MS.
 */
export function slideDuration(distance: number, viewportHeight: number): number {
  const screens = Math.abs(distance) / Math.max(1, viewportHeight);
  if (screens <= 1) return Math.round(SLIDE_MS * Math.min(1, Math.max(0.35, Math.sqrt(screens))));
  return Math.round(Math.min(SLIDE_MAX_MS, SLIDE_MS + (screens - 1) * 120));
}

/** Wheel delta in px: lines (Firefox mouse) and pages are converted. */
export function normalizeWheelDelta(deltaY: number, deltaMode: number, viewportHeight: number): number {
  if (deltaMode === 1) return deltaY * KEY_LINE_PX;
  if (deltaMode === 2) return deltaY * viewportHeight;
  return deltaY;
}

// ─── which card to go to ───────────────────────────────────────────────────────────────────────────

export interface PagerInput {
  /** current scroll position (window.scrollY), or the position an animation is heading to */
  scrollY: number;
  /** window.innerHeight */
  viewportHeight: number;
  /** document.documentElement.scrollHeight */
  documentHeight: number;
  /** Absolute top (px) of every card: the `main > section`s and the footer, in page order. */
  sectionTops: readonly number[];
}

export type PageDecision =
  /** Slide to this scroll position (a card top, clamped to the end of the page). */
  | { kind: 'page'; y: number }
  /** A card taller than the screen still has `room` px of content past the viewport edge in this direction: scroll natively; `edgeY` is the scroll position of that edge. */
  | { kind: 'native'; room: number; edgeY: number }
  /** Nothing in this direction (top or bottom of the page). */
  | { kind: 'none' };

const NONE: PageDecision = { kind: 'none' };

/**
 * Where does a page step in direction `dir` (1 = down, -1 = up) go?
 *
 * Down: the first card top further than `near` below the scroll position. If the card on screen
 * (the last top at or within `near` below the scroll position) is taller than the viewport and its
 * bottom edge is still below the viewport, scroll natively
 * (`native`, with the room left) and only page once the bottom edge is reached.
 *
 * Up: the last card top further than `near` above. If the card whose top is at or above the scroll
 * position is taller than the viewport and its top edge is still above the viewport, scroll
 * natively; otherwise page. Between two cards (the user ended there by other means) a step goes to
 * the adjacent card top in its direction.
 */
export function decidePage({ scrollY: y, viewportHeight: vh, documentHeight: dh, sectionTops: tops }: PagerInput, dir: Dir): PageDecision {
  if (tops.length === 0) return NONE;
  const maxY = Math.max(0, dh - vh);
  const near = Math.max(NEAR_MIN_PX, NEAR_FRAC * vh);

  if (dir === 1) {
    if (y >= maxY - EDGE_PX) return NONE;
    const next = tops.find((t) => t > y + near);
    if (next === undefined) return { kind: 'native', room: maxY - y, edgeY: maxY }; // inside the last card
    const cardTop = tops.filter((t) => t <= y + near).pop() ?? tops[0]; // the card on screen: its top is at or just below the scroll position
    const room = Math.min(next, dh) - (y + vh); // card content still below the viewport
    if (next - cardTop > vh + EDGE_PX && room > EDGE_PX) return { kind: 'native', room, edgeY: y + room }; // a card taller than the screen
    const target = Math.min(next, maxY);
    return target - y < 1 ? NONE : { kind: 'page', y: target };
  }

  if (y <= EDGE_PX) return NONE;
  let cardTop = tops[0];
  let cardEnd = dh;
  for (let i = 0; i < tops.length; i++) {
    if (tops[i] <= y + EDGE_PX) {
      cardTop = tops[i];
      cardEnd = tops[i + 1] ?? dh;
    }
  }
  if (cardEnd - cardTop > vh + EDGE_PX && y - cardTop > EDGE_PX) {
    return { kind: 'native', room: y - cardTop, edgeY: cardTop };
  }
  let prev = tops[0];
  for (const t of tops) if (t < y - near) prev = t;
  return y - prev < 1 ? NONE : { kind: 'page', y: Math.max(0, prev) };
}

/** First and last card tops for Home / End (the last one clamped to what can be scrolled to). */
export function endTarget({ viewportHeight: vh, documentHeight: dh, sectionTops: tops }: PagerInput, which: 'first' | 'last'): number {
  if (tops.length === 0) return 0;
  return which === 'first' ? Math.max(0, tops[0]) : Math.min(tops[tops.length - 1], Math.max(0, dh - vh));
}

// ─── keyboard ──────────────────────────────────────────────────────────────────────────────────────

export type KeyAction =
  | { kind: 'step'; dir: Dir; size: 'line' | 'page' }
  | { kind: 'jump'; to: 'first' | 'last' };

export interface KeyLike {
  key: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

/** ArrowDown / PageDown / Space next, ArrowUp / PageUp / Shift+Space previous, Home / End first / last. Anything with Ctrl, Meta or Alt, or any other key, is null. */
export function keyAction(e: KeyLike): KeyAction | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  switch (e.key) {
    case 'ArrowDown':
      return e.shiftKey ? null : { kind: 'step', dir: 1, size: 'line' };
    case 'ArrowUp':
      return e.shiftKey ? null : { kind: 'step', dir: -1, size: 'line' };
    case 'PageDown':
      return { kind: 'step', dir: 1, size: 'page' };
    case 'PageUp':
      return { kind: 'step', dir: -1, size: 'page' };
    case ' ':
    case 'Spacebar':
      return { kind: 'step', dir: e.shiftKey ? -1 : 1, size: 'page' };
    case 'Home':
      return e.shiftKey ? null : { kind: 'jump', to: 'first' };
    case 'End':
      return e.shiftKey ? null : { kind: 'jump', to: 'last' };
    default:
      return null;
  }
}

/**
 * A key press inside a tall card: let the browser scroll when its step fits in the room left,
 * otherwise clamp to the edge ourselves so the step never overshoots into the next card.
 */
export function keyInTallCard(room: number, size: 'line' | 'page', viewportHeight: number): 'native' | 'clamp' {
  const step = size === 'line' ? KEY_LINE_PX : KEY_PAGE_FRAC * viewportHeight;
  return room > step + EDGE_PX ? 'native' : 'clamp';
}

// ─── wheel gesture state machine ───────────────────────────────────────────────────────────────────

export interface GestureState {
  /** idle: between gestures; locked: this gesture already paged (or is waiting out a slide), swallow its tail; native: the gesture scrolls a tall card natively */
  phase: 'idle' | 'locked' | 'native';
  /** time (ms) of the previous wheel event */
  lastT: number;
  /** signed |deltaY| sum while idle (below TRIGGER_PX nothing happens) */
  acc: number;
  /** magnitude of the previous event, and whether the momentum already started to decay */
  lastMag: number;
  peaked: boolean;
  /** smallest magnitude since the decay began (or the latest magnitude while still ramping up) */
  minMag: number;
  lastSign: number;
}

export const initialGesture = (): GestureState => ({
  phase: 'idle',
  lastT: -Infinity,
  acc: 0,
  lastMag: 0,
  peaked: false,
  minMag: 0,
  lastSign: 0,
});

export interface WheelCtx {
  /** a slide (or any programmatic scroll of ours) is in flight */
  animating: boolean;
  /** what a page step in this direction would do right now */
  decide: (dir: Dir) => PageDecision;
}

export type WheelAction =
  | { type: 'native' } // do not touch the event: the browser scrolls
  | { type: 'swallow' } // preventDefault, do nothing else
  | { type: 'page'; y: number } // preventDefault, slide to y
  | { type: 'clamp'; y: number }; // preventDefault, move to the tall card's edge

/**
 * Feed one wheel event (`t` in ms, `dy` signed px) to the gesture. Returns the next state and what
 * to do with the event. See the file header for the model; summary of the rules:
 *
 * - idle: accumulate until TRIGGER_PX, then page once and lock. A tall card with room left in that
 *   direction starts a native gesture instead; a native event larger than the room left is
 *   clamped to the edge and locks.
 * - locked / native: everything is swallowed (locked) or passed (native) until QUIET_MS of silence,
 *   unless the event is a deliberate new push and no slide is in flight: a sharp rise after the
 *   tail decayed (>= RISE_ABS and RISE_FACTOR x the tail minimum), a reversal of at least RISE_ABS,
 *   or a discrete notch (>= NOTCH_MIN, >= NOTCH_GAP_MS after the previous event). A deliberate
 *   push is decided like the first event of a fresh gesture.
 */
export function stepWheel(prev: GestureState, ev: { t: number; dy: number }, ctx: WheelCtx): [GestureState, WheelAction] {
  const mag = Math.abs(ev.dy);
  if (mag < 0.5) return [prev, { type: prev.phase === 'native' ? 'native' : 'swallow' }];
  const dir: Dir = ev.dy > 0 ? 1 : -1;
  const gap = ev.t - prev.lastT;

  let s: GestureState = prev;
  if (s.phase !== 'idle' && gap > QUIET_MS) s = { ...s, phase: 'idle', acc: 0 };

  const lock = (acc = 0): GestureState => ({ ...s, phase: 'locked', lastT: ev.t, acc, lastMag: mag, peaked: false, minMag: mag, lastSign: dir });

  /** Decide the event as the start of a gesture (or a deliberate push), `accumulate` = idle accumulation. */
  const begin = (accumulate: boolean): [GestureState, WheelAction] => {
    if (ctx.animating) return [lock(), { type: 'swallow' }];
    const d = ctx.decide(dir);
    if (d.kind === 'none') return [{ ...s, phase: 'idle', lastT: ev.t, acc: 0 }, { type: 'native' }];
    if (d.kind === 'native') {
      if (mag > d.room) return [lock(), { type: 'clamp', y: d.edgeY }];
      return [{ ...lock(), phase: 'native' }, { type: 'native' }];
    }
    let acc = s.acc;
    if (accumulate) {
      acc = Math.sign(acc) === dir ? acc + ev.dy : ev.dy;
      if (Math.abs(acc) < TRIGGER_PX) return [{ ...s, lastT: ev.t, acc }, { type: 'swallow' }];
    }
    return [lock(), { type: 'page', y: d.y }];
  };

  if (s.phase === 'idle') return begin(true);

  // inside a gesture: is this a deliberate new push?
  const reversal = dir !== s.lastSign && mag >= RISE_ABS;
  const notch = gap >= NOTCH_GAP_MS && mag >= NOTCH_MIN;
  const rise = s.peaked && mag >= RISE_ABS && mag >= RISE_FACTOR * s.minMag;
  if (!ctx.animating && (reversal || notch || rise)) return begin(false);

  // part of the same gesture: track the momentum shape, then swallow / pass
  let { peaked, minMag } = s;
  if (!peaked) {
    if (mag < s.lastMag * 0.8) {
      peaked = true;
      minMag = mag;
    } else {
      minMag = mag;
    }
  } else {
    minMag = Math.min(minMag, mag);
  }
  const next: GestureState = { ...s, lastT: ev.t, lastMag: mag, peaked, minMag, lastSign: dir };

  if (s.phase === 'native') {
    const d = ctx.decide(dir);
    if (d.kind === 'native') return mag > d.room ? [{ ...next, phase: 'locked' }, { type: 'clamp', y: d.edgeY }] : [next, { type: 'native' }];
    if (d.kind === 'page') return [{ ...next, phase: 'locked' }, { type: 'swallow' }]; // reached the edge by itself: this gesture ends here
    return [next, { type: 'native' }];
  }
  return [next, { type: 'swallow' }];
}
