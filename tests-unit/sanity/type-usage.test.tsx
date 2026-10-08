/**
 * SANITY C (rendered half): how the type scale is USED on the real page.
 *
 * History: type-body and type-lead were stacked on one element (the later CSS rule silently won),
 * font-latin was put on the same element as a type-* class (0.88 scale compounded / broke the line
 * box), subtitles drifted between type-lead and type-quote, buttons grew uppercase + tracking + py-*
 * and the hero phone pill ended up taller than the consult pill.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  SUBTITLES,
  buttonHeightToken,
  buttonSizeTokens,
  buttons,
  classTokens,
  desktopNav,
  expectNone,
  findSection,
  hasClass,
  headingOf,
  labelOf,
  renderHome,
  subtitleOf,
  textNodes,
  topLevelSections,
  typeClassesOf,
} from './helpers';

let home: HTMLElement;
beforeAll(async () => {
  home = await renderHome();
});

const all = () => Array.from(home.querySelectorAll<HTMLElement>('*'));
const desc = (el: Element) => `<${el.tagName.toLowerCase()} class="${classTokens(el).slice(0, 5).join(' ')}"> "${(el.textContent ?? '').trim().slice(0, 30)}"`;

describe('C12: one type-* class per element, font-latin only on inner spans', () => {
  it('no element carries two type-* classes', () => {
    const offenders = all().filter((el) => typeClassesOf(el).length > 1).map((el) => `${desc(el)} has ${typeClassesOf(el).join(' + ')}`);
    expectNone(offenders, 'elements carrying two type-* classes');
  });

  it('no element has both a type-* class and font-latin (font-latin goes on a child span)', () => {
    const offenders = all().filter((el) => typeClassesOf(el).length > 0 && hasClass(el, 'font-latin')).map(desc);
    expectNone(offenders, 'font-latin on the same element as a type-* class');
  });

  it('font-latin spans exist and live inside a type-* element (so 1em resolves against the scale)', () => {
    const spans = Array.from(home.querySelectorAll('.font-latin'));
    expect(spans.length, 'phone, email, M.S.W and © spans').toBeGreaterThanOrEqual(5);
    for (const s of spans) {
      expect(s.tagName, `${desc(s)} should be an inline span`).toBe('SPAN');
      expect(s.closest('[class*="type-"]'), `${desc(s)} is not inside a type-* element`).not.toBeNull();
    }
  });

  it('every phone number and email in the page text sits in span.font-latin', () => {
    const offenders: string[] = [];
    let seen = 0;
    for (const node of textNodes(home)) {
      if (/\d{2,3}-\d{3}-\d{4}|[\w.]+@[\w.]+\.\w+|©/.test(node.textContent!)) {
        seen++;
        if (!node.parentElement!.closest('.font-latin')) offenders.push(`"${node.textContent!.trim()}" in ${desc(node.parentElement!)}`);
      }
    }
    expectNone(offenders, 'phone/email/© text outside span.font-latin');
    expect(seen, 'hero pill, contact phone, contact email, footer ©').toBeGreaterThanOrEqual(4);
  });
});

describe('C13: section subtitle lockup', () => {
  it.each(SUBTITLES)('$section: subtitle is a type-quote paragraph with the agreed margin / width', (spec) => {
    const section = findSection(home, spec.section);
    const h2 = section.querySelector('h2');
    expect(h2, `${labelOf(section, spec.section)} has no h2`).not.toBeNull();
    const p = subtitleOf(h2!);
    expect(p, `${labelOf(section, spec.section)} lost its subtitle under the h2`).not.toBeNull();
    expect(typeClassesOf(p), `${labelOf(section, spec.section)} subtitle type class`).toEqual(['type-quote']);
    for (const m of spec.margin) expect(hasClass(p, m), `${labelOf(section, spec.section)} subtitle lost ${m}`).toBe(true);
    expect(hasClass(p, 'max-w-[65ch]'), `${labelOf(section, spec.section)} subtitle max-w-[65ch] expectation (${spec.needsMaxWidth})`).toBe(spec.needsMaxWidth);
  });

  it('Services is the one deliberate margin exception (mt-5 md:mt-9, for the Elamy "?" descender); the rest use mt-3 md:mt-4', () => {
    const exceptions = SUBTITLES.filter((s) => s.margin.join(' ') !== 'mt-3 md:mt-4').map((s) => s.section);
    expect(exceptions).toEqual(['services']);
  });
});

describe('C14: buttons, nav and hero copy', () => {
  it('finds all five ButtonLinks (hero phone pill, hero CTA, services CTA, CTA band, footer CTA)', () => {
    expect(buttons(home).length, 'ButtonLink count').toBe(5);
  });

  it('every ButtonLink is type-lead font-bold, no uppercase, no tracking, no py-*; height comes from min-h 48 or 56', () => {
    for (const a of buttons(home)) {
      const t = classTokens(a);
      expect(typeClassesOf(a), desc(a)).toEqual(['type-lead']);
      expect(t, `${desc(a)} font-bold`).toContain('font-bold');
      expect(t.filter((x) => /^(?:[a-z]+:)?(uppercase|tracking-.*|py-.*|text-\[(?:clamp|\d).*)$/.test(x)), `${desc(a)} forbidden button classes`).toEqual([]);
      expect(buttonHeightToken(a), `${desc(a)} needs min-h-[48px] (sm) or min-h-[56px] (md)`).not.toBeNull();
    }
  });

  it('the hero phone pill and the hero consult CTA are the same size variant', () => {
    const hero = findSection(home, 'hero');
    const pill = hero.querySelector<HTMLElement>('a[href^="tel:"]')!;
    const cta = buttons(hero).find((a) => a.getAttribute('href') === '#contact')!;
    expect(pill, 'hero phone pill').not.toBeNull();
    expect(cta, 'hero consult CTA').not.toBeNull();
    expect(buttonSizeTokens(pill), 'hero phone pill vs consult CTA sizing').toEqual(buttonSizeTokens(cta));
    expect(buttonHeightToken(pill), 'hero pills are the sm variant').toBe('min-h-[48px]');
  });

  it('services + CTA-band buttons are the md variant (56px)', () => {
    for (const name of ['services', 'cta-band']) {
      const section = findSection(home, name);
      const a = buttons(section).find((x) => x.getAttribute('href') === '#contact')!;
      expect(buttonHeightToken(a), `${labelOf(section, name)} CTA must be the md variant (min-h-[56px])`).toBe('min-h-[56px]');
    }
  });

  it('desktop nav links are type-lead font-bold (no tracking, no uppercase)', () => {
    const nav = desktopNav(home);
    expect(nav, 'desktop nav row (hidden md:flex) not found').not.toBeNull();
    const links = Array.from(nav!.querySelectorAll<HTMLElement>('a')).filter((a) => !buttons(nav!).includes(a));
    expect(links.length, 'nav text links').toBeGreaterThanOrEqual(4);
    for (const a of links) {
      expect(typeClassesOf(a), desc(a)).toEqual(['type-lead']);
      expect(hasClass(a, 'font-bold'), `${desc(a)} font-bold`).toBe(true);
      expect(classTokens(a).filter((t) => /uppercase|tracking-/.test(t)), desc(a)).toEqual([]);
    }
  });

  it('hero subtext is type-quote', () => {
    const p = findSection(home, 'hero').querySelector('p')!;
    expect(typeClassesOf(p), 'hero subtext').toEqual(['type-quote']);
  });

  it('contact rows: address, phone and email are type-lead; phone/email values are span.font-latin', () => {
    const office = findSection(home, 'contact-office');
    const rows = Array.from(office.querySelectorAll('ul li'));
    expect(rows.length, 'address, phone, email rows').toBe(3);
    for (const li of rows) {
      const text = li.querySelector<HTMLElement>('p, a')!;
      expect(typeClassesOf(text), desc(text)).toEqual(['type-lead']);
    }
    for (const sel of ['a[href^="tel:"]', 'a[href^="mailto:"]']) {
      const a = office.querySelector(sel)!;
      const span = a.querySelector('span.font-latin');
      expect(span, `${sel} value must be in span.font-latin`).not.toBeNull();
      expect(span!.textContent!.trim(), `${sel}: the whole link text must be inside span.font-latin`).toBe(a.textContent!.trim());
      expect(hasClass(a, 'font-bold'), `${sel} stays regular weight`).toBe(false);
    }
  });

  it('hero phone pill value is in span.font-latin', () => {
    const pill = findSection(home, 'hero').querySelector('a[href^="tel:"]')!;
    expect(pill.querySelector('span.font-latin')?.textContent, 'hero phone pill value in span.font-latin').toBe('054-571-1060');
  });
});

describe('C15: about-me and about-intro copy', () => {
  it('about-me bio is five type-lead paragraphs (no type-body)', () => {
    const section = findSection(home, 'about-me');
    expect(section.querySelectorAll('p.type-lead').length, `${labelOf(section, 'about-me')} bio paragraphs`).toBe(5);
    expect(section.querySelectorAll('.type-body').length, `${labelOf(section, 'about-me')} type-body`).toBe(0);
  });

  it('about-intro card paragraphs are type-lead (see also the veil check in cards-rotation)', () => {
    const section = findSection(home, 'about-intro');
    const paras = section.querySelectorAll('[data-bg-tone="cream"] p');
    expect(paras.length, `${labelOf(section, 'about-intro')} veil card paragraphs`).toBe(2);
    paras.forEach((p) => expect(typeClassesOf(p), `${labelOf(section, 'about-intro')} card paragraph`).toEqual(['type-lead']));
  });
});

describe('C16: headings', () => {
  it('every section h2 on the page is type-title font-bold (Elamy 700)', () => {
    const h2s = Array.from(home.querySelectorAll('h2'));
    expect(h2s.length, 'section h2s').toBeGreaterThanOrEqual(10);
    for (const h of h2s) {
      expect(typeClassesOf(h), `h2 "${h.textContent!.trim()}"`).toEqual(['type-title']);
      expect(hasClass(h, 'font-bold'), `h2 "${h.textContent!.trim()}" font-bold`).toBe(true);
    }
  });

  it('every solid section and the CTA band has an h2; the hero has the h1', () => {
    for (const s of topLevelSections(home).filter((s) => s.tagName === 'SECTION' && s !== findSection(home, 'hero'))) {
      expect(s.querySelector('h2'), `${labelOf(s)} lost its h2`).not.toBeNull();
    }
    expect(headingOf(findSection(home, 'hero'))!.tagName, 'hero heading level').toBe('H1');
  });

  it('hero h1 is type-display font-bold', () => {
    const h1 = home.querySelector('h1')!;
    expect(typeClassesOf(h1), 'hero h1 type class').toEqual(['type-display']);
    expect(hasClass(h1, 'font-bold'), 'hero h1 lost font-bold (Elamy 700)').toBe(true);
  });

  it('step numerals 01.-04. are type-display, never bold/black', () => {
    const nums = all().filter((el) => el.children.length === 0 && /^0[1-4]\.$/.test((el.textContent ?? '').trim()));
    expect(nums.length, 'step numerals').toBe(4);
    for (const n of nums) {
      expect(typeClassesOf(n), desc(n)).toEqual(['type-display']);
      expect(classTokens(n).filter((t) => /^font-/.test(t)), `${desc(n)} must not set a font weight`).toEqual([]);
    }
  });

  it('step titles are h3.type-card-title', () => {
    const section = findSection(home, 'services');
    const titles = Array.from(section.querySelectorAll('h3'));
    expect(titles.length, `${labelOf(section, 'services')} step titles`).toBe(4);
    for (const t of titles) expect(typeClassesOf(t), desc(t)).toEqual(['type-card-title']);
  });
});
