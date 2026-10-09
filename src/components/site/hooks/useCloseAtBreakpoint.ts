import { useEffect } from 'react';

/**
 * While `active`, call `onClose` when the media query `query` starts matching (e.g. an iPad rotated
 * past md while the md:hidden overlay is open, which would leave scroll lock and focus trap active
 * on an invisible menu). Effect-only: the render output never depends on the query, so SSR and
 * hydration markup stay identical. `onClose` must be referentially stable.
 */
export function useCloseAtBreakpoint(active: boolean, query: string, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) onClose();
    };
    if (mql.matches) onClose();
    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, [active, query, onClose]);
}
