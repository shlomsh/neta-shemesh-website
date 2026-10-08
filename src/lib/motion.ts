/**
 * Reveal-delay helpers for `<ScrollReveal delay>`.
 *
 * Lives outside ScrollReveal.tsx on purpose: that file is a client module, and server
 * components (Expertise, the blog pages) cannot call a function exported from one.
 */

/** Seconds between consecutive items of a staggered group. */
const STAGGER = 0.12;

/** Delay of the `index`-th item of a staggered group, optionally after a `base` lead-in. */
export const stagger = (index: number, base = 0) => base + index * STAGGER;
