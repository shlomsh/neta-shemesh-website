'use client';

import { useEffect } from 'react';

/**
 * Restores Canva's runtime viewport-scaling variables that the static export
 * dropped (the original template ships this logic inline; canva-source/canva-framework.js
 * is empty and imported nowhere).
 *
 * The Canva layout is built on `html { font-size: max(calc(min(--1vw,13.66px)*--rfso), --minfs) }`
 * with `--1vw = (100vw - --sbw)/100`, so the `auto 100rem auto` grid column is meant to
 * equal `clientWidth`. Two variables must be maintained at runtime for that to hold:
 *
 *  - `--sbw`  : scrollbar width = innerWidth - documentElement.clientWidth, so --1vw excludes
 *               the scrollbar gutter and 100rem == clientWidth (not 100vw).
 *  - `--minfs`/`--rzf` : handles browser-enforced minimum font sizes. We probe the browser's
 *               minimum font-size; if non-zero, set --minfs and zoom the page down (--rzf) when
 *               100*minfs would exceed clientWidth. On desktop Chrome minfs is 0 → no-op; this
 *               branch exists for parity with the template on browsers that clamp font size.
 *
 * This is a faithful de-minified port of the template's scaling routine.
 */
export default function ViewportScale() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Read back a computed CSS value after setting it on a throwaway element —
    // lets us detect the browser's effective minimum font-size.
    const probe = (prop: string, value: string): string => {
      const el = document.createElement('div');
      el.style.setProperty(prop, value);
      document.body.append(el);
      const out = window.getComputedStyle(el).getPropertyValue(prop);
      el.remove();
      return out;
    };

    // Browser-enforced minimum font-size (0 when the browser honours tiny sizes).
    const detectMinFontSize = (): number => {
      const v = parseFloat(probe('font-size', '0.1px'));
      return v > 1 ? v : 0;
    };

    const setScrollbarWidth = () => {
      const sbw = window.innerWidth - root.clientWidth;
      if (sbw >= 0) {
        root.style.setProperty('--sbw', `${sbw}px`);
      }
    };

    const minfs = detectMinFontSize();

    const setZoomToFit = () => {
      if (minfs === 0) return; // browser honours small fonts → rem scaling already fits
      const designWidth = 100 * minfs; // 100rem at the clamped minimum font-size
      const cw = root.clientWidth;
      root.style.setProperty(
        '--rzf',
        designWidth > cw ? (cw / designWidth).toPrecision(4) : ''
      );
    };

    if (minfs > 0) {
      root.style.setProperty('--minfs', `${minfs}px`);
    }

    const onResize = () => {
      if (window.innerWidth >= 1024.05) {
        root.style.removeProperty('--sbw');
        root.style.removeProperty('--minfs');
        root.style.removeProperty('--rzf');
        return;
      }
      setScrollbarWidth();
      setZoomToFit();
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return null;
}
