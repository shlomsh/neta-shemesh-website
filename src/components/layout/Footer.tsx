/**
 * Footer — ground-up rebuild (Track C / BRUTAL stance).
 *
 * Spec: docs/tokens/footer.md (GATE 1 ratified 2026-06-19)
 *
 * Layout stack:
 *   photo (z-0, object-fit:cover)
 *   → scrim gradient (z-0, pointer-events:none) — dark overlay for legibility
 *   → content column (z-10, centered flex column, dir=rtl)
 *       tagline → CTA+badges → brand → copyright
 *
 * Rules:
 * - px/clamp/% only — no Tailwind rem utilities (py-32, gap-6, max-w-6xl, etc.)
 * - No SectionBand, no AnimatedBlock, no canva-source/styles.css globals
 * - No global keyframes — local reveal via FooterReveal (framer-motion)
 * - Badge shapes hidden at ≤768px
 */

import Image from 'next/image';
import { Badge } from '../primitives/Badge';
import { FooterReveal } from './FooterReveal';

export default function Footer() {
  return (
    <footer
      id="MDSsSYj5iYQgOZ6x"
      dir="rtl"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        /* Tall, cinematic band: 720px at 1280, fluid below */
        minHeight: 'clamp(560px, 56.25vw, 720px)',
        width: '100%',
        boxSizing: 'border-box',
        /* Vertical padding so copyright can breathe near the bottom */
        paddingTop: 'clamp(48px, 7vw, 90px)',
        paddingBottom: 'clamp(32px, 5vw, 64px)',
      }}
    >
      {/* ── Layer 0: background photo ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/images/c2507e38710af194875f96c8ec7aca70.jpg"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: '50% 50%' }}
          priority
        />
      </div>

      {/* ── Layer 0: dark gradient scrim (legibility across full width) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(to bottom, rgba(30,18,30,0.55) 0%, rgba(20,10,20,0.70) 60%, rgba(10,5,10,0.80) 100%)',
        }}
      />

      {/* ── Layer 10: centered content column ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          /* Flex-grow the inner column so copyright can be pushed to the bottom */
          flex: '1 0 auto',
          gap: 0,
        }}
      >
        {/* 1. Tagline */}
        <FooterReveal delay={0}>
          <p
            id="Jlq0wYkaWE3FGqH9"
            style={{
              fontFamily: 'var(--font-canva-secondary)',
              fontSize: 'clamp(24px, 4.4vw, 56px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 400,
              color: 'var(--color-white)',
              textAlign: 'center',
              maxWidth: '894px',
              width: '90%',
              margin: '0 auto',
              padding: 0,
            }}
          >
            התגברו על אתגרים וחדשו את הקשר הרגשי והפיזי.
          </p>
        </FooterReveal>

        {/* 2. CTA link + 3 hand-drawn badge shapes */}
        <FooterReveal delay={0.1} style={{ marginTop: 'clamp(60px, 7vw, 100px)' }}>
          {/*
           * Badges: 3 overlapping SVG shapes behind the CTA text.
           * They are stacked absolutely, centred on the link.
           * Hidden at ≤768px (matchs token-sheet: "CTA highlight HIDDEN on mobile").
           */}
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Badge shapes — desktop only */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-16px -24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                /* Hidden on mobile */
                /* We use a CSS custom property trick — but we can't use Tailwind, so
                   we rely on a style tag approach via a wrapper data attribute.
                   Instead: use a wrapping div that's display:none at ≤768 via inline style
                   with a media query. Since inline style can't express media queries, we
                   use a class we define only here in the component via a <style> tag scoped
                   to this component (acceptable: this is NOT globals.css). */
              }}
              className="footer-badge-wrapper"
            >
              <Badge
                svgId="Q8pZ6GsYbthSW5Bz"
                viewBox="0 0 427.9183 53.3292"
                opacity={0.75}
                gId="VE6EXKLGABIYl44E"
                pathId="UOlKvnkYOUCW6aLP"
                d="M427.91828482,0 L427.91828482,1 L427.91828482,52.32920203 L427.91828482,53.32920203 L426.91828482,53.32920203 L1,53.32920203 L0,53.32920203 L0,52.32920203 L0,1 L0,0 L1,0 L426.91828482,0 L427.91828482,0 Z"
                fillColor="var(--color-brand-primary)"
              />
              <Badge
                svgId="i9QF0jordDPdnM4h"
                viewBox="0 0 419.0019 75.7757"
                opacity={0.75}
                gId="FLCZndJVbQJ7hBJe"
                pathId="v1kwUaJC5ZaEruV7"
                d="M419.00187108,0 L419.00187108,1 L419.00187108,74.77573083 L419.00187108,75.77573083 L418.00187108,75.77573083 L1,75.77573083 L0,75.77573083 L0,74.77573083 L0,1 L0,0 L1,0 L418.00187108,0 L419.00187108,0 Z"
                fillColor="var(--color-brand-primary)"
              />
              <Badge
                svgId="ErRGi2JkdUoGTEsR"
                viewBox="0 0 320.7983 70.8405"
                opacity={0.75}
                gId="cjexrpkKxf6VNHUk"
                pathId="BPT1G3lVNMZEOPA3"
                d="M320.79830754,0 L320.79830754,1 L320.79830754,69.84048428 L320.79830754,70.84048428 L319.79830754,70.84048428 L1,70.84048428 L0,70.84048428 L0,69.84048428 L0,1 L0,0 L1,0 L319.79830754,0 L320.79830754,0 Z"
                fillColor="var(--color-brand-primary)"
              />
            </div>

            {/* CTA text link */}
            <a
              id="t7mpFHkutgAWck7G"
              href="#contact"
              style={{
                fontFamily: 'var(--font-canva-primary)',
                fontSize: 'clamp(15px, 1.4vw, 18px)',
                letterSpacing: '0.138em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--color-white)',
                textDecoration: 'none',
                position: 'relative',
                zIndex: 1,
                display: 'inline-block',
                padding: '8px 0',
              }}
            >
              מוזמנים ליצור איתי קשר
            </a>
          </div>
        </FooterReveal>

        {/* 3. Brand name */}
        <FooterReveal delay={0.2} style={{ marginTop: 'clamp(60px, 7vw, 100px)' }}>
          <p
            id="jkbtaL3OlM9XL5RY"
            style={{
              fontFamily: 'var(--font-canva-accent)',
              fontSize: 'clamp(34px, 2.9vw, 38px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 400,
              color: 'var(--color-white)',
              textAlign: 'center',
              margin: 0,
              padding: 0,
            }}
          >
            נטע שמש
          </p>
        </FooterReveal>

        {/* 4. Copyright — pinned near band's bottom */}
        <FooterReveal delay={0.3} style={{ marginTop: 'clamp(24px, 3vw, 40px)' }}>
          <p
            id="oitsbKLtGbXNCxEY"
            style={{
              fontFamily: 'var(--font-canva-primary)',
              fontSize: 'clamp(14px, 1.25vw, 16px)',
              letterSpacing: '0.012em',
              lineHeight: 1.5,
              fontWeight: 400,
              color: 'var(--color-white)',
              textAlign: 'center',
              margin: 0,
              padding: 0,
            }}
          >
            כל הזכויות שמורות © 2026.
          </p>
        </FooterReveal>
      </div>

      {/*
       * Scoped style for the badge wrapper visibility.
       * We cannot use Tailwind for media queries in JSX (no class name available
       * without Tailwind postcss). This <style> tag is the minimal local CSS
       * that governs ONE class, touching nothing global.
       */}
      <style>{`
        .footer-badge-wrapper {
          display: flex;
        }
        @media (max-width: 768px) {
          .footer-badge-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </footer>
  );
}
