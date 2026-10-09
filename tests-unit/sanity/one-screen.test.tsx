/**
 * SANITY B: one-screen heights (desktop contract) + the flex chain that makes it work.
 *
 * History: the cards were first aspect-ratio driven (content decided the height, sections ran
 * 1.3 screens), then locked to 100svh (content clipped on short viewports), then given a 720px
 * floor and a height-driven flex chain Section -> Container -> grid -> frame. Breaking any link
 * (a lost `lg:min-h-0`, an aspect ratio left on at lg, an `overflow-hidden` on <main>) makes
 * the photos overflow or the card collapse, and nothing in jsdom shows it except the classes.
 *
 * Section publishes `data-fit="lock|grow|free"`; the helpers (oneScreenMode / isOneScreen) accept it
 * only when the implementing classes agree, so neither a data-fit that lies nor classes that lost
 * their data-fit pass. The per-section expectations below are the single place the assignment lives.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  EXPECTED_SECTIONS,
  SOLID_SECTIONS,
  classMode,
  classTokens,
  coversImage,
  findSection,
  fitOf,
  hasClass,
  hasDesktopRhythm,
  hasFullHeight,
  hasMinScreen,
  isFlexColumn,
  isFlexContainer,
  isGrowItem,
  isHeightDrivenFrame,
  isOneScreen,
  isStretchedMapFrame,
  isVerticallyCentered,
  keepsAspectAtDesktop,
  labelOf,
  minHeightKind,
  oneScreenMode,
  overflowOf,
  renderHome,
  stretchesItems,
  topLevelSections,
  type Fit,
  type MinHeightKind,
  type OneScreenMode,
} from './helpers';

let home: HTMLElement;
beforeAll(async () => {
  home = await renderHome();
});

/**
 * The exact current assignment. A silent flip (lock <-> grow, a lost lg:py-12) must fail.
 *   lock-720 = lg:h-[max(100svh,720px)]   lock-100 = lg:h-[100svh]
 *   grow-720 = lg:min-h-[max(100svh,720px)]   free = min-h only (content-driven)
 */
// `free` rows (about-credentials, contact-social): CLAUDE.md only requires min-h-[100svh] there; they
// are content-driven past one screen on purpose, so no lock/grow is expected. Changing a row is a
// deliberate decision, not drift.
const DESKTOP: Record<string, { mode: OneScreenMode; fit: Fit; py12: boolean }> = {
  'about-intro': { mode: 'lock-720', fit: 'lock', py12: true },
  expertise: { mode: 'lock-100', fit: 'lock', py12: true },
  'about-me': { mode: 'grow-720', fit: 'grow', py12: true },
  'about-credentials': { mode: 'free', fit: 'free', py12: false },
  'about-gallery': { mode: 'lock-720', fit: 'lock', py12: true },
  services: { mode: 'lock-720', fit: 'lock', py12: true },
  'testimonials-gallery': { mode: 'lock-720', fit: 'lock', py12: true },
  'contact-social': { mode: 'free', fit: 'free', py12: false },
  'contact-office': { mode: 'lock-720', fit: 'lock', py12: true },
};

describe('B6: every solid section is at least one screen, with the agreed desktop mode', () => {
  it('the table covers exactly the solid sections', () => {
    expect(Object.keys(DESKTOP).sort(), 'DESKTOP table and EXPECTED_SECTIONS solid sections diverged: add/remove the row').toEqual(SOLID_SECTIONS.map((s) => s.name).sort());
  });

  it.each(SOLID_SECTIONS.map((s) => s.name))('%s carries min-h-[100svh] at every breakpoint', (name) => {
    const el = findSection(home, name);
    expect(hasMinScreen(el), `${labelOf(el, name)} lost min-h-[100svh]`).toBe(true);
  });

  it.each(SOLID_SECTIONS.map((s) => s.name))('%s keeps its lock/grow assignment', (name) => {
    const el = findSection(home, name);
    const want = DESKTOP[name];
    expect(fitOf(el), `${labelOf(el, name)} data-fit changed (expected ${want.fit})`).toBe(want.fit);
    expect(classMode(el), `${labelOf(el, name)} classes no longer implement data-fit="${want.fit}" (expected ${want.mode})`).toBe(want.mode);
    expect(oneScreenMode(el), `${labelOf(el, name)} changed desktop mode (expected ${want.mode})`).toBe(want.mode);
    expect(hasDesktopRhythm(el), `${labelOf(el, name)} desktop padding (lg:py-12) expectation (${want.py12}) changed`).toBe(want.py12);
    expect(isOneScreen(el), `${labelOf(el, name)} lost its one-screen height`).toBe(want.mode !== 'free');
  });

  it('photo sections (hero, CTA band, footer) still fill a screen at minimum', () => {
    for (const spec of EXPECTED_SECTIONS.filter((s) => s.kind === 'photo')) {
      const el = findSection(home, spec.name);
      expect(hasMinScreen(el), `${labelOf(el, spec.name)} lost min-h-[100svh]`).toBe(true);
    }
  });

  it('the footer fills the VISIBLE screen: 100dvh where supported, with the 100svh above as the fallback; content centred between the top and the copyright', () => {
    const el = findSection(home, 'footer');
    expect(hasClass(el, 'supports-[height:100dvh]:min-h-dvh'), 'footer lost its dvh upgrade (phones show a sliver of the previous card once the toolbar collapses)').toBe(true);
    expect(hasClass(el, 'justify-between'), 'justify-between leaves an empty void between the content and the copyright').toBe(false);
    const column = el.querySelector(':scope > div.relative.z-10');
    expect(column && hasClass(column, 'my-auto'), 'the tagline/CTA/signature group is no longer vertically centred').toBe(true);
  });

  it('the CTA band is a free-fit photo band (no tone, no desktop lock) and hero/footer publish no data-fit', () => {
    const cta = findSection(home, 'cta-band');
    expect(fitOf(cta), `${labelOf(cta, 'cta-band')} data-fit`).toBe('free');
    expect(oneScreenMode(cta), `${labelOf(cta, 'cta-band')} classes vs data-fit`).toBe('free');
    expect(cta.hasAttribute('data-bg-tone'), 'the CTA band is a photo section: no data-bg-tone').toBe(false);
    for (const name of ['hero', 'footer']) {
      const el = findSection(home, name);
      expect(el.hasAttribute('data-fit'), `${labelOf(el, name)} is bespoke and must not claim a Section fit`).toBe(false);
    }
  });

  it('no top-level section carries a data-fit outside the table (a new fit must be added deliberately)', () => {
    const known = new Set([...Object.keys(DESKTOP), 'cta-band'].map((n) => findSection(home, n)));
    const stray = topLevelSections(home).filter((s) => s.hasAttribute('data-fit') && !known.has(s));
    expect(stray.map((s) => labelOf(s))).toEqual([]);
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

  it.each(CHAINS)('$name: grid grows (min-height: $minH) and every link up to the section is a flex item', ({ name, imgs, minH }) => {
    const section = findSection(home, name);
    const grid = photoGrid(section, imgs);
    expect(grid, `${labelOf(section, name)} lost its lg:flex-1 photo grid (${imgs} images)`).toBeDefined();
    expect(minHeightKind(grid), `${labelOf(section, name)} grid min-height escape changed`).toBe(minH);
    expect(isFlexColumn(section), `${labelOf(section, name)} must itself be a flex column`).toBe(true);

    // Walk grid -> ... -> section: each link must stretch (lg:flex-1 + a min-h escape) inside a flex parent.
    for (let node: Element | null = grid!; node && node !== section; node = node.parentElement) {
      const where = `${labelOf(section, name)} chain link <${node.tagName.toLowerCase()} class="${classTokens(node).slice(0, 4).join(' ')}...">`;
      expect(isGrowItem(node), `${where} stopped growing (lost lg:flex-1)`).toBe(true);
      expect(minHeightKind(node), `${where} lost its min-height escape (flex item would not shrink)`).not.toBeNull();
      expect(isFlexContainer(node.parentElement), `${where} parent is not a flex container, so the grow does nothing`).toBe(true);
    }
  });

  it.each(CHAINS)('$name: photos crop (object-cover) inside height-driven frames, no aspect ratio left on at lg', ({ name, imgs }) => {
    const section = findSection(home, name);
    const grid = photoGrid(section, imgs);
    expect(grid, `${labelOf(section, name)} lost its lg:flex-1 photo grid (${imgs} images)`).toBeDefined();
    const photos = Array.from(grid!.querySelectorAll('img'));
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

  it('about-gallery and about-intro photo frames fill the grid cell with lg:h-full', () => {
    for (const name of ['about-gallery', 'about-intro']) {
      const section = findSection(home, name);
      const frames = Array.from(section.querySelectorAll('.safari-clip'));
      expect(frames.length, `${labelOf(section, name)} frames`).toBe(3);
      for (const f of frames) {
        expect(hasFullHeight(f), `${labelOf(section, name)} photo frame no longer fills its grid cell`).toBe(true);
      }
    }
  });

  it('contact-office: the map wrapper stretches (lg:h-full, 360px floor) in an items-stretch grid inside the card', () => {
    const section = findSection(home, 'contact-office');
    const card = section.querySelector('[data-bg-tone="cream"]')!;
    const iframe = section.querySelector('iframe')!;
    const wrapper = iframe.parentElement!;
    expect(isStretchedMapFrame(wrapper), `${labelOf(section, 'contact-office')} map wrapper lost its stretch / 360px floor`).toBe(true);
    const grid = wrapper.parentElement!;
    expect(stretchesItems(grid), `${labelOf(section, 'contact-office')} map grid lost items-stretch`).toBe(true);
    expect(card.contains(grid), `${labelOf(section, 'contact-office')} map grid left the cream card`).toBe(true);
    expect(isVerticallyCentered(section), `${labelOf(section, 'contact-office')}: the card hugs its content and is centred by the section`).toBe(true);
  });
});

describe('B8: <main> is a clip, not a scroll container', () => {
  it('main has overflow-clip and never overflow-hidden (hidden would kill soft snap)', () => {
    const main = home.querySelector('main')!;
    expect(overflowOf(main), '<main> must clip (overflow-clip); overflow-hidden makes it a scroll container and breaks soft snap').toBe('clip');
  });
});
