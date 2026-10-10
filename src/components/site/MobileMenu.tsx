'use client';

import { useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { IconButton } from '@/components/primitives/ui/IconButton';
import { ID } from '@/content/ids';
import { SITE, telHref } from '@/content/site';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { useCloseAtBreakpoint } from './hooks/useCloseAtBreakpoint';
import { useFocusTrap } from './hooks/useFocusTrap';
import { useInertBackground } from './hooks/useInertBackground';
import { CloseIcon } from './icons';
import { NavLink } from './NavLink';

const subscribeNoop = () => () => {};

export interface NavItem {
  label: string;
  href: string;
}

/**
 * The full-screen overlay menu below md. Portaled to <body> for stacking safety: it renders out of the top
 * bar's stacking context and containing block (any `transform`, `translate` or `will-change` on an ancestor
 * would otherwise trap this position:fixed overlay inside the bar). `onClose` may be an inline function.
 */
export function MobileMenu({ open, links, onClose }: { open: boolean; links: NavItem[]; onClose: () => void }) {
  // false on the server / first hydration pass, true on the client afterwards
  // (derived via useSyncExternalStore instead of setState-in-effect).
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll, focus the close button, and handle keyboard while the overlay is open.
  useBodyScrollLock(open);
  useInertBackground(open);
  useFocusTrap(open, overlayRef, closeButtonRef, onClose);
  // The overlay is md:hidden: close it when the viewport grows past md (rotation, split view).
  useCloseAtBreakpoint(open, '(min-width: 48rem)', onClose);

  if (!(mounted && open)) return null;

  return createPortal(
    <div
      ref={overlayRef}
      id={ID.mobileMenu}
      role="dialog"
      aria-modal="true"
      aria-label="תפריט ניווט"
      className="fixed inset-0 z-[100] md:hidden flex flex-col bg-plum"
    >
      <div className="flex items-center justify-end px-[clamp(1.25rem,5vw,2.5rem)] py-[clamp(1.25rem,4vw,2rem)]">
        <IconButton ref={closeButtonRef} label="סגירת תפריט" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <nav
        aria-label="ניווט ראשי"
        className="flex flex-1 flex-col items-center justify-center gap-[clamp(1.75rem,7vw,2.75rem)] px-6 pb-[10vh]"
      >
        {links.map(({ href, label }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            className="type-card-title text-cream transition-opacity hover:opacity-75"
            onClick={onClose}
          />
        ))}

        <ButtonLink
          href={telHref()}
          variant="secondary"
          onClick={onClose}
          className="mt-[clamp(0.75rem,4vw,1.5rem)]"
        >
          <span dir="ltr" className="font-latin">{SITE.phone.display}</span>
        </ButtonLink>
      </nav>
    </div>,
    document.body,
  );
}
