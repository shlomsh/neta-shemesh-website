'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Wrapper for a `ButtonLink halo` (NS-57): hosts the breathing halo decoration (CSS in globals.css, `.btn-halo`)
 * and marks itself `data-in-view` while on screen, so the looping ring is paused when off screen.
 */
export function HaloWrap({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-in-view', e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className="btn-halo-wrap relative inline-flex">
      {children}
      <span className="btn-halo" aria-hidden="true" />
    </span>
  );
}
