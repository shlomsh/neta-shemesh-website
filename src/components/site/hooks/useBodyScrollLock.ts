import { useEffect } from 'react';

/** While `active`, the page behind a full-screen overlay cannot scroll (body overflow hidden). */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);
}
