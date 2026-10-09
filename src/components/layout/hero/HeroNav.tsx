'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { IconButton } from '@/components/primitives/ui/IconButton';
import { NAV_LINKS } from '@/content/home/nav';
import { anchorHref, ID } from '@/content/ids';
import { SITE, telHref } from '@/content/site';

/**
 * HeroNav — navigation used both in the hero and the blog header.
 *
 * Responsive behaviour:
 *   - md and up  → inline pill nav (links + phone badge), as before.
 *   - below md   → a hamburger button that opens a full-screen overlay menu.
 *                  The old inline nav squeezed 4 links + a phone pill into one
 *                  row at 375px, collapsing the link text to 13px (below the
 *                  14px legibility floor). The overlay gives each link a large
 *                  tap target instead.
 *
 * basePath: prefix for hash anchors. Default '' works on the homepage
 * (#about-me scrolls in-page). Pass '/' from blog pages so the links become
 * /#about-me (full-document navigation, avoids App Router hash-stacking bug).
 *
 * Rule: use <Link> only for hash-free routes (/blog, /). Hash links — even
 * cross-route ones like /#about-me — always use plain <a> so the browser does
 * a full navigation that reliably replaces the fragment.
 */
const subscribeNoop = () => () => {};

export function HeroNav({ basePath = '' }: { basePath?: string }) {
  const [open, setOpen] = useState(false);
  // false on the server / first hydration pass, true on the client afterwards
  // (derived via useSyncExternalStore instead of setState-in-effect).
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  const links = NAV_LINKS.map((link) => ({
    label: link.label,
    href: link.anchor !== undefined ? anchorHref(link.anchor, basePath) : link.route,
  }));

  // Lock body scroll, focus the close button, and handle keyboard while overlay is open.
  useEffect(() => {
    if (!open) return;

    // Move focus into the overlay as soon as it's rendered.
    closeButtonRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      // Focus trap: cycle Tab / Shift+Tab within the overlay.
      if (e.key !== 'Tab') return;
      const overlay = overlayRef.current;
      if (!overlay) return;

      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>(
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
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Return focus to the hamburger button when the overlay closes (not on initial mount).
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      hamburgerRef.current?.focus();
    }
  }, [open]);

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

  const renderLink = (
    href: string,
    label: string,
    className: string,
    onClick?: () => void,
  ) =>
    href.startsWith('/') && !href.includes('#') ? (
      <Link key={href} href={href} className={className} onClick={onClick}>
        {label}
      </Link>
    ) : (
      <a key={href} href={href} className={className} onClick={onClick}>
        {label}
      </a>
    );

  return (
    <>
      {/* ── Desktop nav (md and up) ── */}
      <nav
        aria-label="ניווט ראשי"
        className="hidden md:flex items-center justify-center gap-[clamp(24px,4vw,56px)]"
      >
        {links.map(({ href, label }) => renderLink(href, label, desktopLinkClass))}

        <ButtonLink href={telHref()} variant="secondary" size="sm">
          <span className="font-latin">{SITE.phone.display}</span>
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
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </IconButton>

      {/* ── Mobile overlay menu ── */}
      {/* Portaled to <body>: framer-motion's `will-change` on the ScrollReveal
          ancestor establishes a containing block that would otherwise trap
          this position:fixed overlay inside the top bar. */}
      {mounted && open && createPortal(
        <div
          ref={overlayRef}
          id={ID.mobileMenu}
          role="dialog"
          aria-modal="true"
          aria-label="תפריט ניווט"
          className="fixed inset-0 z-[100] md:hidden flex flex-col bg-plum"
        >
          <div className="flex items-center justify-end px-[clamp(20px,5vw,40px)] py-[clamp(20px,4vw,32px)]">
            <IconButton ref={closeButtonRef} label="סגירת תפריט" onClick={() => setOpen(false)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </IconButton>
          </div>

          <nav
            aria-label="ניווט ראשי"
            className="flex flex-1 flex-col items-center justify-center gap-[clamp(28px,7vw,44px)] px-[24px] pb-[10vh]"
          >
            {links.map(({ href, label }) =>
              renderLink(
                href,
                label,
                'type-card-title text-cream transition-opacity hover:opacity-75',
                () => setOpen(false),
              ),
            )}

            <ButtonLink
              href={telHref()}
              variant="secondary"
              onClick={() => setOpen(false)}
              className="mt-[clamp(12px,4vw,24px)]"
            >
              <span className="font-latin">{SITE.phone.display}</span>
            </ButtonLink>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
