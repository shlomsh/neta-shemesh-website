import Link from 'next/link';

/**
 * HeroNav — navigation pill used both in the hero and the blog header.
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
  const links = [
    { href: `${basePath}#about`,     label: 'קצת עליי' },
    { href: `${basePath}#expertise`, label: 'התמחות' },
    { href: '/blog',                  label: 'מאמרים' },
    { href: `${basePath}#contact`,   label: 'יצירת קשר' },
  ];

  const linkClass = `
    text-[var(--color-white)]
    font-[family-name:var(--font-stanga)]
    font-bold
    text-[clamp(13px,1.4vw,18px)]
    md:text-[20px]
    leading-[1.5]
    tracking-[0.047em]
    transition-opacity
    hover:opacity-75
  `;

  return (
    <nav
      dir="rtl"
      aria-label="ניווט ראשי"
      className="flex items-center justify-center gap-[clamp(24px,4vw,56px)]"
    >
      {links.map(({ href, label }) =>
        href.startsWith('/') && !href.includes('#') ? (
          <Link key={href} href={href} className={linkClass}>
            {label}
          </Link>
        ) : (
          <a key={href} href={href} className={linkClass}>
            {label}
          </a>
        ),
      )}

      {/* Phone badge */}
      <a
        href="tel:+972545711060"
        className="
          inline-flex items-center justify-center
          bg-[var(--color-brand-primary)]/75
          hover:bg-[var(--color-brand-primary)]
          rounded-2xl
          px-[clamp(16px,2.5vw,32px)]
          h-[clamp(44px,5.4vw,54px)]
          text-[var(--color-white)]
          font-[family-name:var(--font-stanga)]
          font-bold
          text-[clamp(13px,1.4vw,17px)]
          md:text-[20px]
          tracking-[0.138em]
          leading-[1.375]
          transition-colors
          whitespace-nowrap
        "
      >
        054-571-1060
      </a>
    </nav>
  );
}
