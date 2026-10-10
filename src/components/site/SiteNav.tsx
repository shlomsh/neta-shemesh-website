import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { NAV_LINKS } from '@/content/home/nav';
import { anchorHref } from '@/content/ids';
import { SITE, telHref } from '@/content/site';
import { MobileNav } from './MobileNav';
import { NavLink } from './NavLink';

/**
 * SiteNav: the navigation used both in the hero and the blog header.
 *
 * A server component. Only the hamburger and its overlay need client state, and they live in MobileNav.
 *
 * Responsive behaviour:
 *   - md and up  → inline pill nav (links + phone badge), as before.
 *   - below md   → a hamburger button that opens a full-screen overlay menu (MobileMenu).
 *                  The old inline nav squeezed 4 links + a phone pill into one
 *                  row at 375px, collapsing the link text to 13px (below the
 *                  14px legibility floor). The overlay gives each link a large
 *                  tap target instead.
 *
 * crossRoute: false (default) on the homepage, where #about-me scrolls in-page. Pass true from
 * blog pages so the links become /#about-me (full-document navigation, avoids App Router
 * hash-stacking bug).
 */
const desktopLinkClass = `
    type-lead
    text-cream
    font-bold
    transition-opacity
    hover:opacity-75
    focus-ring
    focus-visible:ring-cream
    rounded-tile
  `;

export function SiteNav({ crossRoute = false }: { crossRoute?: boolean }) {
  const links = NAV_LINKS.map((link) => ({
    label: link.label,
    href: link.anchor !== undefined ? anchorHref(link.anchor, crossRoute ? '/' : '') : link.route,
  }));

  return (
    <>
      {/* ── Desktop nav (md and up) ── */}
      <nav
        aria-label="ניווט ראשי"
        className="hidden md:flex items-center justify-center gap-region"
      >
        {links.map(({ href, label }) => (
          <NavLink key={href} href={href} label={label} className={desktopLinkClass} />
        ))}

        <ButtonLink href={telHref()} variant="secondary" size="sm">
          <span dir="ltr" className="font-latin">{SITE.phone.display}</span>
        </ButtonLink>
      </nav>

      {/* ── Mobile hamburger + overlay (below md) ── */}
      <MobileNav links={links} />
    </>
  );
}
