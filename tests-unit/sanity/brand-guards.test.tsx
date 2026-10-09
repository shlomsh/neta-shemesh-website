/**
 * SANITY D: owner rulings that must not regress (the palette and no-bg-white scans live in
 * source-scan.test.ts; the type-scale and tone rulings live in their own files).
 *
 * History: WhatsApp green stays green (owner), no hand-drawn underline under section titles (owner;
 * the hero "ביחד." stroke is the ONE allowed stroke), the hero entrance + couple line-art are
 * pure-CSS and motion-sequenced, and the contact pill sits bottom-left on every breakpoint.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  classTokens,
  expectNone,
  findSection,
  hasClass,
  labelOf,
  readSources,
  renderHome,
  stripCssComments,
} from './helpers';

let home: HTMLElement;
beforeAll(async () => {
  home = await renderHome();
});

describe('D19: ContactFAB', () => {
  it('WhatsApp half is #25D366, the pill itself is plum, the phone half has no WhatsApp green', () => {
    const pill = home.querySelector('[data-testid="contact-fab"]')!;
    const wa = home.querySelector('[data-testid="fab-whatsapp"]')!;
    const phone = home.querySelector('[data-testid="fab-phone"]')!;
    expect(pill && wa && phone, 'contact FAB parts').toBeTruthy();
    expect(classTokens(wa).includes('bg-whatsapp'), 'WhatsApp half must use bg-whatsapp (--color-whatsapp #25D366)').toBe(true);
    expect(classTokens(wa).some((t) => /^text-\[#ffffff\]$/i.test(t)), 'WhatsApp half label stays white').toBe(true);
    expect(classTokens(wa).includes('hover:bg-whatsapp-hover'), 'WhatsApp half hover stays --color-whatsapp-hover #1EBE5B').toBe(true);
    expect(hasClass(pill, 'bg-plum'), 'pill base is plum').toBe(true);
    expect(classTokens(phone).some((t) => /25d366|whatsapp/i.test(t)), 'phone half must not be WhatsApp green').toBe(false);
    expect(classTokens(phone).some((t) => /^(hover:)?bg-mauve$/.test(t)), 'phone half hover is a darker plum: cream on mauve is 2.26:1 (NS-33)').toBe(false);
    expect(phone.getAttribute('href')).toMatch(/^tel:/);
    expect(wa.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//);
  });

  it('WhatsApp half keyboard focus is a two-tone cream + plum ring, never white-on-green (NS-41)', () => {
    const t = classTokens(home.querySelector('[data-testid="fab-whatsapp"]')!);
    // white on #25D366 is 1.98:1 (< 3:1); plum meets the green at 3.00:1 and the cream band at 5.55:1
    expect(t.filter((x) => /^focus-visible:ring-/.test(x) && x !== 'focus-visible:ring-inset' && x !== 'focus-visible:ring-2'), 'ring colour').toEqual(['focus-visible:ring-cream']);
    expect(t, 'inner plum band').toEqual(expect.arrayContaining(['focus-visible:outline-2', 'focus-visible:outline-solid', 'focus-visible:outline-plum']));
    expect(t.some((x) => /^focus-visible:outline-offset-|^focus-visible:-outline-offset-/.test(x)), 'plum band sits inside the half').toBe(true);
    expect(t.some((x) => /^focus-visible:ring-\[/i.test(x)), 'no arbitrary-colour focus ring').toBe(false);
  });

  it('is fixed bottom-left on every breakpoint (left- at base and md, never right-)', () => {
    const wrapper = home.querySelector('[data-testid="contact-fab"]')!.parentElement!;
    const t = classTokens(wrapper);
    expect(t).toContain('fixed');
    expect(t.some((x) => /^bottom-/.test(x)), 'bottom-* at base').toBe(true);
    expect(t.some((x) => /^left-/.test(x)), 'left-* at base').toBe(true);
    expect(t.some((x) => /^md:left-/.test(x)), 'md:left-*').toBe(true);
    expect(t.filter((x) => /(^|:)right-/.test(x)), 'must not be pinned right').toEqual([]);
  });

  it('WhatsApp green is used only by the FAB (nowhere else in src)', () => {
    // the hex lives once in globals.css (--color-whatsapp / -hover); the utilities are bg-whatsapp / hover:bg-whatsapp-hover
    const hexUsers = readSources().filter((s) => /#25d366/i.test(s.text)).map((s) => s.name);
    expect(hexUsers).toEqual(['globals.css']);
    const users = readSources().filter((s) => /(?<![\w-])(?:hover:)?bg-whatsapp(?:-hover)?(?![\w-])/.test(s.text)).map((s) => s.name);
    expect(users).toEqual(['ContactFAB.tsx']);
  });
});

describe('D20: no hand-drawn underline under section titles', () => {
  it('no section h2 contains an svg/path/img/absolute decoration', () => {
    const offenders: string[] = [];
    for (const h2 of Array.from(home.querySelectorAll('h2'))) {
      const label = `h2 "${h2.textContent!.trim().slice(0, 30)}"`;
      if (h2.querySelector('svg, path, img, canvas')) offenders.push(`${label} contains an svg/path/img`);
      if (Array.from(h2.querySelectorAll('*')).some((e) => hasClass(e, 'absolute'))) offenders.push(`${label} contains an absolutely positioned decoration`);
      if (classTokens(h2).some((t) => /^(underline|decoration-|border-b|after:|before:)/.test(t))) offenders.push(`${label} carries an underline utility`);
    }
    expectNone(offenders, 'section-title underline / decoration');
  });

  it('the only stroke-drawn paths on the page live in the hero (h1 word stroke + couple art), the NS-55 signature flourish, or a LineArt illustration (NS-54)', () => {
    const hero = findSection(home, 'hero');
    const outside = Array.from(home.querySelectorAll('path[pathLength]')).filter((p) => !hero.contains(p) && !p.closest('.sig-flourish') && !p.closest('svg[data-line-art]')); // NS-55: the bio signature flourish is a signature, not a title underline
    expect(outside.length, 'drawn path outside the hero').toBe(0);
  });

  it('the hero "ביחד." stroke still exists inside the h1', () => {
    const h1 = home.querySelector('h1')!;
    expect(h1.textContent).toContain('ביחד.');
    const stroke = h1.querySelector('svg path[pathLength="1"]');
    expect(stroke, 'the hand-drawn stroke under "ביחד." is gone').not.toBeNull();
    expect(stroke!.getAttribute('stroke')).toBe('currentColor');
    expect(stroke!.getAttribute('stroke-linecap')).toBe('round');
  });
});

describe('D21: hero entrance and couple line-art', () => {
  it('four .hero-enter blocks with delay modifiers 0-3, in order, in the hero', () => {
    const hero = findSection(home, 'hero');
    const blocks = Array.from(hero.querySelectorAll('.hero-enter'));
    expect(blocks.length, `${labelOf(hero)} hero-enter blocks`).toBe(4);
    blocks.forEach((b, i) => expect(hasClass(b, `hero-enter-${i}`), `hero-enter block #${i} lost hero-enter-${i}`).toBe(true));
  });

  it('globals.css still defines hero-enter, its delays, the keyframes and the reduced-motion override', () => {
    const css = stripCssComments(readSources().find((s) => s.name === 'globals.css')!.text);
    expect(css).toMatch(/@keyframes hero-enter\b/);
    expect(css).toMatch(/\.hero-enter\s*\{[^}]*animation:\s*hero-enter/);
    // .hero-enter-0 has no rule on purpose (delay 0s is the default); the class stays on the first block as a marker
    for (let i = 1; i < 4; i++) expect(css, `.hero-enter-${i}`).toMatch(new RegExp(`\\.hero-enter-${i}\\s*\\{[^}]*animation-delay`));
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toMatch(/\.hero-enter\s*\{[^}]*animation:\s*none/);
  });

  it('the couple line-art draws itself: >= 15 pathLength=1 strokes in the hero art, plus the heart fills', () => {
    const hero = findSection(home, 'hero');
    const art = Array.from(hero.querySelectorAll('svg')).find((s) => s.querySelectorAll('path[pathLength="1"]').length >= 15);
    expect(art, 'CoupleLineArt svg with pathLength strokes is gone').toBeDefined();
    const strokes = art!.querySelectorAll('path[pathLength="1"]');
    expect(strokes.length).toBeGreaterThanOrEqual(15);
    expect(art!.querySelectorAll('path:not([pathLength])').length, 'heart fills').toBeGreaterThanOrEqual(1);
  });

  it('pen-draw css modules honour prefers-reduced-motion', () => {
    const draws = readSources().filter((s) => s.name.endsWith('.module.css') && /stroke-dashoffset/.test(s.text));
    expect(draws.length, 'css modules animating stroke-dashoffset (word stroke + couple pen)').toBeGreaterThanOrEqual(2);
    for (const f of draws) expect(f.text, `${f.path} must disable the draw under reduced motion`).toMatch(/prefers-reduced-motion/);
  });
});
