// @vitest-environment node
/**
 * SANITY C (css half): the canonical type scale in globals.css.
 *
 * History: the template export shipped 21 ad-hoc sizes (13/15/16/18.67/28/31px...). They were
 * collapsed into 11 `.type-*` classes; `.type-quote` was briefly Elamy (illegible running text),
 * `--surface-veil` vanished because Tailwind v4 drops unreferenced theme vars, and the Latin
 * companion's size scale compounded. Every one of those regressed at least once.
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { cssVar, displayFontSelectors, expectNone, globalsCss, parseToneRules, parseTypeRules, sizeRange, stripCssComments, readSources } from './helpers';

// fontkit ships no types: load it untyped (it is a devDependency used for the Elamy ink measurements)
const fontkit = createRequire(import.meta.url)('fontkit') as {
  openSync: (file: string) => {
    unitsPerEm: number;
    glyphForCodePoint: (cp: number) => { bbox: { minX: number; maxX: number }; advanceWidth: number };
  };
};

const css = globalsCss();
const clean = stripCssComments(css);
const rules = parseTypeRules(css);

const BODY = 'var(--font-body)';
const DISPLAY = 'var(--font-display)';

/** [name, min px, max px, font family, weight, line-height] — CLAUDE.md "The Type Scale". */
const SCALE: Array<[string, number, number, string, string, string?]> = [
  ['display', 40, 72, DISPLAY, '400', '1.05'],
  ['title', 30, 52, DISPLAY, '400', '1.15'],
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

  it('.type-quote uses the body font (Stanga), NOT the display font (Elamy was an illegible-paragraph bug)', () => {
    const quote = rules.get('quote')!;
    expect(quote.family).toBe(BODY);
    expect(quote.family).not.toContain('display');
    expect(quote.weight).toBe('400');
  });

  it('the type scale is a closed set: no new .type-* class slips in (size budget <= 11 incl. the two blog sizes)', () => {
    expect([...rules.keys()].sort()).toEqual(SCALE.map((s) => s[0]).sort());
    expect(rules.size).toBeLessThanOrEqual(11);
  });

  it('no font-size below 14px anywhere in globals.css (floor rule)', () => {
    const sizes = [...clean.matchAll(/font-size\s*:\s*([^;}]+)[;}]/g)].map((m) => m[1].trim());
    expect(sizes.length).toBeGreaterThan(5);
    const tooSmall: string[] = [];
    for (const size of sizes) {
      // every px number inside the declaration (clamp min, fixed size, calc terms) must be >= 14
      for (const px of size.matchAll(/(\d+(?:\.\d+)?)px/g)) {
        if (Number(px[1]) < 14) tooSmall.push(size);
      }
    }
    expectNone(tooSmall, 'font-size under the 14px floor');
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
  it('--font-body stack is stanga, stanga-fb (Hebrew-only), latin, sans-serif (Latin must fall through to the companion, never Arial)', () => {
    const m = clean.match(/--font-body\s*:\s*([^;]+);/);
    expect(m, '--font-body missing').not.toBeNull();
    const stack = m![1].split(',').map((x) => x.trim());
    expect(stack.slice(0, 3)).toEqual(['var(--font-stanga)', '"stanga-fb"', 'var(--font-latin)']);
    expect(stack.at(-1)).toBe('sans-serif');
  });

  it('--latin-scale exists and is 0.88', () => {
    expect(clean).toMatch(/--latin-scale\s*:\s*0\.88\s*;/);
  });

  it('.font-latin sizes itself as calc(1em * var(--latin-scale)) and uses the Latin companion font', () => {
    const rule = clean.match(/\.font-latin\s*\{([^}]*)\}/);
    expect(rule, '.font-latin rule missing').not.toBeNull();
    expect(rule![1]).toMatch(/font-size\s*:\s*calc\(\s*1em\s*\*\s*var\(--latin-scale\)\s*\)/);
    expect(rule![1]).toMatch(/font-family\s*:\s*var\(--font-latin\)/);
  });

  it('--surface-veil is declared inside an `@theme static` block (Tailwind v4 drops unreferenced theme vars otherwise)', () => {
    const idx = clean.indexOf('--surface-veil:');
    expect(idx, '--surface-veil missing').toBeGreaterThan(-1);
    // find the nearest preceding at-rule opener of the block that contains it
    const before = clean.slice(0, idx);
    const opener = before.lastIndexOf('@theme');
    expect(opener, '--surface-veil is not inside an @theme block').toBeGreaterThan(-1);
    const header = before.slice(opener, before.indexOf('{', opener));
    expect(header.replace(/\s+/g, ' ').trim(), '--surface-veil must live in `@theme static { }`').toBe('@theme static');
    // and that block must not have closed before the declaration
    const between = before.slice(before.indexOf('{', opener) + 1);
    expect(between.includes('}'), '--surface-veil escaped its @theme static block').toBe(false);
  });

  it('--surface-veil is cream 85% over mauve', () => {
    expect(clean).toMatch(/--surface-veil\s*:\s*color-mix\(in srgb, var\(--color-cream\) 85%, var\(--color-mauve\)\)/);
  });

  it('the four brand colour tokens keep their values', () => {
    for (const [token, hex] of [
      ['plum', '#7A5978'],
      ['mauve', '#C49AB8'],
      ['blush', '#ECC8CE'],
      ['cream', '#FFF5F0'],
    ]) {
      expect(clean, `--color-${token}`).toMatch(new RegExp(`--color-${token}\\s*:\\s*${hex}\\s*;`, 'i'));
    }
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

  it('--color-white is aliased to the cream hex (never pure #fff)', () => {
    const cream = cssVar(css, '--color-cream')!;
    expect(cream.toLowerCase()).toBe('#fff5f0');
    expect(cssVar(css, '--color-white')?.toLowerCase(), '--color-white must equal the cream hex').toBe(cream.toLowerCase());
  });

  it.each(['--color-dark', '--color-text-primary', '--color-text-secondary', '--color-bg-light', '--color-brand-primary'])(
    'the retired colour alias %s is gone (say plum / cream / mauve)',
    (name) => {
      expect(cssVar(css, name), `${name} is back in globals.css`).toBeUndefined();
    },
  );
});

describe('C14: Elamy (the display font) is reserved for display, title and signature', () => {
  it('in globals.css only .type-display / .type-title / .type-signature set font-family to the display font', () => {
    expect(displayFontSelectors(css).sort()).toEqual(['.type-display', '.type-signature', '.type-title']);
  });

  it('component css modules never set the display font', () => {
    const offenders = readSources()
      .filter((f) => f.name.endsWith('.module.css'))
      .filter((f) => displayFontSelectors(f.text).length > 0)
      .map((f) => f.path);
    expectNone(offenders, 'css module using Elamy');
  });
});

describe('C14c: the Elamy ink box (--ink-top / --ink-bottom) on the three Elamy classes', () => {
  const norm = (v: string | undefined) => (v ?? '').replace(/\s+/g, ' ').trim();
  const rootBlocks = [...clean.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1]);
  const rootVar = (name: string) => rootBlocks.map((b) => b.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1].trim()).find(Boolean);
  // floors from the fontkit measurement of Elamy (see globals.css): ink reaches +1.106em / -0.562em on
  // צ ק and further on the final forms; below these values a reveal animation clips glyphs on iOS
  const FLOOR = { top: 0.72, bottom: 0.62 };
  // NS-45: the INLINE floor. fontkit over Elamy 700/400 and every live title string: lamed (ל) and some
  // finals swash up to +0.513em left / +0.506em right of the advance box (whole-font worst case 0.706em lsb,
  // 0.506em rsb). A reveal layer is clipped at its border box, so the swash was cut mid-fade on iOS.
  const INLINE_FLOOR = 0.52;

  it('--ink-top and --ink-bottom are declared on :root, in em, at or above the measured floor', () => {
    const top = rootVar('--ink-top');
    const bottom = rootVar('--ink-bottom');
    expect(top, '--ink-top missing from :root').toBeDefined();
    expect(bottom, '--ink-bottom missing from :root').toBeDefined();
    expect(top, '--ink-top must be an em length').toMatch(/^\d*\.?\d+em$/);
    expect(bottom, '--ink-bottom must be an em length').toMatch(/^\d*\.?\d+em$/);
    expect(parseFloat(top!), '--ink-top shrank below the measured ink overshoot').toBeGreaterThanOrEqual(FLOOR.top);
    expect(parseFloat(bottom!), '--ink-bottom shrank below the measured ink overshoot').toBeGreaterThanOrEqual(FLOOR.bottom);
  });

  it('--ink-inline is declared on :root, in em, and covers the measured sideways overhang (NS-45)', () => {
    const inline = rootVar('--ink-inline');
    expect(inline, '--ink-inline missing from :root').toBeDefined();
    expect(inline, '--ink-inline must be an em length').toMatch(/^\d*\.?\d+em$/);
    expect(parseFloat(inline!), '--ink-inline shrank below the measured swash overhang').toBeGreaterThanOrEqual(INLINE_FLOOR);
  });

  it.each(['Elamy-Bold.woff2', 'Elamy-Regular.woff2'])(
    '--ink-inline covers the real sideways overhang of every Hebrew letter and digit in %s (measured, NS-45)',
    (file) => {
      const font = fontkit.openSync(path.join(process.cwd(), 'src/app/fonts', file));
      const chars = [...Array(0x5ea - 0x5d0 + 1).keys()].map((i) => String.fromCodePoint(0x5d0 + i)).concat([...'0123456789.?,!']);
      let worst = 0;
      for (const ch of chars) {
        const g = font.glyphForCodePoint(ch.codePointAt(0)!);
        const { minX, maxX } = g.bbox;
        if (maxX <= minX) continue;
        worst = Math.max(worst, -minX / font.unitsPerEm, (maxX - g.advanceWidth) / font.unitsPerEm);
      }
      const inline = parseFloat(rootVar('--ink-inline')!);
      expect(worst, 'sanity: the font really overhangs (otherwise the measurement is broken)').toBeGreaterThan(0.3);
      expect(inline, `--ink-inline (${inline}em) must enclose the worst glyph overhang (${worst.toFixed(3)}em) in ${file}`).toBeGreaterThanOrEqual(worst);
    },
  );

  it.each(['display', 'title', 'signature'])(
    '.type-%s pads by the ink box and cancels it with an equal negative margin (layout stays put)',
    (name) => {
      const body = clean.match(new RegExp(`\\.type-${name}\\s*\\{([^}]*)\\}`))?.[1];
      expect(body, `.type-${name} rule missing`).toBeDefined();
      const get = (prop: string) => norm(body!.match(new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;]+);`))?.[1]);
      expect(get('padding-block'), `.type-${name} padding-block`).toBe('var(--ink-top) var(--ink-bottom)');
      expect(get('margin-block'), `.type-${name} margin-block`).toBe('calc(-1 * var(--ink-top)) calc(-1 * var(--ink-bottom))');
      expect(get('padding-inline'), `.type-${name} padding-inline`).toBe('var(--ink-inline)');
      expect(get('margin-inline'), `.type-${name} margin-inline`).toBe('calc(-1 * var(--ink-inline))');
    },
  );

  it('no other .type-* class carries the ink box (it is Elamy-only)', () => {
    const offenders = [...clean.matchAll(/\.type-([a-z-]+)\s*\{([^}]*)\}/g)]
      .filter(([, name, body]) => !['display', 'title', 'signature'].includes(name) && /--ink-/.test(body))
      .map(([, name]) => `.type-${name}`);
    expectNone(offenders, 'ink-box vars on a non-Elamy class');
  });
});
