import { NAV_LINKS } from '@/content/home/nav';
import { anchorHref } from '@/content/ids';
import { MobileNav } from './MobileNav';
import { NavLink } from './NavLink';

/**
 * SiteNav: the navigation used both in the hero and the blog header.
 *
 * A server component. Only the hamburger and its overlay need client state, and they live in MobileNav.
 *
 * The homepage hero can keep the full navigation visible on mobile with `expandedOnMobile`.
 * Other uses, including the blog header, retain the hamburger overlay below md.
 *
 * crossRoute: false (default) on the homepage, where #about-me scrolls in-page. Pass true from
 * blog pages so the links become /#about-me (full-document navigation, avoids App Router
 * hash-stacking bug).
 */
const desktopLinkClass = (lightSurface: boolean, expandedOnMobile: boolean) => `
    ${expandedOnMobile ? 'type-quote' : 'type-lead'}
    ${lightSurface ? 'text-plum' : 'text-cream'}
    font-bold
    transition-opacity
    hover:opacity-75
    focus-ring
    focus-visible:ring-${lightSurface ? 'plum' : 'cream'}
    rounded-tile
  `;

export function SiteNav({
  crossRoute = false,
  lightSurface = false,
  expandedOnMobile = false,
}: {
  crossRoute?: boolean;
  lightSurface?: boolean;
  expandedOnMobile?: boolean;
}) {
  const links = NAV_LINKS.map((link) => ({
    label: link.label,
    href: link.anchor !== undefined ? anchorHref(link.anchor, crossRoute ? '/' : '') : link.route,
  }));

  return (
    <>
      {/* ── Inline nav ── */}
      <nav
        aria-label="ניווט ראשי"
        className={expandedOnMobile
          ? 'flex w-full flex-wrap items-center justify-center gap-x-stack gap-y-2 md:w-auto md:flex-nowrap md:gap-region'
          : 'hidden items-center justify-center gap-region md:flex'}
      >
        {links.map(({ href, label }) => (
          <NavLink key={href} href={href} label={label} className={desktopLinkClass(lightSurface, expandedOnMobile)} />
        ))}

      </nav>

      {/* ── Mobile hamburger + overlay (below md) ── */}
      {!expandedOnMobile && <MobileNav links={links} lightSurface={lightSurface} />}
    </>
  );
}
