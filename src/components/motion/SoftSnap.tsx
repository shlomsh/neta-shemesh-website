'use client';

import { useEffect } from 'react';
import {
  DURATION_MS,
  SETTLE_MS,
  STARTUP_IGNORE_MS,
  TOUCH_SETTLE_MS,
  easeOutCubic,
  isSnapActive,
  pickSnapTarget,
  snapMode,
} from '@/lib/soft-snap';

const SNAP_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Spacebar', 'Home', 'End',
]);

/**
 * Soft snap: after the user stops scrolling, gently glide to the nearest top-level card
 * edge (the `main > section` cards and the `main > footer`), but only when that edge is already
 * close (within THRESHOLD of the viewport height). A middle ground between CSS `proximity`
 * (too loose) and `mandatory` (too aggressive).
 *
 * It runs at every width. On touch widths (< MIN_WIDTH) it is gentler: it waits a little longer
 * after the last scroll event or touchend (so iOS momentum has ended), never acts while a finger
 * is down, and does not pull the reader back up into a section taller than the screen.
 *
 * This file is the effect (listeners, timers, the glide); what to snap to is the pure
 * `pickSnapTarget` in `@/lib/soft-snap`, where the constants live too.
 */
export function SoftSnap() {
  useEffect(() => {
    const mountedAt = performance.now();
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let animating = false;
    let rafId = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let lastHash = window.location.hash;
    let skipNextSettle = false;
    let prevScrollBehavior = '';
    // Last position we scrolled to ourselves; trailing scroll events at that exact
    // position (delivered after a cancel) must not re-arm the settle timer.
    let lastOwnY: number | null = null;
    // Fingers currently on the screen (touchstart/touchend/touchcancel). A snap never fights one.
    let touching = false;

    // Invisible probe whose height is 100lvh (the collapsed-toolbar screen); 0 where lvh is unsupported.
    let lvhProbe: HTMLDivElement | null = null;
    const largeViewportHeight = () => {
      if (!lvhProbe) {
        lvhProbe = document.createElement('div');
        lvhProbe.setAttribute('aria-hidden', 'true');
        lvhProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
        document.body.appendChild(lvhProbe);
      }
      return Math.max(lvhProbe.offsetHeight, window.innerHeight);
    };

    const isActive = () => isSnapActive(reduceQuery.matches);
    const settleDelay = () => (snapMode(window.innerWidth) === 'gentle' ? TOUCH_SETTLE_MS : SETTLE_MS);

    const finishAnimation = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (animating) {
        document.documentElement.style.scrollBehavior = prevScrollBehavior;
        animating = false;
      }
    };

    const cancelAnimation = () => {
      if (animating) finishAnimation();
    };

    const clearSettle = () => {
      if (settleTimer !== undefined) {
        clearTimeout(settleTimer);
        settleTimer = undefined;
      }
    };

    const isTyping = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable;
    };

    const animateTo = (target: number) => {
      const from = window.scrollY;
      const delta = target - from;
      const root = document.documentElement;
      prevScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      animating = true;
      const start = performance.now();
      const step = (now: number) => {
        if (!animating) return;
        const t = Math.min(1, (now - start) / DURATION_MS);
        const y = from + delta * easeOutCubic(t);
        lastOwnY = y;
        window.scrollTo(0, y);
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = 0;
          finishAnimation();
        }
      };
      rafId = requestAnimationFrame(step);
    };

    const settle = () => {
      settleTimer = undefined;
      if (animating || !isActive()) return;
      if (window.location.hash !== lastHash) {
        lastHash = window.location.hash;
        return;
      }
      if (skipNextSettle) {
        skipNextSettle = false;
        return;
      }
      if (performance.now() - mountedAt < STARTUP_IGNORE_MS) return;
      if (isTyping()) return;

      const y = window.scrollY;
      const sections = document.querySelectorAll<HTMLElement>('main > section, main > footer');
      const rects = Array.from(sections, (s) => s.getBoundingClientRect());
      const target = pickSnapTarget({
        scrollY: y,
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        sectionTops: rects.map((r) => r.top + y),
        sectionHeights: rects.map((r) => r.height),
        largeViewportHeight: largeViewportHeight(),
        mode: snapMode(window.innerWidth),
        touching,
      });
      if (target !== null) animateTo(target);
    };

    const onScroll = () => {
      if (animating) return; // our own scroll events
      if (lastOwnY !== null) {
        const own = Math.abs(window.scrollY - lastOwnY) < 1;
        if (own) return; // trailing event from our last programmatic scroll
        lastOwnY = null;
      }
      if (!isActive()) return;
      if (window.location.hash !== lastHash) {
        lastHash = window.location.hash;
        skipNextSettle = true;
      }
      clearSettle();
      settleTimer = setTimeout(settle, settleDelay());
    };

    const onUserInput = () => {
      cancelAnimation();
    };

    const onTouchStart = (e: TouchEvent) => {
      touching = e.touches.length > 0;
      clearSettle(); // a held finger is not "idle"; touchend re-arms the timer
      cancelAnimation();
    };

    const onTouchEnd = (e: TouchEvent) => {
      touching = e.touches.length > 0;
      if (touching || !isActive()) return;
      // Momentum scrolling (if any) keeps firing scroll events and pushes this out; a plain lift
      // with no momentum fires none, so arm the settle timer here too.
      clearSettle();
      settleTimer = setTimeout(settle, settleDelay());
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (SNAP_KEYS.has(e.key)) cancelAnimation();
    };

    const onResize = () => {
      if (!isActive()) {
        clearSettle();
        cancelAnimation();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onUserInput, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('pointerdown', onUserInput, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    reduceQuery.addEventListener?.('change', onResize);

    return () => {
      clearSettle();
      cancelAnimation();
      lvhProbe?.remove();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onUserInput);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('pointerdown', onUserInput);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      reduceQuery.removeEventListener?.('change', onResize);
    };
  }, []);

  return null;
}
