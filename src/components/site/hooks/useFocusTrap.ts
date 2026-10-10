import { useEffect, useEffectEvent, type RefObject } from 'react';

/**
 * While `active`: move focus to `initialFocusRef`, keep Tab / Shift+Tab inside `containerRef`, and
 * call `onEscape` on Escape. `onEscape` can be an inline function: it is read through an effect event, so
 * a new identity on every render neither re-runs the effect nor re-focuses.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLElement | null>,
  onEscape: () => void,
) {
  const escape = useEffectEvent(onEscape);

  useEffect(() => {
    if (!active) return;

    // Move focus into the overlay as soon as it's rendered.
    initialFocusRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escape();
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
  }, [active, containerRef, initialFocusRef]);
}
