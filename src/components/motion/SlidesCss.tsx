'use client';

import { useEffect } from 'react';

/** `?snap=slides-css` (NS-48 preview): native CSS scroll-snap, for comparison with the JS pager. Scoped by `html[data-snap]` and by the same media the gate uses. */
const RULES = `
@media (min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  html[data-snap="slides-css"] { scroll-snap-type: y mandatory; }
  html[data-snap="slides-css"] main > section,
  html[data-snap="slides-css"] main > footer { scroll-snap-align: start; scroll-snap-stop: always; }
}
`;

/** Marks <html data-snap="slides-css"> and renders the scoped rules. Loaded only by the SoftSnap gate. */
export function SlidesCss() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-snap', 'slides-css');
    return () => root.removeAttribute('data-snap');
  }, []);
  return <style>{RULES}</style>;
}
