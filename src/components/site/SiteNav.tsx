'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { IconButton } from '@/components/primitives/ui/IconButton';
import { NAV_LINKS } from '@/content/home/nav';
import { anchorHref, ID } from '@/content/ids';
import { SITE, telHref } from '@/content/site';
import { MenuIcon } from './icons/MenuIcon';
import { MobileMenu } from './MobileMenu';
import { NavLink } from './NavLink';

/**
 * SiteNav: the navigation used both in the hero and the blog header.
 *
 * Responsive behaviour:
 *   - md and up  → inline pill nav (links + phone badge), as before.
 *   - below md   → a hamburger button that opens a full-screen overlay menu (MobileMenu).
 *                  The old inline nav squeezed 4 links + a phone pill into one
 *                  row at 375px, collapsing the link text to 13px (below the
 *                  14px legibility floor). The overlay gives each link a large
 *                  tap target instead.
 *
 * basePath: prefix for hash anchors. Default '' works on the homepage
 * (#about-me scrolls in-page). Pass '/' from blog pages so the links become
 * /#about-me (full-document navigation, avoids App Router hash-stacking bug).
 */
const desktopLinkClass = `
    type-lead
    text-cream
    font-bold
    transition-opacity
    hover:opacity-75
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-cream
    rounded-tile
  `;

export function SiteNav({ basePath = '' }: { basePath?: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  const links = NAV_LINKS.map((link) => ({
    label: link.label,
    href: link.anchor !== undefined ? anchorHref(link.anchor, basePath) : link.route,
  }));

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
      {/* ── Desktop nav (md and up) ── */}
      <nav
        aria-label="ניווט ראשי"
        className="hidden md:flex items-center justify-center gap-[clamp(24px,4vw,56px)]"
      >
        {links.map(({ href, label }) => (
          <NavLink key={href} href={href} label={label} className={desktopLinkClass} />
        ))}

        <ButtonLink href={telHref()} variant="secondary" size="sm">
          <span dir="ltr" className="font-latin">{SITE.phone.display}</span>
        </ButtonLink>
      </nav>

      {/* ── Mobile hamburger (below md) ── */}
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

      <MobileMenu open={open} links={links} onClose={close} />
    </>
  );
}
