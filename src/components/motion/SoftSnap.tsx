'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType } from 'react';
import {
  DEFAULT_SNAP_MODE,
  SNAP_MEDIA,
  SNAP_MODE_PARAM,
  SNAP_MODE_STORAGE_KEY,
  isSnapActive,
  parseSnapVariant,
  type SnapVariant,
} from '@/lib/soft-snap';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(SNAP_MEDIA), window.matchMedia(REDUCED_MOTION)];
  queries.forEach((q) => q.addEventListener?.('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener?.('change', onChange));
}

const getSnapshot = () => isSnapActive(window.matchMedia(SNAP_MEDIA).matches, window.matchMedia(REDUCED_MOTION).matches);
const getServerSnapshot = () => false;

/**
 * The A/B mode: `?snap=off|v1|v2` wins and is remembered in sessionStorage, so client navigation
 * (which drops the query) keeps it; otherwise the remembered value; otherwise DEFAULT_SNAP_MODE.
 * Storage may be missing or throw (private mode, blocked site data): then the query still works for
 * this page view and the default applies afterwards.
 */
function readMode(): SnapVariant {
  const fromQuery = parseSnapVariant(new URLSearchParams(window.location.search).get(SNAP_MODE_PARAM));
  try {
    if (fromQuery) {
      window.sessionStorage.setItem(SNAP_MODE_STORAGE_KEY, fromQuery);
      return fromQuery;
    }
    return parseSnapVariant(window.sessionStorage.getItem(SNAP_MODE_STORAGE_KEY)) ?? DEFAULT_SNAP_MODE;
  } catch {
    return fromQuery ?? DEFAULT_SNAP_MODE;
  }
}

/**
 * Soft snap, the gate. Renders nothing. Only on a desktop-width viewport with a fine pointer
 * (`SNAP_MEDIA`) and without reduced motion does it load the engine (`./SoftSnapEngine`, a separate
 * chunk behind a dynamic `import()`), so touch devices download no snap code and run none: the
 * page scrolls natively there at every width. There is no touch snap; it made iOS in-app browsers
 * feel stuck (it snapped backward after slow swipes) and was deleted.
 *
 * The mode (`off`, `v1`, `v2`) is read once on mount (see `readMode`); `off` loads no engine and
 * v1 is the default. The engine is unmounted again if the media query stops matching (window moved to a phone-sized
 * viewport, reduced motion switched on, pointer changed).
 */
export function SoftSnap() {
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [loaded, setLoaded] = useState<{
    Engine: ComponentType<{ mode?: Exclude<SnapVariant, 'off'> }>;
    mode: Exclude<SnapVariant, 'off'>;
  } | null>(null);
  const modeRef = useRef<SnapVariant | null>(null); // read once, on the first activation

  useEffect(() => {
    if (!active) return;
    modeRef.current ??= readMode();
    const mode = modeRef.current;
    if (mode === 'off') return;
    let cancelled = false;
    void import('./SoftSnapEngine').then((m) => {
      if (!cancelled) setLoaded({ Engine: m.SoftSnapEngine, mode });
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  return active && loaded ? <loaded.Engine mode={loaded.mode} /> : null;
}
