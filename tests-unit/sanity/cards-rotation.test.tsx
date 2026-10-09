/**
 * SANITY A: card rotation + tone discipline.
 *
 * History: tones were shuffled several times (mauve cards with body copy at 2.26:1, blush cards
 * with 16px paragraphs at 3.89:1, a card wrapped around a subtitle). Each fix risked undoing
 * another, so the whole page is asserted as one picture.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  EXPECTED_SECTIONS,
  QUOTE_OR_LARGER,
  SUBTITLES,
  classTokens,
  findSection,
  hasClass,
  isSurfaceBg,
  kindOf,
  labelOf,
  expectNone,
  matchesSpec,
  renderHome,
  subtitleOf,
  textNodes,
  toneOf,
  topLevelSections,
  typeClassesOf,
} from './helpers';

let home: HTMLElement;
beforeAll(async () => {
  home = await renderHome();
});

describe('A1: rotation order', () => {
  it('top-level sections appear in the exact agreed order with the agreed tone/kind', () => {
    const sections = topLevelSections(home);
    const actual = sections.map((el) => {
      const spec = EXPECTED_SECTIONS.find((s) => matchesSpec(el, s));
      return { name: spec ? spec.name : `UNKNOWN ${labelOf(el)}`, kind: kindOf(el), label: labelOf(el) };
    });
    const mismatches: string[] = [];
    EXPECTED_SECTIONS.forEach((want, i) => {
      const got = actual[i];
      if (!got) mismatches.push(`position ${i + 1}: expected ${want.name} (${want.kind}) but the page ends`);
      else if (got.name !== want.name || got.kind !== want.kind) {
        mismatches.push(`position ${i + 1}: expected ${want.name} (${want.kind}), got ${got.label} (${got.kind})`);
      }
    });
    if (actual.length > EXPECTED_SECTIONS.length) mismatches.push(`extra sections: ${actual.slice(EXPECTED_SECTIONS.length).map((a) => a.label).join(', ')}`);
    expectNone(mismatches, 'rotation order / tones changed');
  });

  it('no two adjacent solid sections share a tone', () => {
    const sections = topLevelSections(home);
    const clashes: string[] = [];
    for (let i = 1; i < sections.length; i++) {
      const a = kindOf(sections[i - 1]);
      const b = kindOf(sections[i]);
      if (a !== 'photo' && a === b) {
        clashes.push(`${labelOf(sections[i - 1])} and ${labelOf(sections[i])} are both "${a}"`);
      }
    }
    expectNone(clashes, 'adjacent solid sections share a tone');
  });

  it('photo sections carry no data-bg-tone (that is how the suite recognises them)', () => {
    for (const spec of EXPECTED_SECTIONS.filter((s) => s.kind === 'photo')) {
      const el = findSection(home, spec.name);
      expect(el.hasAttribute('data-bg-tone'), `${labelOf(el, spec.name)} must stay a photo section`).toBe(false);
    }
  });
});

describe('A2: text on mauve (mid) sections', () => {
  const midSpecs = EXPECTED_SECTIONS.filter((s) => s.kind === 'mid');

  it('there are exactly three mid sections (intro, gallery, office)', () => {
    expect(midSpecs.map((s) => s.name), 'the set of mauve sections changed: re-check A2 for the new one').toEqual(['about-intro', 'about-gallery', 'contact-office']);
  });

  it('only the h2 and the one approved subtitle sit directly on mauve; all other copy is on a cream/light card or the veil', () => {
    const offenders: string[] = [];
    let approvedUsed = 0;
    for (const spec of midSpecs) {
      const section = findSection(home, spec.name);
      const subtitleSpec = SUBTITLES.find((s) => s.section === spec.name && s.onMid);
      const h2 = section.querySelector('h2');
      const approved = subtitleSpec && h2 ? subtitleOf(h2) : null;
      for (const node of textNodes(section)) {
        const el = node.parentElement!;
        // Owner-approved exception (2026-10-09, NS-43): the cream h2 titles (and the one approved
        // subtitle below) stay directly on the mauve in Intro, Reignite and ContactOffice, even though
        // they measure 2.11-2.22 and fail the large-text threshold. Do not "fix" these; see CLAUDE.md.
        if (el.closest('h1, h2')) continue;
        if (approved && approved.contains(node)) {
          approvedUsed++;
          continue;
        }
        const surface = el.closest('[data-bg-tone]');
        const onCard = surface !== section && (toneOf(el) === 'cream' || toneOf(el) === 'light');
        const onVeil = !!el.closest('[class*="surface-veil"]');
        if (!onCard && !onVeil) {
          offenders.push(`${labelOf(section, spec.name)}: "${node.textContent!.trim().slice(0, 40)}" sits directly on mauve`);
        }
      }
    }
    expectNone(offenders, 'copy sits directly on the mauve');
    expect(approvedUsed, 'the about-gallery subtitle exemption was never exercised: test went blind').toBe(1);
  });

  it('about-intro copy sits on the veil card (cream tone, rounded-card, surface-veil) at type-lead; the h2 stays outside it', () => {
    const section = findSection(home, 'about-intro');
    const card = section.querySelector<HTMLElement>('[data-bg-tone="cream"]');
    expect(card, `${labelOf(section, 'about-intro')} lost its veil card`).not.toBeNull();
    expect(hasClass(card, 'rounded-card'), 'about-intro card lost rounded-card').toBe(true);
    expect(hasClass(card, 'bg-[var(--surface-veil)]'), 'about-intro card must use the veil, not solid blush').toBe(true);
    const paras = Array.from(card!.querySelectorAll('p'));
    expect(paras.length, 'about-intro card paragraphs').toBe(2);
    for (const p of paras) expect(typeClassesOf(p), 'about-intro card paragraph').toEqual(['type-lead']);
    expect(card!.contains(section.querySelector('h2')), 'about-intro h2 must stay on the mauve, outside the card').toBe(false);
  });
});

describe('A3: running text on blush (light) surfaces', () => {
  /** Text whose nearest tone surface is blush, but which sits on its own photo/card surface instead. */
  function hasOwnSurface(el: Element, toneRoot: Element): boolean {
    for (let node: Element | null = el; node && node !== toneRoot; node = node.parentElement) {
      if (node !== el && node.hasAttribute('data-bg-tone')) return true;
      if (classTokens(node).some(isSurfaceBg)) return true;
      // a photo card: the element has an absolutely positioned cover image (direct child) behind its text:
      // a plain <img class="absolute inset-0"> or a next/image `fill` (data-nimg="fill", positioned inline)
      if (Array.from(node.children).some((c) => c.tagName === 'IMG' && ((hasClass(c, 'absolute') && hasClass(c, 'inset-0')) || c.getAttribute('data-nimg') === 'fill'))) return true;
    }
    return false;
  }

  const lightSpecs = EXPECTED_SECTIONS.filter((s) => s.kind === 'light');

  it('paragraphs directly on blush are quote scale or larger (never body/small/lead)', () => {
    const offenders: string[] = [];
    const checked = { p: 0, li: 0 };
    const ownSurface = { p: 0, li: 0 };
    for (const spec of lightSpecs) {
      const section = findSection(home, spec.name);
      for (const el of Array.from(section.querySelectorAll('p, li'))) {
        if (hasOwnSurface(el, section)) {
          ownSurface[el.tagName === 'LI' ? 'li' : 'p']++;
          continue;
        }
        checked[el.tagName === 'LI' ? 'li' : 'p']++;
        const ok = typeClassesOf(el).some((t) => QUOTE_OR_LARGER.includes(t));
        if (!ok) {
          offenders.push(`${labelOf(section, spec.name)}: <${el.tagName.toLowerCase()} class="${typeClassesOf(el).join(' ') || '(no type class)'}"> "${el.textContent!.trim().slice(0, 30)}" is on blush below quote scale`);
        }
      }
    }
    expectNone(offenders, 'paragraphs on blush below the quote scale');
    // Not vacuous: today exactly the Expertise subtitle and the Services intro are checked directly on blush.
    expect(checked.p, `directly-on-blush paragraphs actually checked: ${JSON.stringify(checked)}`).toBeGreaterThanOrEqual(2);
    // Services step bullets (4 steps x 3, type-small) live on photo cards with a dark gradient: proves the exemption is real.
    expect(ownSurface.li, `li recognised as sitting on a photo card: ${JSON.stringify(ownSurface)}`).toBeGreaterThanOrEqual(12);
  });

  it('blush sections contain no nested blush/other tone cards (their cards are photo cards)', () => {
    for (const spec of lightSpecs) {
      const section = findSection(home, spec.name);
      expect(section.querySelectorAll('[data-bg-tone]').length, `${labelOf(section, spec.name)} gained a nested tone card`).toBe(0);
    }
  });
});

describe('A4: office card (owner option B)', () => {
  it('contact-office has exactly one cream inner card holding the contact details AND the map', () => {
    const section = findSection(home, 'contact-office');
    const cards = section.querySelectorAll('[data-bg-tone="cream"]');
    expect(cards.length, `${labelOf(section, 'contact-office')} must have exactly one cream card`).toBe(1);
    const card = cards[0];
    expect(card.querySelector('a[href^="tel:"]'), 'phone link in the card').not.toBeNull();
    expect(card.querySelector('a[href^="mailto:"]'), 'email link in the card').not.toBeNull();
    const iframe = section.querySelector('[data-map-embed]');
    expect(iframe, `${labelOf(section, 'contact-office')} map embed`).not.toBeNull();
    expect(card.contains(iframe), 'map embed must be inside the same card as the details').toBe(true);
    expect(section.querySelectorAll('[data-map-embed]').length, 'single map').toBe(1);
  });

  it('the office h2 is outside the card, on the mauve', () => {
    const section = findSection(home, 'contact-office');
    const card = section.querySelector('[data-bg-tone="cream"]')!;
    const h2 = section.querySelector('h2')!;
    expect(card.contains(h2), `${labelOf(section, 'contact-office')} h2 moved inside the card`).toBe(false);
  });
});

describe('A5: the gallery subtitle is not wrapped in a card', () => {
  it('about-gallery subtitle sits directly on the section: no tone card, no bg, no rounded-card between', () => {
    const section = findSection(home, 'about-gallery');
    const sub = subtitleOf(section.querySelector('h2')!);
    expect(sub, `${labelOf(section, 'about-gallery')} subtitle not found`).not.toBeNull();
    expect(sub!.closest('[data-bg-tone]'), 'subtitle wrapped in a tone card').toBe(section);
    for (let node: Element | null = sub; node && node !== section; node = node.parentElement) {
      const bad = classTokens(node).filter((t) => t === 'rounded-card' || t.startsWith('bg-') || t === 'shadow-lg');
      expect(bad, `about-gallery subtitle ancestor <${node.tagName.toLowerCase()}> looks like a card`).toEqual([]);
    }
  });
});

describe('A6: the social section copy sits directly on the plum (moved from legacy colour-inheritance, NS-20)', () => {
  it('contact-social holds no nested tone card, and its social icon links are present', () => {
    const section = findSection(home, 'contact-social');
    const nested = Array.from(section.querySelectorAll('[data-bg-tone]')).map((el) => `${el.tagName.toLowerCase()}[${el.getAttribute('data-bg-tone')}]`);
    expect(nested, `${labelOf(section, 'contact-social')} grew a nested tone card (the lead copy is meant to sit on the plum itself)`).toEqual([]);
    expect(section.querySelectorAll('a[aria-label]').length, 'social icon links').toBeGreaterThanOrEqual(1);
  });
});
