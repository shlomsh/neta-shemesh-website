'use client';

import { useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { IconButton } from '@/components/primitives/ui/IconButton';
import { ID } from '@/content/ids';
import { SITE, telHref } from '@/content/site';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { useFocusTrap } from './hooks/useFocusTrap';
import { CloseIcon } from './icons/CloseIcon';
import { NavLink } from './NavLink';

const subscribeNoop = () => () => {};

export interface NavItem {
  label: string;
  href: string;
}

/**
 * The full-screen overlay menu below md. Portaled to <body>: framer-motion's `will-change` on the
 * ScrollReveal ancestor establishes a containing block that would otherwise trap this
 * position:fixed overlay inside the top bar. `onClose` must be referentially stable.
 */
export function MobileMenu({ open, links, onClose }: { open: boolean; links: NavItem[]; onClose: () => void }) {
  // false on the server / first hydration pass, true on the client afterwards
  // (derived via useSyncExternalStore instead of setState-in-effect).
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll, focus the close button, and handle keyboard while the overlay is open.
  useBodyScrollLock(open);
  useFocusTrap(open, overlayRef, closeButtonRef, onClose);

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
      <div className="flex items-center justify-end px-[clamp(20px,5vw,40px)] py-[clamp(20px,4vw,32px)]">
        <IconButton ref={closeButtonRef} label="סגירת תפריט" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <nav
        aria-label="ניווט ראשי"
        className="flex flex-1 flex-col items-center justify-center gap-[clamp(28px,7vw,44px)] px-[24px] pb-[10vh]"
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
          className="mt-[clamp(12px,4vw,24px)]"
        >
          <span dir="ltr" className="font-latin">{SITE.phone.display}</span>
        </ButtonLink>
      </nav>
    </div>,
    document.body,
  );
}
