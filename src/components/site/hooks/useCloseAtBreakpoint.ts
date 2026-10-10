import { useEffect, useEffectEvent } from 'react';

/**
 * While `active`, call `onClose` when the media query `query` starts matching (e.g. an iPad rotated
 * past md while the md:hidden overlay is open, which would leave scroll lock and focus trap active
 * on an invisible menu). Effect-only: the render output never depends on the query, so SSR and
 * hydration markup stay identical. `onClose` can be an inline function (read through an effect event).
 */
export function useCloseAtBreakpoint(active: boolean, query: string, onClose: () => void) {
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!active) return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) close();
    };
    if (mql.matches) close();
    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, [active, query]);
}
