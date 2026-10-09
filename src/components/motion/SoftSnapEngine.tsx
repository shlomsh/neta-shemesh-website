'use client';

import { useEffect } from 'react';
import {
  DURATION_MS,
  SETTLE_MS,
  STARTUP_IGNORE_MS,
  V2_DURATION_MS,
  V2_SETTLE_MS,
  easeOutCubic,
  pickSnapTarget,
  pickSnapTargetV2,
  type SnapVariant,
} from '@/lib/soft-snap';

const SNAP_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Spacebar', 'Home', 'End',
]);

/** True while the mobile menu overlay is open: `useInertBackground` marks <main> inert, `useBodyScrollLock` hides body overflow. */
const isMenuOpen = () =>
  document.querySelector('main[inert]') !== null || document.body.style.overflow === 'hidden';

/**
 * Soft snap engine: after the user stops scrolling, gently glide to the nearest top-level card
 * edge (the `main > section` cards and the `main > footer`), but only when that edge is already
 * close (within THRESHOLD of the viewport height). A middle ground between CSS `proximity`
 * (too loose) and `mandatory` (too aggressive).
 *
 * Loaded only by the `SoftSnap` gate, which mounts it on desktop widths with a fine pointer and
 * no reduced motion, so this file needs no media checks of its own and has no touch handling. It
 * does skip snapping while the mobile menu overlay is open.
 *
 * This file is the effect (listeners, timers, the glide); what to snap to is the pure
 * `pickSnapTarget` (v1) or `pickSnapTargetV2` in `@/lib/soft-snap`, where the constants live too.
 * `mode` (default v1) picks the decision, settle time and glide length; v2 additionally sums the
 * net scroll since the last settle (`gestureDelta`) so the decision knows the gesture direction.
 */
export function SoftSnapEngine({ mode = 'v1' }: { mode?: Extract<SnapVariant, 'v1' | 'v2'> }) {
  useEffect(() => {
    const v2 = mode === 'v2';
    const settleMs = v2 ? V2_SETTLE_MS : SETTLE_MS;
    const durationMs = v2 ? V2_DURATION_MS : DURATION_MS;
    const mountedAt = performance.now();
    // v2: signed net scroll since the last settle, and the last scrollY seen (to take deltas from)
    let gestureDelta = 0;
    let lastY = window.scrollY;

    let animating = false;
    let rafId = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let lastHash = window.location.hash;
    let skipNextSettle = false;
    let prevScrollBehavior = '';
    // Last position we scrolled to ourselves; trailing scroll events at that exact
    // position (delivered after a cancel) must not re-arm the settle timer.
    let lastOwnY: number | null = null;

    const finishAnimation = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (animating) {
        document.documentElement.style.scrollBehavior = prevScrollBehavior;
        animating = false;
        gestureDelta = 0;
        lastY = window.scrollY;
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
        const t = Math.min(1, (now - start) / durationMs);
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
      if (animating || isMenuOpen()) return;
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
      const delta = gestureDelta;
      gestureDelta = 0; // every settle starts a fresh gesture, whether or not it glides
      lastY = y;
      const sections = document.querySelectorAll<HTMLElement>('main > section, main > footer');
      const input = {
        scrollY: y,
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        sectionTops: Array.from(sections, (s) => s.getBoundingClientRect().top + y),
      };
      const target = v2 ? pickSnapTargetV2({ ...input, gestureDelta: delta }) : pickSnapTarget(input);
      if (target !== null) animateTo(target);
    };

    const onScroll = () => {
      if (animating) return; // our own scroll events
      const y = window.scrollY;
      gestureDelta += y - lastY;
      lastY = y;
      if (lastOwnY !== null) {
        const own = Math.abs(window.scrollY - lastOwnY) < 1;
        if (own) return; // trailing event from our last programmatic scroll
        lastOwnY = null;
      }
      if (window.location.hash !== lastHash) {
        lastHash = window.location.hash;
        skipNextSettle = true;
      }
      clearSettle();
      settleTimer = setTimeout(settle, settleMs);
    };

    const onUserInput = () => {
      cancelAnimation();
    };

    // A wheel event can precede its scroll event by a frame: while a decision is pending, any
    // wheel input pushes it back so a slow mouse wheel is never decided between two notches.
    const onWheel = () => {
      cancelAnimation();
      if (v2 && settleTimer !== undefined) {
        clearSettle();
        settleTimer = setTimeout(settle, settleMs);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (SNAP_KEYS.has(e.key)) cancelAnimation();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('pointerdown', onUserInput, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearSettle();
      cancelAnimation();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerdown', onUserInput);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mode]);

  return null;
}
