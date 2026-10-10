/**
 * SANITY D: owner rulings that must not regress (the palette, the white utilities and the WhatsApp hexes are
 * source-scan.test.ts; the type-scale and tone rulings live in their own files).
 *
 * History: WhatsApp green stays green (owner), no hand-drawn underline under section titles (owner;
 * the hero "ביחד." stroke is the ONE allowed stroke), the hero entrance + couple line-art are
 * pure-CSS and motion-sequenced, and the contact pill sits bottom-left on every breakpoint.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { classTokens, expectNone, findSection, hasClass, labelOf, readSources, renderHome, stripCssComments } from './helpers';

let home: HTMLElement;
beforeAll(async () => {
  home = await renderHome();
});

describe('D19: ContactFAB', () => {
  it('WhatsApp half is the brand green with a white label, the pill itself is plum, the phone half has no WhatsApp green and no mauve hover', () => {
    const pill = home.querySelector('[data-testid="contact-fab"]')!;
    const wa = home.querySelector('[data-testid="fab-whatsapp"]')!;
    const phone = home.querySelector('[data-testid="fab-phone"]')!;
    expect(pill && wa && phone, 'contact FAB parts').toBeTruthy();
    expect(classTokens(wa), 'WhatsApp half keeps --color-whatsapp (#25D366) and its hover shade').toEqual(expect.arrayContaining(['bg-whatsapp', 'hover:bg-whatsapp-hover']));
    expect(classTokens(wa).some((t) => /^text-\[#ffffff\]$/i.test(t)), 'WhatsApp half label stays white').toBe(true);
    expect(hasClass(pill, 'bg-plum'), 'pill base is plum').toBe(true);
    expect(classTokens(phone).some((t) => /whatsapp/i.test(t)), 'phone half must not be WhatsApp green').toBe(false);
    expect(classTokens(phone).some((t) => /^(hover:)?bg-mauve$/.test(t)), 'phone half hover is a darker plum: cream on mauve is 2.26:1 (NS-33)').toBe(false);
  });

  it('WhatsApp half keyboard focus is a two-tone cream + plum ring, never white-on-green (NS-41)', () => {
    const t = classTokens(home.querySelector('[data-testid="fab-whatsapp"]')!);
    // white on #25D366 is 1.98:1 (< 3:1); plum meets the green at 3.00:1 and the cream band at 5.55:1
    expect(t.filter((x) => /^focus-visible:ring-/.test(x) && x !== 'focus-visible:ring-inset' && x !== 'focus-visible:ring-2'), 'ring colour').toEqual(['focus-visible:ring-cream']);
    expect(t, 'inner plum band').toEqual(expect.arrayContaining(['focus-visible:outline-2', 'focus-visible:outline-solid', 'focus-visible:outline-plum']));
  });

  it('is fixed bottom-left on every breakpoint (left- at base and md, never right-)', () => {
    const t = classTokens(home.querySelector('[data-testid="contact-fab"]')!.parentElement!);
    expect(t).toContain('fixed');
    for (const re of [/^bottom-/, /^left-/, /^md:left-/]) expect(t.some((x) => re.test(x)), String(re)).toBe(true);
    expect(t.filter((x) => /(^|:)right-/.test(x)), 'must not be pinned right').toEqual([]);
  });

  it('the bg-whatsapp utility is used only by the FAB (the hex itself is locked in source-scan.test.ts)', () => {
    const users = readSources().filter((s) => /(?<![\w-])(?:hover:)?bg-whatsapp(?:-hover)?(?![\w-])/.test(s.text)).map((s) => s.name);
    expect(users).toEqual(['ContactFAB.tsx']);
  });
});

describe('D20: no hand-drawn underline under section titles', () => {
  it('no section h2 contains an svg/path/img/absolute decoration or an underline utility', () => {
    const offenders: string[] = [];
    for (const h2 of Array.from(home.querySelectorAll('h2'))) {
      const label = `h2 "${h2.textContent!.trim().slice(0, 30)}"`;
      if (h2.querySelector('svg, path, img, canvas')) offenders.push(`${label} contains an svg/path/img`);
      if (Array.from(h2.querySelectorAll('*')).some((e) => hasClass(e, 'absolute'))) offenders.push(`${label} contains an absolutely positioned decoration`);
      if (classTokens(h2).some((t) => /^(underline|decoration-|border-b|after:|before:)/.test(t))) offenders.push(`${label} carries an underline utility`);
    }
    expectNone(offenders, 'section-title underline / decoration');
  });

  it('the only stroke-drawn paths on the page live in the hero (h1 word stroke + couple art), the bio signature, or a LineArt illustration', () => {
    const hero = findSection(home, 'hero');
    const outside = Array.from(home.querySelectorAll('path[pathLength]')).filter((p) => !hero.contains(p) && !p.closest('.sig-mark, .sig-flourish') && !p.closest('svg[data-line-art]'));
    expect(outside.length, 'drawn path outside the hero').toBe(0);
  });

  it('the hero "ביחד." stroke still exists inside the h1', () => {
    const h1 = home.querySelector('h1')!;
    expect(h1.textContent).toContain('ביחד.');
    const stroke = h1.querySelector('svg path[pathLength="1"]');
    expect(stroke, 'the hand-drawn stroke under "ביחד." is gone').not.toBeNull();
    expect([stroke!.getAttribute('stroke'), stroke!.getAttribute('stroke-linecap')]).toEqual(['currentColor', 'round']);
  });
});

describe('D21: hero entrance and couple line-art', () => {
  it('four .hero-enter blocks with delay modifiers 0-3, in order, in the hero; the animation is off under reduced motion', () => {
    const hero = findSection(home, 'hero');
    const blocks = Array.from(hero.querySelectorAll('.hero-enter'));
    expect(blocks.length, `${labelOf(hero)} hero-enter blocks`).toBe(4);
    blocks.forEach((b, i) => expect(hasClass(b, `hero-enter-${i}`), `hero-enter block #${i} lost hero-enter-${i}`).toBe(true));
    const css = stripCssComments(readSources().find((s) => s.name === 'globals.css')!.text);
    expect(css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))).toMatch(/\.hero-enter\s*\{[^}]*animation:\s*none/);
  });

  it('the couple line-art draws itself: >= 15 pathLength=1 strokes in the hero art, plus the heart fills', () => {
    const art = Array.from(findSection(home, 'hero').querySelectorAll('svg')).find((s) => s.querySelectorAll('path[pathLength="1"]').length >= 15);
    expect(art, 'CoupleLineArt svg with pathLength strokes is gone').toBeDefined();
    expect(art!.querySelectorAll('path:not([pathLength])').length, 'heart fills').toBeGreaterThanOrEqual(1);
  });

  it('pen-draw css modules honour prefers-reduced-motion', () => {
    const draws = readSources().filter((s) => s.name.endsWith('.module.css') && /stroke-dashoffset/.test(s.text));
    expect(draws.length, 'css modules animating stroke-dashoffset (word stroke + couple pen)').toBeGreaterThanOrEqual(2);
    for (const f of draws) expect(f.text, `${f.path} must disable the draw under reduced motion`).toMatch(/prefers-reduced-motion/);
  });
});
