'use client';

import { useEffect } from 'react';
import {
  DURATION_MS,
  SETTLE_MS,
  STARTUP_IGNORE_MS,
  easeOutCubic,
  isSnapActive,
  pickSnapTarget,
} from '@/lib/soft-snap';

const SNAP_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Spacebar', 'Home', 'End',
]);

/**
 * Soft snap: after the user stops scrolling, gently glide to the nearest top-level card
 * edge, but only when that edge is already close (within THRESHOLD of the viewport height).
 * A middle ground between CSS `proximity` (too loose) and `mandatory` (too aggressive).
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

    const isActive = () => isSnapActive(window.innerWidth, reduceQuery.matches);

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
      const sections = document.querySelectorAll<HTMLElement>('main > section');
      const target = pickSnapTarget({
        scrollY: y,
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        sectionTops: Array.from(sections, (s) => s.getBoundingClientRect().top + y),
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
      settleTimer = setTimeout(settle, SETTLE_MS);
    };

    const onUserInput = () => {
      cancelAnimation();
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
    window.addEventListener('touchstart', onUserInput, { passive: true });
    window.addEventListener('pointerdown', onUserInput, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    reduceQuery.addEventListener?.('change', onResize);

    return () => {
      clearSettle();
      cancelAnimation();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onUserInput);
      window.removeEventListener('touchstart', onUserInput);
      window.removeEventListener('pointerdown', onUserInput);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      reduceQuery.removeEventListener?.('change', onResize);
    };
  }, []);

  return null;
}
