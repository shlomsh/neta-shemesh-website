import { useEffect, type RefObject } from 'react';

/**
 * While `active`: move focus to `initialFocusRef`, keep Tab / Shift+Tab inside `containerRef`, and
 * call `onEscape` on Escape. `onEscape` must be referentially stable (the effect re-runs, and so
 * re-focuses, when it changes).
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLElement | null>,
  onEscape: () => void,
) {
  useEffect(() => {
    if (!active) return;

    // Move focus into the overlay as soon as it's rendered.
    initialFocusRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
        return;
      }

      // Focus trap: cycle Tab / Shift+Tab within the container.
      if (e.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [active, containerRef, initialFocusRef, onEscape]);
}
