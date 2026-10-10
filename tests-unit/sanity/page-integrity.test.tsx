/**
 * SANITY E: page integrity on the rendered home page.
 *
 * History: nav anchors pointed at ids that a refactor removed (silent dead links), text slipped
 * outside the type scale when a wrapper lost its type-* class, and the squeezed inline nav came
 * back on mobile (13px links).
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  classTokens,
  desktopNav,
  expectNone,
  hamburger,
  hasClass,
  renderHome,
  textNodes,
} from './helpers';

let home: HTMLElement;
beforeAll(async () => {
  home = await renderHome();
});

describe('E10: in-page anchors resolve', () => {
  it('every href="#x" on the page targets an element with id x', () => {
    const links = Array.from(home.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    expect(links.length, 'in-page anchors (nav, hero, CTAs)').toBeGreaterThanOrEqual(6);
    const ids = new Set(Array.from(home.querySelectorAll('[id]')).map((e) => e.id));
    const dead = links
      .map((a) => a.getAttribute('href')!.slice(1))
      .filter((id) => id.length > 0 && !ids.has(id));
    expectNone([...new Set(dead)].map((id) => `#${id}`), 'dead in-page anchors');
  });

  it('ids are unique on the page', () => {
    const seen = new Map<string, number>();
    home.querySelectorAll('[id]').forEach((e) => seen.set(e.id, (seen.get(e.id) ?? 0) + 1));
    expectNone([...seen].filter(([, n]) => n > 1).map(([id, n]) => `${id} x${n}`), 'duplicate ids');
  });
});

describe('E11: all visible text lives under a type-* class', () => {
  /** Reasons a text node may legitimately sit outside the type scale. Keep this list short. */
  const ALLOWED: Array<{ reason: string; test: (el: Element) => boolean }> = [
    { reason: 'screen-reader only text is not visible', test: (el) => !!el.closest('.sr-only') },
    { reason: 'svg <text>/<title> is artwork, not page copy', test: (el) => !!el.closest('svg') },
    { reason: 'non-rendered containers', test: (el) => !!el.closest('script, style, noscript, template') },
  ];

  it('no visible text node is outside every type-* element', () => {
    const offenders: string[] = [];
    let covered = 0;
    for (const node of textNodes(home)) {
      const el = node.parentElement!;
      if (el.closest('[class*="type-"]')) {
        covered++;
        continue;
      }
      if (ALLOWED.some((a) => a.test(el))) continue;
      offenders.push(`<${el.tagName.toLowerCase()} class="${classTokens(el).slice(0, 4).join(' ')}"> "${node.textContent!.trim().slice(0, 40)}"`);
    }
    expectNone(offenders, 'text outside the type scale (it would inherit the browser/body default size)');
    expect(covered, 'the walker saw too little text: it went blind').toBeGreaterThan(40);
  });
});

describe('E13: navigation collapses below md', () => {
  it('the inline link row is hidden below md (hidden md:flex) and a hamburger exists for < md', () => {
    const nav = desktopNav(home);
    expect(nav, 'desktop nav row (a labelled <nav> with `hidden md:flex`) not found: the squeezed inline nav may be back on mobile').not.toBeNull();
    expect(nav!.querySelectorAll('a').length, 'desktop nav links incl. the phone pill').toBeGreaterThanOrEqual(5);
    const burger = hamburger(home);
    expect(burger, 'hamburger button (aria-controls=mobile-menu, md:hidden) not found').not.toBeNull();
    expect(burger!.getAttribute('aria-label'), 'hamburger needs an accessible name').toBeTruthy();
    expect(hasClass(burger, 'md:hidden'), 'hamburger must disappear from md up').toBe(true);
  });
});

// ─── Checks restated without naming a component or a layout class a refactor may rename ───

/** Every image URL a page can fetch must be root-absolute or https (a bare `images/x.webp` is a relative-URL bug). */
function relativeImageUrls(root: ParentNode): string[] {
  const bad: string[] = [];
  const ok = (u: string) => /^(\/|https:\/\/)/.test(u);
  for (const img of Array.from(root.querySelectorAll('img'))) {
    const src = img.getAttribute('src') ?? '';
    if (!ok(src)) bad.push(`src="${src}"`);
    const srcset = img.getAttribute('srcset');
    if (srcset) {
      for (const candidate of srcset.split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        if (url && !ok(url)) bad.push(`srcset="${url}"`);
      }
    }
  }
  return bad;
}

/** Decorative overlays (aria-hidden svg taken out of flow with `absolute`) must not swallow clicks. */
function clickBlockingOverlays(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll('svg[aria-hidden="true"]'))
    .filter((svg) => hasClass(svg, 'absolute') && !hasClass(svg, 'pointer-events-none'))
    .map((svg) => `<svg class="${classTokens(svg).slice(0, 6).join(' ')}">`);
}

/** A link with no visible text and no labelled image inside has no accessible name unless it carries aria-label. */
function unnamedIconLinks(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>('a'))
    .filter((a) => !(a.textContent ?? '').trim() && !a.querySelector('img[alt]:not([alt=""])') && !a.getAttribute('aria-label')?.trim())
    .map((a) => a.outerHTML.slice(0, 100));
}

describe('E15: image URLs are root-absolute', () => {
  it('every <img src> and srcset candidate on the page starts with "/" or "https://"', () => {
    const imgs = home.querySelectorAll('img');
    expect(imgs.length, 'the page has far fewer images than expected: the walker went blind').toBeGreaterThan(20);
    expectNone(relativeImageUrls(home), 'relative image URLs (a bare images/x.webp resolves against the current route)');
  });

});

describe('E16: decorative overlays never intercept clicks', () => {
  it('every absolutely-positioned aria-hidden svg carries pointer-events-none', () => {
    const overlays = Array.from(home.querySelectorAll('svg[aria-hidden="true"]')).filter((svg) => hasClass(svg, 'absolute'));
    expect(overlays.length, 'the page lost its decorative overlay (the about-intro organic background)').toBeGreaterThanOrEqual(1);
    expectNone(clickBlockingOverlays(home), 'decorative svgs that would block taps on the copy beneath');
  });

});

describe('E17: icon-only links have an accessible name', () => {
  it('every link without visible text (logo, social icons) has an aria-label or a labelled image', () => {
    const iconLinks = Array.from(home.querySelectorAll('a')).filter((a) => !(a.textContent ?? '').trim());
    expect(iconLinks.length, 'no icon-only links found: the walker went blind').toBeGreaterThanOrEqual(2);
    expectNone(unnamedIconLinks(home), 'icon-only links a screen reader announces as just "link"');
  });

});
