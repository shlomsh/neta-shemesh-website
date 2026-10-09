import { useEffect } from 'react';

/**
 * While `active`, the page behind a full-screen overlay is `inert`: not focusable, not clickable and
 * hidden from assistive tech (which `aria-modal` alone does not guarantee on every screen reader).
 * Targets `<main>`, which holds all page content. The overlay must be portaled OUTSIDE `<main>`
 * (MobileMenu portals to `<body>`), otherwise it would go inert with it.
 * Cleanup runs before the next effects, so focus can be returned to a control inside `<main>` afterwards.
 */
export function useInertBackground(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const main = document.querySelector('main');
    if (!main) return;
    main.setAttribute('inert', '');
    return () => {
      main.removeAttribute('inert');
    };
  }, [active]);
}
