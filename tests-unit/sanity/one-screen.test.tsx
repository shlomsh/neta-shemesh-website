/**
 * SANITY B: one-screen heights (desktop contract, phone contract) + the flex chain that makes it work.
 *
 * Desktop (lg+): every solid card is at least one screen. Phone (below lg, NS-39): a card is as tall as
 * its content + padding, except the four "moments" that stay exactly one screen: hero, credentials,
 * CTA band, footer (PHONE table below). The unit decision lives in ONE place (`--card-h`, globals.css);
 * no component spells it (`card-height` ban in source-scan.test.ts).
 *
 * History: the cards were first aspect-ratio driven (sections ran 1.3 screens), then locked to 100svh
 * (content clipped on short viewports), then given a 720px floor and a height-driven flex chain
 * Section -> Container -> grid -> frame. Breaking any link (a lost `lg:min-h-0`, an aspect ratio left on
 * at lg, an `overflow-hidden` on <main>) makes the photos overflow or the card collapse, and nothing in
 * jsdom shows it except the classes.
 *
 * Section publishes `data-fit="lock|grow|free"` and `data-phone`; the helpers accept them only when the
 * implementing classes agree, so neither a label that lies nor classes that lost their label pass.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  EXPECTED_SECTIONS,
  SOLID_SECTIONS,
  classTokens,
  coversImage,
  findSection,
  fitOf,
  globalsCss,
  hasClass,
  hasDesktopRhythm,
  hasLgMinScreen,
  hasMinScreen,
  hasMobileFill,
  hasPhoneContentHeight,
  isFlexColumn,
  isFlexContainer,
  isGrowItem,
  isHeightDrivenFrame,
  isStretchedMapFrame,
  keepsAspectAtDesktop,
  labelOf,
  minHeightKind,
  oneScreenMode,
  overflowOf,
  phoneMode,
  phoneOf,
  renderHome,
  stripCssComments,
  topLevelSections,
  type Fit,
  type MinHeightKind,
  type OneScreenMode,
  type PhoneMode,
} from './helpers';

let home: HTMLElement;
beforeAll(async () => {
  home = await renderHome();
});

/**
 * The exact current assignment. A silent flip (lock <-> grow, a lost lg:py-12) must fail.
 *   lock-720 = lg:screen-lock   grow-720 = lg:screen-grow   free = min-h only (content-driven)   (floor 720px = --card-floor)
 * `free` rows (about-credentials, contact-social): CLAUDE.md only requires the one-screen minimum there.
 */
const DESKTOP: Record<string, { mode: OneScreenMode; fit: Fit; py12: boolean }> = {
  'about-intro': { mode: 'lock-720', fit: 'lock', py12: true },
  expertise: { mode: 'grow-720', fit: 'grow', py12: true },
  'about-me': { mode: 'grow-720', fit: 'grow', py12: true },
  'about-credentials': { mode: 'free', fit: 'free', py12: false },
  'about-gallery': { mode: 'lock-720', fit: 'lock', py12: true },
  services: { mode: 'lock-720', fit: 'lock', py12: true },
  'testimonials-gallery': { mode: 'lock-720', fit: 'lock', py12: true },
  'contact-social': { mode: 'free', fit: 'free', py12: false },
  'contact-office': { mode: 'lock-720', fit: 'lock', py12: true },
};

/** Phone contract (below lg): content height by default; ONLY these stay one screen (plus the bespoke hero and footer). */
const PHONE: Record<string, PhoneMode> = {
  'about-intro': 'content',
  expertise: 'content',
  'about-me': 'content',
  'about-credentials': 'screen',
  'about-gallery': 'content',
  services: 'content',
  'testimonials-gallery': 'content',
  'contact-social': 'content',
  'contact-office': 'content',
  'cta-band': 'screen',
};

describe('B6: every solid section is at least one screen from lg, with the agreed desktop and phone modes', () => {
  it('the tables cover exactly the solid sections (PHONE adds the CTA band)', () => {
    const solid = SOLID_SECTIONS.map((s) => s.name).sort();
    expect(Object.keys(DESKTOP).sort(), 'DESKTOP table and EXPECTED_SECTIONS solid sections diverged: add/remove the row').toEqual(solid);
    expect(Object.keys(PHONE).sort()).toEqual([...solid, 'cta-band'].sort());
  });

  it.each(Object.keys(DESKTOP))('%s: at least one screen from lg, with the agreed lock/grow assignment', (name) => {
    const el = findSection(home, name);
    const want = DESKTOP[name];
    expect(hasLgMinScreen(el), `${labelOf(el, name)} lost its lg+ one-screen minimum`).toBe(true);
    expect(fitOf(el), `${labelOf(el, name)} data-fit changed (expected ${want.fit})`).toBe(want.fit);
    expect(oneScreenMode(el), `${labelOf(el, name)}: data-fit and the classes disagree, or the mode changed (expected ${want.mode})`).toBe(want.mode);
    expect(hasDesktopRhythm(el), `${labelOf(el, name)} desktop padding (lg:py-12) expectation (${want.py12}) changed`).toBe(want.py12);
  });

  it.each(Object.keys(PHONE))('%s: its phone mode is published as data-phone AND implemented by the classes', (name) => {
    const el = findSection(home, name);
    const want = PHONE[name];
    expect(phoneOf(el), `${labelOf(el, name)} data-phone changed (expected ${want})`).toBe(want);
    expect(phoneMode(el), `${labelOf(el, name)}: data-phone and the classes disagree (expected ${want})`).toBe(want);
    if (want === 'screen') expect(hasMobileFill(el), `${labelOf(el, name)} lost screen-fit (or carries a hand-written min-h-lvh)`).toBe(true);
    else expect(hasPhoneContentHeight(el), `${labelOf(el, name)} carries a min-height / height below lg: a phone card sizes to its content`).toBe(true);
  });

  it('photo sections (hero, CTA band, footer) still fill a screen at minimum at every width; hero and footer are bespoke (no data-fit)', () => {
    for (const spec of EXPECTED_SECTIONS.filter((s) => s.kind === 'photo')) {
      const el = findSection(home, spec.name);
      expect(hasMinScreen(el), `${labelOf(el, spec.name)} lost its all-breakpoint one-screen minimum`).toBe(true);
    }
    expect(fitOf(findSection(home, 'cta-band')), 'the CTA band is a free-fit photo band').toBe('free');
    for (const name of ['hero', 'footer']) expect(findSection(home, name).hasAttribute('data-fit'), `${name} is bespoke and must not claim a Section fit`).toBe(false);
  });

  it('no top-level section carries a data-fit outside the tables (a new fit must be added deliberately)', () => {
    const known = new Set([...Object.keys(DESKTOP), 'cta-band'].map((n) => findSection(home, n)));
    expect(topLevelSections(home).filter((s) => s.hasAttribute('data-fit') && !known.has(s)).map((s) => labelOf(s))).toEqual([]);
  });

  it('the footer fills the VISIBLE screen (screen-visible) with its content centred between the top and the copyright', () => {
    const el = findSection(home, 'footer');
    expect(hasClass(el, 'screen-visible'), 'footer lost screen-visible (phones show a sliver of the previous card once the toolbar collapses)').toBe(true);
    expect(hasClass(el, 'justify-between'), 'justify-between leaves an empty void between the content and the copyright').toBe(false);
    const column = el.querySelector(':scope > div.relative.z-10');
    expect(column && hasClass(column, 'my-auto'), 'the tagline/CTA/signature group is no longer vertically centred').toBe(true);
  });

  it('the card-height unit decision lives in ONE place: --card-h (svh; lvh below lg, @supports-gated) and the utilities that read it', () => {
    const css = stripCssComments(globalsCss()).replace(/\s+/g, ' ');
    expect(css, ':root --card-h default').toMatch(/:root \{[^}]*--card-h: 100svh;/);
    expect(css, '--hero-h default').toMatch(/--hero-h: 100svh;/);
    expect(css, '--card-h and --hero-h are 100lvh below lg (theme(--breakpoint-lg) = 64rem), only where lvh is supported').toMatch(/@supports \(height: 100lvh\) \{ @media \(width < theme\(--breakpoint-lg\)\) \{ :root \{ --card-h: 100lvh; --hero-h: 100lvh; \} \} \}/);
    expect(css, '--hero-h overshoots 100lvh by 80px on iOS 26 Safari only (floating bottom bar), below lg').toMatch(/@supports \(-webkit-touch-callout: none\) and \(anchor-name: --a\) \{ @media \(width < theme\(--breakpoint-lg\)\) \{ :root \{ --hero-h: calc\(100lvh \+ 80px\); \} \} \}/);
    expect(css, 'hero-fit reads the hero token').toMatch(/@utility hero-fit \{ min-height: var\(--hero-h\); \}/);
    expect(css, 'the lock / grow floor is one token, 45rem (= 720px at the default root)').toMatch(/:root \{[^}]*--card-floor: 45rem;/);
    expect(css, 'screen-lock = one screen (the token) but never below the floor, exactly').toMatch(/@utility screen-lock \{ height: max\(var\(--card-h\), var\(--card-floor\)\); \}/);
    expect(css, 'screen-lock-exact = the token, no floor (Expertise)').toMatch(/@utility screen-lock-exact \{ height: var\(--card-h\); \}/);
    expect(css, 'screen-grow = the same value as a minimum').toMatch(/@utility screen-grow \{ min-height: max\(var\(--card-h\), var\(--card-floor\)\); \}/);
    expect(css, 'screen-fit reads the token').toMatch(/@utility screen-fit \{ min-height: var\(--card-h\); \}/);
    expect(css, 'screen-visible = token, upgraded to dvh where supported (the one dvh exception)').toMatch(/@utility screen-visible \{ min-height: var\(--card-h\); @supports \(height: 100dvh\) \{ min-height: 100dvh; \} \}/);
  });
});

describe('B7: height-driven flex chain per section', () => {
  /** Photo-bearing locked sections: how many cover images the grid holds, and its min-height token. */
  const CHAINS: Array<{ name: string; imgs: number; minH: MinHeightKind }> = [
    { name: 'about-intro', imgs: 3, minH: 'zero' },
    { name: 'expertise', imgs: 4, minH: 'floor-320' },
    { name: 'about-gallery', imgs: 3, minH: 'floor-320' },
    { name: 'services', imgs: 4, minH: 'zero' },
    { name: 'testimonials-gallery', imgs: 6, minH: 'floor-320' },
  ];

  /** Deepest element that is `lg:flex-1` and holds all the section's cover images = the photo grid. */
  function photoGrid(section: Element, imgs: number): Element | undefined {
    return Array.from(section.querySelectorAll('*'))
      .filter((e) => isGrowItem(e) && e.querySelectorAll('img').length >= imgs)
      .sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length)[0];
  }

  it.each(CHAINS)('$name: the grid grows, every link up to the section is a flex item, and the photos crop inside height-driven frames', ({ name, imgs, minH }) => {
    const section = findSection(home, name);
    const grid = photoGrid(section, imgs);
    expect(grid, `${labelOf(section, name)} lost its lg:flex-1 photo grid (${imgs} images)`).toBeDefined();
    expect(minHeightKind(grid), `${labelOf(section, name)} grid min-height escape changed`).toBe(minH);
    expect(isFlexColumn(section), `${labelOf(section, name)} must itself be a flex column`).toBe(true);

    // grid -> ... -> section: each link must stretch (lg:flex-1 + a min-h escape) inside a flex parent.
    for (let node: Element | null = grid!; node && node !== section; node = node.parentElement) {
      const where = `${labelOf(section, name)} chain link <${node.tagName.toLowerCase()} class="${classTokens(node).slice(0, 4).join(' ')}...">`;
      expect(isGrowItem(node), `${where} stopped growing (lost lg:flex-1)`).toBe(true);
      expect(minHeightKind(node), `${where} lost its min-height escape (flex item would not shrink)`).not.toBeNull();
      expect(isFlexContainer(node.parentElement), `${where} parent is not a flex container, so the grow does nothing`).toBe(true);
    }

    // The lg+ stage photos only: phone-only copies (inside an `lg:hidden` panel) have no desktop frame.
    const photos = Array.from(grid!.querySelectorAll('img')).filter((img) => !img.closest('.lg\\:hidden'));
    expect(photos.length, `${labelOf(section, name)} photo count`).toBe(imgs);
    for (const [i, img] of photos.entries()) {
      const where = `${labelOf(section, name)} photo #${i + 1}`;
      expect(coversImage(img), `${where} lost object-cover`).toBe(true);
      let frame = false;
      for (let node: Element | null = img.parentElement; node && node !== grid; node = node.parentElement) {
        if (isHeightDrivenFrame(node)) frame = true;
        expect(keepsAspectAtDesktop(node), `${where}: an aspect ratio stays on at lg and fights the flex height`).toBe(false);
      }
      expect(frame, `${where} has no height-driven frame`).toBe(true);
    }
  });

  it('contact-office: the map wrapper stretches (lg:h-full, 360px floor) in an items-stretch grid inside the card, which the section centres', () => {
    const section = findSection(home, 'contact-office');
    const wrapper = section.querySelector('[data-map-embed]')!;
    const grid = wrapper.parentElement!;
    expect(isStretchedMapFrame(wrapper), `${labelOf(section, 'contact-office')} map wrapper lost its stretch / 360px floor`).toBe(true);
    expect(hasClass(grid, 'items-stretch'), 'map grid lost items-stretch').toBe(true);
    expect(section.querySelector('[data-bg-tone="cream"]')!.contains(grid), 'map grid left the cream card').toBe(true);
    expect(hasClass(section, 'justify-center'), 'the card hugs its content and is centred by the section').toBe(true);
  });
});

describe('B8: <main> is a clip, not a scroll container', () => {
  it('main has overflow-clip and never overflow-hidden (hidden would kill soft snap and sticky)', () => {
    expect(overflowOf(home.querySelector('main')!), '<main> must clip (overflow-clip)').toBe('clip');
  });
});
