// @vitest-environment node
/**
 * SANITY C (css half): the canonical type scale in globals.css.
 *
 * History: the template export shipped 21 ad-hoc sizes (13/15/16/18.67/28/31px...). They were
 * collapsed into 11 `.type-*` classes; `.type-quote` was briefly Elamy (illegible running text),
 * `--surface-veil` vanished because Tailwind v4 drops unreferenced theme vars, and the Latin
 * companion's size scale compounded. Every one of those regressed at least once.
 */
import { describe, expect, it } from 'vitest';
import { cssVar, displayFontSelectors, expectNone, globalsCss, parseToneRules, parseTypeRules, sizeRange, stripCssComments, readSources } from './helpers';

const css = globalsCss();
const clean = stripCssComments(css);
const rules = parseTypeRules(css);

const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

/** [name, min px, max px, font family, weight, line-height] — CLAUDE.md "The Type Scale". */
const SCALE: Array<[string, number, number, string, string, string?]> = [
  ['display', 40, 72, DISPLAY, '400', '1.05'],
  ['title', 30, 52, DISPLAY, '700', '1.15'],
  ['card-title', 22, 30, BODY, '700', '1.25'],
  ['quote', 24, 32, BODY, '400', '1.5'],
  ['lead', 18, 22, BODY, '400', '1.6'],
  ['body', 16, 18, BODY, '400', '1.65'],
  ['small', 14, 16, BODY, '400', '1.5'],
  ['eyebrow', 14, 14, BODY, '700', '1.4'],
  ['signature', 32, 56, DISPLAY, '400', '1.1'],
  // blog long-form only; CLAUDE.md floor is 18/20, actual is 20->23 and 22->28
  ['read', 20, 23, BODY, '400'],
  ['read-lead', 22, 28, BODY, '400'],
];

describe('C10: .type-* classes in globals.css', () => {
  it.each(SCALE)('.type-%s is clamp %ipx -> %ipx, family/weight/line-height as documented', (name, min, max, family, weight, lh) => {
    const rule = rules.get(name);
    expect(rule, `.type-${name} is missing from globals.css`).toBeDefined();
    const range = sizeRange(rule!.size);
    expect(range, `.type-${name} font-size "${rule!.size}" is not clamp(Npx, x, Npx) or Npx`).not.toBeNull();
    expect(range, `.type-${name} min/max px drifted`).toEqual({ min, max });
    expect(rule!.family, `.type-${name} font-family`).toBe(family);
    expect(rule!.weight, `.type-${name} font-weight`).toBe(weight);
    if (lh) expect(rule!.lineHeight, `.type-${name} line-height`).toBe(lh);
  });

  it('the type scale is a closed set: no new .type-* class slips in (size budget <= 11 incl. the two blog sizes)', () => {
    expect([...rules.keys()].sort()).toEqual(SCALE.map((s) => s[0]).sort());
    expect(rules.size).toBeLessThanOrEqual(11);
  });

  it('every .type-* class used in src exists in the scale (typo guard: type-lg, type-bodyy)', () => {
    const known = new Set([...rules.keys()]);
    const unknown: string[] = [];
    for (const s of readSources().filter((f) => f.name.endsWith('.tsx'))) {
      for (const m of s.text.matchAll(/\btype-([a-z]+(?:-[a-z]+)*)\b/g)) {
        // skip prose in comments like "type-*" / "type-scale" / "type-eyebrow" handled by the set
        if (!known.has(m[1]) && !['scale', 'size'].includes(m[1])) unknown.push(`${s.name}: type-${m[1]}`);
      }
    }
    expectNone([...new Set(unknown)], 'type-* class used in src but not defined in globals.css');
  });
});

describe('C10b: font tokens and the Latin companion', () => {
  it('Latin companion: --latin-scale is 0.88 and .font-latin sizes itself by it in the Latin font (font stacks: font-fallback.test.ts)', () => {
    expect(clean).toMatch(/--latin-scale\s*:\s*0\.88\s*;/);
    const rule = clean.match(/\.font-latin\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/font-size\s*:\s*calc\(\s*1em\s*\*\s*var\(--latin-scale\)\s*\)/);
    expect(rule).toMatch(/font-family\s*:\s*var\(--font-latin\)/);
  });

  it('--surface-veil is cream 85% over mauve and is declared inside `@theme static` (Tailwind v4 drops unreferenced theme vars otherwise)', () => {
    expect(clean).toMatch(/--surface-veil\s*:\s*color-mix\(in srgb, var\(--color-cream\) 85%, var\(--color-mauve\)\)/);
    const before = clean.slice(0, clean.indexOf('--surface-veil:'));
    const opener = before.lastIndexOf('@theme');
    expect(opener, '--surface-veil is not inside an @theme block').toBeGreaterThan(-1);
    expect(before.slice(opener, before.indexOf('{', opener)).replace(/\s+/g, ' ').trim()).toBe('@theme static');
    expect(before.slice(before.indexOf('{', opener) + 1).includes('}'), '--surface-veil escaped its @theme static block').toBe(false);
  });

  it('the four brand colour tokens keep their values; --color-white is the cream alias (never pure #fff)', () => {
    for (const [token, hex] of [
      ['plum', '#7A5978'],
      ['mauve', '#C49AB8'],
      ['blush', '#ECC8CE'],
      ['cream', '#FFF5F0'],
    ]) {
      expect(clean, `--color-${token}`).toMatch(new RegExp(`--color-${token}\\s*:\\s*${hex}\\s*;`, 'i'));
    }
    expect(cssVar(css, '--color-white')?.toLowerCase(), '--color-white must equal the cream hex').toBe('#fff5f0');
  });

  it.each(['--color-dark', '--color-text-primary', '--color-text-secondary', '--color-bg-light', '--color-brand-primary'])('the retired colour alias %s is gone (four colours only: plum / mauve / blush / cream)', (name) => {
    expect(cssVar(css, name), `${name} is back in globals.css`).toBeUndefined();
  });
});

describe('C9: [data-bg-tone] rules map each tone to its background, text and header colour', () => {
  const tones = parseToneRules(css);
  const EXPECTED: Record<string, { bg: string; color: string }> = {
    dark: { bg: 'plum', color: 'cream' },
    mid: { bg: 'mauve', color: 'cream' },
    light: { bg: 'blush', color: 'plum' },
    cream: { bg: 'cream', color: 'plum' },
  };

  it('exactly the four tones are defined', () => {
    expect(Object.keys(tones).sort(), 'tone rules in globals.css').toEqual(Object.keys(EXPECTED).sort());
  });

  it.each(Object.entries(EXPECTED))('%s: background and text colours (the contrast pairs), --header-color follows the text', (tone, want) => {
    const t = tones[tone];
    expect(t?.bg, `[data-bg-tone="${tone}"] background-color`).toBe(`var(--color-${want.bg})`);
    expect(t?.color, `[data-bg-tone="${tone}"] color`).toBe(`var(--color-${want.color})`);
    expect(t?.header, `[data-bg-tone="${tone}"] --header-color`).toBe(`var(--color-${want.color})`);
  });
});

describe('C14: Elamy (the display font) is reserved for display, title and signature', () => {
  it('in globals.css only .type-display / .type-title / .type-signature set font-family to the display font', () => {
    expect(displayFontSelectors(css).sort()).toEqual(['.sig-text', '.type-display', '.type-signature', '.type-title']); // NS-56: .sig-text is the signature SVG <text> (it cannot carry .type-signature: that class would override its viewBox font-size);
  });

  it('component css modules never set the display font', () => {
    const offenders = readSources()
      .filter((f) => f.name.endsWith('.module.css'))
      .filter((f) => displayFontSelectors(f.text).length > 0)
      .map((f) => f.path);
    expectNone(offenders, 'css module using Elamy');
  });
});
