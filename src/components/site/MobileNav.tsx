'use client';

import { useEffect, useRef, useState } from 'react';
import { IconButton } from '@/components/primitives/ui/IconButton';
import { ID } from '@/content/ids';
import { MenuIcon } from './icons';
import { MobileMenu, type NavItem } from './MobileMenu';

/**
 * The below-md half of SiteNav, and the only part of the nav that needs state: the hamburger button and
 * the full-screen overlay it opens (MobileMenu). The desktop links are server-rendered by SiteNav.
 */
export function MobileNav({ links }: { links: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Return focus to the hamburger button when the overlay closes (not on initial mount).
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      hamburgerRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <IconButton
        ref={hamburgerRef}
        label="פתיחת תפריט"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={ID.mobileMenu}
        className="md:hidden"
      >
        <MenuIcon />
      </IconButton>

      <MobileMenu open={open} links={links} onClose={() => setOpen(false)} />
    </>
  );
}
