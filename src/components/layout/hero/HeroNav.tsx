import Link from 'next/link';

/**
 * HeroNav — top-of-hero navigation pill with section + blog links.
 *
 * Same-page anchors (#about, #expertise, #contact) use plain <a>; the blog
 * route (/blog) uses next/link for client-side navigation.
 * Server component; no client-side state needed.
 */
export function HeroNav() {
  const links = [
    { href: '#about',     label: 'קצת עליי' },
    { href: '#expertise', label: 'התמחות' },
    { href: '/blog',      label: 'מאמרים' },
    { href: '#contact',   label: 'יצירת קשר' },
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
        href.startsWith('/') ? (
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
