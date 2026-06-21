import Link from 'next/link';

/**
 * BlogHeader — slim top bar for blog pages (server component).
 *
 * The homepage HeroNav is coupled to the hero, so blog routes get their own
 * lightweight header: brand logo links home, anchors deep-link back into the
 * single-page homepage sections, "מאמרים" marks the current section.
 *
 * Sits on a plum band so it reads correctly regardless of what follows.
 *
 * Cross-route hash links (/#about, …) use a plain <a>, not next/link. The App
 * Router's soft navigation mishandles hashes after a Back navigation: returning
 * to /blog leaves "#about" in the router's internal URL, so a subsequent
 * router.push('/#expertise') *appends* the fragment (→ /#about#expertise). A
 * full-document navigation always replaces the fragment cleanly. Only the
 * hash-free routes (/, /blog) keep next/link for client-side nav.
 */
const LINKS = [
  { href: '/#about', label: 'קצת עליי' },
  { href: '/#expertise', label: 'התמחות' },
  { href: '/blog', label: 'מאמרים' },
  { href: '/#contact', label: 'יצירת קשר' },
];

export function BlogHeader() {
  return (
    <header
      dir="rtl"
      className="w-full bg-[var(--color-plum)]"
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-[16px] px-[clamp(16px,4vw,48px)] py-[clamp(14px,2vw,22px)]">
        <Link href="/" aria-label="לעמוד הבית" className="shrink-0">
          <img
            src="/images/logo-horizontal-light.webp"
            alt="נטע שמש"
            className="h-[clamp(32px,4vw,44px)] w-auto"
          />
        </Link>

        <nav aria-label="ניווט בלוג" className="flex items-center gap-[clamp(14px,3vw,40px)]">
          {LINKS.map(({ href, label }) => {
            const linkClass =
              'font-[family-name:var(--font-stanga)] font-bold text-[clamp(13px,1.4vw,18px)] md:text-[20px] leading-[1.5] tracking-[0.047em] text-[var(--color-cream)] transition-opacity hover:opacity-75';
            return href.includes('#') ? (
              <a key={href} href={href} className={linkClass}>
                {label}
              </a>
            ) : (
              <Link key={href} href={href} className={linkClass}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
