'use client';

import { createElement, useEffect, useState, useSyncExternalStore, type ReactElement } from 'react';
import { SNAP_MEDIA, isSnapActive } from '@/lib/soft-snap';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(SNAP_MEDIA), window.matchMedia(REDUCED_MOTION)];
  queries.forEach((q) => q.addEventListener?.('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener?.('change', onChange));
}

const getSnapshot = () => isSnapActive(window.matchMedia(SNAP_MEDIA).matches, window.matchMedia(REDUCED_MOTION).matches);
const getServerSnapshot = () => false;

/** Hidden escape hatch: `?snap=off` leaves the page on native scroll (nothing is stored; client navigation drops it). */
const isOptedOut = () => new URLSearchParams(window.location.search).get('snap') === 'off';

/** The pager chunk's promise, started once. Never statically imported: touch devices must not download it. */
let pager: Promise<ReactElement> | null = null;
const loadPager = () => (pager ??= import('./SlidePager').then((m) => createElement(m.SlidePager)));

// Start the download as soon as this module runs in the browser (before hydration finishes), and only
// where the pager will be used, so the first gesture after load already pages instead of scrolling natively.
// matchMedia is missing in some test environments; the effect below loads on demand there.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && getSnapshot() && !isOptedOut()) {
  void loadPager();
}

/**
 * Slide pager, the gate. Renders nothing. Only on a desktop-width viewport with a fine pointer
 * (`SNAP_MEDIA`) and without reduced motion does it mount the pager (`./SlidePager`, its own chunk behind a
 * dynamic `import()`, started eagerly on those devices), so touch devices download no pager code and run none:
 * the page scrolls natively there at every width. There is no touch paging; an old touch snap made
 * iOS in-app browsers feel stuck and was deleted.
 *
 * The pager is unmounted again if the media query stops matching (window moved to a phone-sized
 * viewport, reduced motion switched on, pointer changed). `?snap=off` is a hidden escape hatch.
 */
export function SoftSnap() {
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [loaded, setLoaded] = useState<ReactElement | null>(null);

  useEffect(() => {
    if (!active || isOptedOut()) return;
    let cancelled = false;
    void loadPager().then((el) => {
      if (!cancelled) setLoaded(el);
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  return active && loaded ? loaded : null;
}
