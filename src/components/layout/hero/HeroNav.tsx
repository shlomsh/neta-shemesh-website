'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

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
 * (#about scrolls in-page). Pass '/' from blog pages so the links become
 * /#about (full-document navigation, avoids App Router hash-stacking bug).
 *
 * Rule: use <Link> only for hash-free routes (/blog, /). Hash links — even
 * cross-route ones like /#about — always use plain <a> so the browser does
 * a full navigation that reliably replaces the fragment.
 */
export function HeroNav({ basePath = '' }: { basePath?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const links = [
    { href: `${basePath}#about`,     label: 'קצת עליי' },
    { href: `${basePath}#expertise`, label: 'התמחות' },
    { href: '/blog',                  label: 'מאמרים' },
    { href: `${basePath}#contact`,   label: 'יצירת קשר' },
  ];

  // Lock body scroll + close on Escape while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const desktopLinkClass = `
    text-[var(--color-white)]
    font-[family-name:var(--font-stanga)]
    font-bold
    text-[clamp(14px,1.6vw,18px)]
    md:text-[20px]
    leading-[1.5]
    tracking-[0.047em]
    transition-opacity
    hover:opacity-75
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

  const phoneBadgeClass = `
    inline-flex items-center justify-center
    bg-[var(--color-brand-primary)]/75
    hover:bg-[var(--color-brand-primary)]
    rounded-2xl
    text-[var(--color-white)]
    font-[family-name:var(--font-stanga)]
    font-bold
    tracking-[0.138em]
    leading-[1.375]
    transition-colors
    whitespace-nowrap
  `;

  return (
    <>
      {/* ── Desktop nav (md and up) ── */}
      <nav
        dir="rtl"
        aria-label="ניווט ראשי"
        className="hidden md:flex items-center justify-center gap-[clamp(24px,4vw,56px)]"
      >
        {links.map(({ href, label }) => renderLink(href, label, desktopLinkClass))}

        <a
          href="tel:+972545711060"
          className={`${phoneBadgeClass} px-[clamp(16px,2.5vw,32px)] h-[clamp(44px,5.4vw,54px)] text-[clamp(13px,1.4vw,17px)] md:text-[20px]`}
        >
          054-571-1060
        </a>
      </nav>

      {/* ── Mobile hamburger (below md) ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="פתיחת תפריט"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="md:hidden inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl text-[var(--color-white)] transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-white)]"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ── Mobile overlay menu ── */}
      {/* Portaled to <body>: framer-motion's `will-change` on the ScrollReveal
          ancestor establishes a containing block that would otherwise trap
          this position:fixed overlay inside the top bar. */}
      {mounted && open && createPortal(
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט ניווט"
          dir="rtl"
          className="fixed inset-0 z-[100] md:hidden flex flex-col bg-[var(--color-plum)]"
        >
          <div className="flex items-center justify-end px-[clamp(20px,5vw,40px)] py-[clamp(20px,4vw,32px)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגירת תפריט"
              className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl text-[var(--color-white)] transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-white)]"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </button>
          </div>

          <nav
            aria-label="ניווט ראשי"
            className="flex flex-1 flex-col items-center justify-center gap-[clamp(28px,7vw,44px)] px-[24px] pb-[10vh]"
          >
            {links.map(({ href, label }) =>
              renderLink(
                href,
                label,
                'text-[var(--color-white)] font-[family-name:var(--font-stanga)] font-bold text-[clamp(26px,8vw,36px)] leading-[1.2] tracking-[0.02em] transition-opacity hover:opacity-75',
                () => setOpen(false),
              ),
            )}

            <a
              href="tel:+972545711060"
              onClick={() => setOpen(false)}
              className={`${phoneBadgeClass} mt-[clamp(12px,4vw,24px)] px-[40px] h-[60px] text-[20px]`}
            >
              054-571-1060
            </a>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
