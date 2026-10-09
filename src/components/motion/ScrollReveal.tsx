import type { CSSProperties, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Seconds. Passed to CSS as `--reveal-delay`; omit for none. */
  delay?: number;
  className?: string;
}

/**
 * Fade/rise-in on scroll, in three parts:
 *
 *   1. this SERVER component: a plain `<div data-reveal="io">`. No inline opacity/transform, so the HTML
 *      is fully visible without JS (the old framer `initial={{ opacity: 0 }}` shipped `opacity:0` in the
 *      server HTML and left the page blank when hydration was slow, blocked, or in an iframe);
 *   2. `RevealObserver` (the one client island, mounted in `PageShell`): once it is sure it can do the
 *      job (top-level page, IntersectionObserver present, no reduced motion), it sets
 *      `html[data-reveal-armed]` and marks elements `data-revealed` as they come into view;
 *   3. CSS in `globals.css`: the hidden state exists only under `html[data-reveal-armed]` AND
 *      `prefers-reduced-motion: no-preference`.
 *
 * Same markup on the server and the client by construction: never branch on `useReducedMotion()`,
 * `matchMedia` or `window.top` here (8fcd901: a branch gave the server HTML a different `style` than the
 * client's, and React hydration does not patch `style`). `data-reveal="io"` (not a bare `data-reveal`)
 * is what `RevealObserver` and the hidden-state CSS select; ContactFAB's bare `data-reveal` stays on
 * framer until NS-14 and is untouched by this mechanism. Any `[data-reveal]` is still forced visible
 * under `prefers-reduced-motion: reduce`.
 */
export function ScrollReveal({ children, delay = 0, className = '' }: ScrollRevealProps) {
  return (
    <div
      data-reveal="io"
      className={className}
      style={delay > 0 ? ({ '--reveal-delay': `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
