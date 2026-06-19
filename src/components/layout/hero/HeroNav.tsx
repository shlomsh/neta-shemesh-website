/**
 * HeroNav — top-of-hero navigation pill with three anchor links.
 *
 * Original had three animated text links: קצת עליי (#about),
 * התמחות (#expertise), יצירת קשר (#contact).
 * Server component; no client-side state needed.
 */
export function HeroNav() {
  const links = [
    { href: '#about',     label: 'קצת עליי' },
    { href: '#expertise', label: 'התמחות' },
    { href: '#contact',   label: 'יצירת קשר' },
  ];

  return (
    <nav
      dir="rtl"
      aria-label="ניווט ראשי"
      className="flex items-center justify-center gap-[clamp(24px,4vw,56px)]"
    >
      {links.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className="
            text-[var(--color-white)]
            font-[family-name:var(--font-stanga)]
            font-bold
            text-[clamp(13px,1.4vw,18px)]
            leading-[1.5]
            tracking-[0.047em]
            transition-opacity
            hover:opacity-75
          "
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
