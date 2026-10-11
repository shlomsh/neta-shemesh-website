'use client';

import { useEffect, useLayoutEffect } from 'react';
import { stagger } from '@/lib/motion';

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
const ladder = (max: number) => Array.from({ length: Math.round(max / STEP) + 1 }, (_, i) => +(i * STEP).toFixed(2));
const THRESHOLDS = ladder(MAX_AMOUNT);

/**
 * `?reveal=` PREVIEWS (owner review of how visible the entrance is; visitors without the query get the default
 * and nothing below runs). The mode is also put on `<html data-reveal-mode>`, where `globals.css` gives every
 * mode the longer travel/duration; `scale` adds a small scale-up on photos.
 *   late    reveal only once the element is well inside the viewport (shrunk by LATE_INSET at the bottom, up to
 *           LATE_AMOUNT of it), so the fade runs after the card has arrived. A sweep after the scroll goes idle
 *           reveals what the default rule would, so nothing parked in the bottom strip stays hidden.
 *   settle  desktop with the CSS card snap: hold every reveal until the scroll has settled (`scrollend`, or a
 *           debounce where it is unsupported), then reveal what is in view in a visible stagger. Phones: `late`.
 *   scale   `late` plus a 0.96 -> 1 scale on photos (CSS only).
 */
const PREVIEWS = ['late', 'settle', 'scale'] as const;
type RevealPreview = (typeof PREVIEWS)[number];
const LATE_AMOUNT = 0.5;
const LATE_INSET = 0.25;
const LATE_THRESHOLDS = ladder(LATE_AMOUNT);
/** Idle debounce after the last scroll event: long where `scrollend` is the real signal, short where it is the only one. */
const IDLE_SAFETY_MS = 800;
const IDLE_FALLBACK_MS = 200;
/** Same condition as the CSS card snap in `globals.css`. */
const DESKTOP_SNAP = '(min-width: 1024px) and (pointer: fine)';
/** Longest stagger rank in `settle`, so a big group (the gallery) does not trail for seconds. */
const MAX_RANK = 5;

function previewFromUrl(): RevealPreview | null {
  try {
    const mode = new URLSearchParams(window.location.search).get('reveal');
    return PREVIEWS.find((p) => p === mode) ?? null;
  } catch {
    return null;
  }
}

/**
 * The share of `el` that must be visible before it reveals: 20%, but never more than 90% of what a
 * viewport can show of it, so an element taller than 5 viewports (20% of it never fits on screen at once) still reveals.
 */
export function amountFor(el: HTMLElement, viewportHeight: number, max = MAX_AMOUNT, view = 1): number {
  const h = el.offsetHeight;
  const cap = h > 0 ? Math.min(max, (0.9 * viewportHeight * view) / h) : max;
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
      delete document.documentElement.dataset.revealMode;
    },
    [],
  );

  useEffect(() => {
    if (!canArm()) return;

    const html = document.documentElement;
    const preview = previewFromUrl();
    if (preview) html.dataset.revealMode = preview;
    const settle = preview === 'settle' && window.matchMedia(DESKTOP_SNAP).matches && !!document.querySelector('main[data-snap-cards]');
    const late = preview !== null && !settle;
    const max = late ? LATE_AMOUNT : MAX_AMOUNT;
    const view = late ? 1 - LATE_INSET : 1;

    let armed = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let scrolling = false;
    const waiting = new Set<HTMLElement>(); // not revealed yet (previews only)
    const eligible = new Set<HTMLElement>(); // settle: met the amount, waiting for the scroll to stop

    const reveal = (el: HTMLElement) => {
      el.setAttribute('data-revealed', '');
      observer.unobserve(el);
      waiting.delete(el);
      eligible.delete(el);
    };

    const onScreen = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    // Preview idle work. `settle`: reveal what is in view, in document order, one stagger step apart.
    // `late`: reveal whatever the default rule would (the share of the element on screen), for elements parked in the bottom strip.
    const onIdle = () => {
      clearTimeout(idleTimer);
      scrolling = false;
      if (settle) {
        const batch = [...eligible].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        batch.forEach((el, i) => {
          el.style.setProperty('--reveal-delay', `${stagger(Math.min(i, MAX_RANK))}s`);
          reveal(el);
        });
        return;
      }
      const vh = window.innerHeight;
      for (const el of waiting) {
        const r = el.getBoundingClientRect();
        const share = r.height > 0 ? (Math.min(r.bottom, vh) - Math.max(r.top, 0)) / r.height : 0;
        if (share + 1e-3 >= amountFor(el, vh)) reveal(el);
      }
    };

    const onScroll = () => {
      scrolling = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(onIdle, 'onscrollend' in window ? IDLE_SAFETY_MS : IDLE_FALLBACK_MS);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (!armed) {
            // First batch: whatever is on screen at all stays put (no hide-then-fade for a peeking element).
            if (preview ? onScreen(el) : entry.isIntersecting && entry.intersectionRatio > 0) reveal(el);
            else waiting.add(el);
            continue;
          }
          const ok = entry.isIntersecting && entry.intersectionRatio + 1e-3 >= amountFor(el, window.innerHeight, max, view);
          if (settle) {
            if (ok) eligible.add(el);
            else eligible.delete(el);
          } else if (ok) {
            reveal(el);
          }
        }
        if (!armed) {
          armed = true;
          html.dataset.revealArmed = '';
        } else if (settle && !scrolling && eligible.size > 0) {
          onIdle();
        }
      },
      late
        ? { threshold: LATE_THRESHOLDS, rootMargin: `0px 0px -${Math.round(LATE_INSET * 100)}% 0px` }
        : { threshold: THRESHOLDS },
    );

    document.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));

    if (preview) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('scrollend', onIdle);
    }

    return () => {
      observer.disconnect();
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onIdle);
      delete html.dataset.revealArmed;
      delete html.dataset.revealMode;
    };
  }, []);

  return null;
}
