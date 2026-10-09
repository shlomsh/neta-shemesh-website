'use client';

import { useEffect } from 'react';
import {
  initialGesture,
  decidePage,
  endTarget,
  keyAction,
  keyInTallCard,
  normalizeWheelDelta,
  slideDuration,
  slideEase,
  stepWheel,
  type Dir,
  type GestureState,
  type PagerInput,
} from '@/lib/slide-pager';

/** True while the mobile menu overlay is open: `useInertBackground` marks <main> inert, `useBodyScrollLock` hides body overflow. */
const isMenuOpen = () =>
  document.querySelector('main[inert]') !== null || document.body.style.overflow === 'hidden';

/** Key events dispatched on `window` itself have no element target. */
const asElement = (t: EventTarget | null): Element | null => (t instanceof Element ? t : null);

const isTyping = (el: Element | null) => {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable;
};

/** Space activates these when focused; the pager must not take it. */
const isPressable = (el: Element | null) =>
  !!el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SUMMARY' || el.getAttribute('role') === 'button');

/** An element under the pointer (below <main>) that can still scroll by itself in `dir`: a map, a textarea, an overflow box. */
function nestedScrollerCanScroll(from: EventTarget | null, dir: Dir): boolean {
  for (let el = from instanceof Element ? from : null; el && el !== document.documentElement; el = el.parentElement) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
      if (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
    }
  }
  return false;
}

/**
 * Slide pager (`?snap=slides`, NS-48 preview): one scroll gesture moves exactly one card.
 *
 * Wheel and trackpad: the first event of a gesture slides to the next / previous card top
 * (`pageTo`), every later event of that gesture is swallowed (`preventDefault`) until the gesture
 * ends. A card taller than the screen scrolls natively until its edge. Keys: arrows, PageUp/Down,
 * Space, Home, End. Anchor links, scrollbar drags, find-in-page and `scrollIntoView` are never
 * fought: any scroll we did not make cancels a slide in flight, and there is no settle snap.
 *
 * Loaded only by the `SoftSnap` gate (desktop width, fine pointer, no reduced motion), so this file
 * needs no media checks and has no touch handling. The pure decisions live in `@/lib/slide-pager`.
 */
export function SlidePager() {
  useEffect(() => {
    const root = document.documentElement;
    let gesture: GestureState = initialGesture();
    let anim: { from: number; to: number; start: number; dur: number } | null = null;
    let rafId = 0;
    let lastOwnY = 0;
    let prevScrollBehavior = '';

    const measure = (y: number): PagerInput => ({
      scrollY: y,
      viewportHeight: window.innerHeight,
      documentHeight: root.scrollHeight,
      sectionTops: Array.from(document.querySelectorAll<HTMLElement>('main > section, main > footer'), (s) => s.getBoundingClientRect().top + window.scrollY),
    });

    const finish = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (anim) {
        root.style.scrollBehavior = prevScrollBehavior;
        anim = null;
      }
    };

    const tick = (now: number) => {
      if (!anim) return;
      if (anim.start < 0) anim.start = now;
      const t = Math.min(1, (now - anim.start) / anim.dur);
      const y = anim.from + (anim.to - anim.from) * slideEase(t);
      lastOwnY = y;
      window.scrollTo(0, y);
      if (t < 1) rafId = requestAnimationFrame(tick);
      else {
        rafId = 0;
        finish();
      }
    };

    /** Slide to `y`. A slide already in flight is replaced (keys retarget it). */
    const pageTo = (y: number) => {
      const from = window.scrollY;
      if (Math.abs(y - from) < 1) return;
      if (rafId) cancelAnimationFrame(rafId);
      if (!anim) {
        prevScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
      }
      anim = { from, to: y, start: -1, dur: slideDuration(y - from, window.innerHeight) };
      rafId = requestAnimationFrame(tick);
    };

    // ── wheel / trackpad ──
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return; // pinch zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal
      if (isMenuOpen()) return;
      const dy = normalizeWheelDelta(e.deltaY, e.deltaMode, window.innerHeight);
      if (dy === 0) return;
      if (nestedScrollerCanScroll(e.target, dy > 0 ? 1 : -1)) return;
      const [next, action] = stepWheel(gesture, { t: e.timeStamp, dy }, {
        animating: anim !== null,
        decide: (dir) => decidePage(measure(window.scrollY), dir),
      });
      gesture = next;
      switch (action.type) {
        case 'native':
          return;
        case 'swallow':
          e.preventDefault();
          return;
        case 'page':
        case 'clamp':
          e.preventDefault();
          pageTo(action.y);
          return;
      }
    };

    // ── keyboard ──
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isMenuOpen() || isTyping(document.activeElement) || isTyping(asElement(e.target))) return;
      const action = keyAction(e);
      if (!action) return;
      if ((e.key === ' ' || e.key === 'Spacebar') && (isPressable(document.activeElement) || isPressable(asElement(e.target)))) return;
      if (e.repeat && anim) {
        e.preventDefault(); // holding a key must not run away through the deck
        return;
      }
      const pos = anim ? anim.to : window.scrollY; // pressing again mid-slide retargets from where it is heading
      const input = measure(pos);
      if (action.kind === 'jump') {
        e.preventDefault();
        pageTo(endTarget(input, action.to));
        return;
      }
      const d = decidePage(input, action.dir);
      if (d.kind === 'none') return;
      if (d.kind === 'native') {
        if (anim === null && keyInTallCard(d.room, action.size, window.innerHeight) === 'native') return;
        e.preventDefault();
        pageTo(d.edgeY);
        return;
      }
      e.preventDefault();
      pageTo(d.y);
    };

    // ── things that are not ours ──
    const onScroll = () => {
      if (anim && Math.abs(window.scrollY - lastOwnY) > 3) finish(); // anchor link, scrollbar drag, find-in-page, scrollIntoView
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.target === root) finish(); // the scrollbar
    };
    const onHash = () => finish();

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('hashchange', onHash);

    return () => {
      finish();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  return null;
}
