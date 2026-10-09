'use client';

import { useEffect, useState, useSyncExternalStore, type ComponentType } from 'react';
import { SNAP_MEDIA, isSnapActive } from '@/lib/soft-snap';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(SNAP_MEDIA), window.matchMedia(REDUCED_MOTION)];
  queries.forEach((q) => q.addEventListener?.('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener?.('change', onChange));
}

const getSnapshot = () => isSnapActive(window.matchMedia(SNAP_MEDIA).matches, window.matchMedia(REDUCED_MOTION).matches);
const getServerSnapshot = () => false;

/**
 * Soft snap, the gate. Renders nothing. Only on a desktop-width viewport with a fine pointer
 * (`SNAP_MEDIA`) and without reduced motion does it load the engine (`./SoftSnapEngine`, a separate
 * chunk behind a dynamic `import()`), so touch devices download no snap code and run none: the
 * page scrolls natively there at every width. There is no touch snap; it made iOS in-app browsers
 * feel stuck (it snapped backward after slow swipes) and was deleted.
 *
 * The engine is unmounted again if the media query stops matching (window moved to a phone-sized
 * viewport, reduced motion switched on, pointer changed).
 */
export function SoftSnap() {
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [Engine, setEngine] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    void import('./SoftSnapEngine').then((m) => {
      if (!cancelled) setEngine(() => m.SoftSnapEngine);
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  return active && Engine ? <Engine /> : null;
}
