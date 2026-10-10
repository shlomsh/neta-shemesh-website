'use client';

import { useEffect, useLayoutEffect } from 'react';

/** The elements `ScrollReveal` renders. */
const SELECTOR = '[data-reveal="io"]';

/** Largest share of an element that has to be on screen before it reveals. */
const MAX_AMOUNT = 0.2;

/**
 * One IntersectionObserver cannot hold a threshold per target, so the ladder is fine-grained
 * (0, .01 ... .2) and `amountFor` snaps each element's own amount down onto it. Snapping down
 * (never up) guarantees the callback fires at or before the element's real maximum ratio.
 */
const STEP = 0.01;
const THRESHOLDS = Array.from({ length: Math.round(MAX_AMOUNT / STEP) + 1 }, (_, i) => +(i * STEP).toFixed(2));

/**
 * The share of `el` that must be visible before it reveals: 20%, but never more than 90% of what a
 * viewport can show of it, so an element taller than 5 viewports (20% of it never fits on screen at once) still reveals.
 */
export function amountFor(el: HTMLElement, viewportHeight: number): number {
  const h = el.offsetHeight;
  const cap = h > 0 ? Math.min(MAX_AMOUNT, (0.9 * viewportHeight) / h) : MAX_AMOUNT;
  return Math.floor(cap / STEP + 1e-6) * STEP;
}

/** Everything that must hold before the page may hide anything. Any failure leaves all content visible. */
function canArm(): boolean {
  if (typeof IntersectionObserver === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    // Throws in sandboxed cross-origin frames; any framed page is left un-animated (c95a8e0: whileInView
    // never fired inside the review iframe and left the page at opacity 0).
    if (window.self !== window.top) return false;
  } catch {
    return false;
  }
  return true;
}

/**
 * The scroll-reveal driver, mounted once in `PageShell`. Renders nothing and never influences render
 * output: it only sets attributes after mount (`data-revealed` on elements, `data-reveal-armed` on
 * `<html>`), so there is no hydration mismatch to guard.
 *
 * Arming happens only after the observer's first callback has marked everything already on screen
 * `data-revealed`, so above-the-fold content (the blog's h1 and first cards) never fades and never
 * blinks hidden. If the callback never fires, `data-reveal-armed` is never set and nothing hides.
 */
export function RevealObserver() {
  // Disarm before paint when the page unmounts (client navigation): the next page's elements would
  // otherwise be hidden for the frames before its own effect re-arms.
  useLayoutEffect(
    () => () => {
      delete document.documentElement.dataset.revealArmed;
    },
    [],
  );

  useEffect(() => {
    if (!canArm()) return;

    let armed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          // First batch: whatever is on screen at all stays put (no hide-then-fade for a peeking element).
          const reveal = armed
            ? entry.isIntersecting && entry.intersectionRatio + 1e-3 >= amountFor(el, window.innerHeight)
            : entry.isIntersecting && entry.intersectionRatio > 0;
          if (reveal) {
            el.setAttribute('data-revealed', '');
            observer.unobserve(el);
          }
        }
        if (!armed) {
          armed = true;
          document.documentElement.dataset.revealArmed = '';
        }
      },
      { threshold: THRESHOLDS },
    );

    document.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      delete document.documentElement.dataset.revealArmed;
    };
  }, []);

  return null;
}
