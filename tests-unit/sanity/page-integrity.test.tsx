/**
 * SANITY E: page integrity on the rendered home page.
 *
 * History: nav anchors pointed at ids that a refactor removed (silent dead links), text slipped
 * outside the type scale when a wrapper lost its type-* class, and the squeezed inline nav came
 * back on mobile (13px links).
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { classTokens, desktopNav, expectNone, hamburger, hasClass, renderHome, textNodes } from './helpers';

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
