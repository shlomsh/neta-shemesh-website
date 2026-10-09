// @vitest-environment node
/**
 * SANITY C11/C17 + D18: static scans over src/**\/*.{ts,tsx,css}.
 *
 * These are globs, not file names, so moving files under sections/ does not matter.
 *
 * History: ad-hoc `text-[18px]`, `font-black`, `font-sans` and removed classes (`section-header`,
 * `hero-title`, `data-body-large`...) crept back every time a component was re-exported from the
 * template; the Vercel prod build failed on next/font/google; hex colours outside the 4-colour
 * palette appeared with each new card.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ROOT,
  SCAN_RULES,
  classLiterals,
  expectNone,
  pickSource,
  readSources,
  sourceNamed,
  stripCssComments,
  typeLiteralOffenses,
  type SourceFile,
} from './helpers';

const sources = readSources();
const code = sources.filter((s) => /\.tsx?$/.test(s.name));

/** every offender as "file:line  match" */
function scan(files: typeof sources, re: RegExp): string[] {
  const hits: string[] = [];
  for (const f of files) {
    for (const m of f.text.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))) {
      const line = f.text.slice(0, m.index).split('\n').length;
      hits.push(`${f.path}:${line}  ${m[0]}`);
    }
  }
  return hits;
}

const rule = (id: string) => SCAN_RULES.find((r) => r.id === id)!;

describe('scan rules: positive controls (each regex flags a known-bad sample and spares a known-good one)', () => {
  it.each(SCAN_RULES.map((r) => [r.id, r] as const))('%s', (_id, r) => {
    expect(r.bad.length, `${r.id} needs bad samples`).toBeGreaterThan(0);
    expect(r.good.length, `${r.id} needs good samples`).toBeGreaterThan(0);
    for (const sample of r.bad) expect(new RegExp(r.re.source, r.re.flags.replace('g', '')).test(sample), `${r.id} must flag: ${sample}`).toBe(true);
    for (const sample of r.good) expect(new RegExp(r.re.source, r.re.flags.replace('g', '')).test(sample), `${r.id} must NOT flag: ${sample}`).toBe(false);
  });

  it('typeLiteralOffenses flags stacked type classes, font-latin, bracket and named leading/tracking, and spares the allowed forms', () => {
    const bad = [
      'type-body type-lead',
      'type-lead font-latin',
      'type-quote leading-[1.2]',
      'type-lead tracking-[0.05em]',
      'type-body tracking-wide',
      'type-body leading-tight',
      'type-lead leading-none',
      'type-quote tracking-[-0.01em]', // the -0.01em exception is only for title/display
    ];
    for (const t of bad) expect(typeLiteralOffenses(t).length, `must flag: ${t}`).toBeGreaterThan(0);
    const good = [
      'type-title font-bold tracking-[-0.01em] text-[color:var(--header-color)]',
      'type-display font-bold tracking-[-0.01em]',
      'type-lead inline-flex items-center font-bold',
      'font-latin', // no type class: fine (the span form)
      'tracking-wide uppercase', // no type class: out of scope
    ];
    for (const t of good) expect(typeLiteralOffenses(t), `must NOT flag: ${t}`).toEqual([]);
  });

  it('pickSource matches by path suffix and throws on ambiguity or absence', () => {
    const f = (path: string): SourceFile => ({ path, name: path.split('/').pop()!, text: '' });
    const files = [f('src/app/layout.tsx'), f('src/app/blog/layout.tsx'), f('src/components/motion/SoftSnap.tsx')];
    expect(pickSource(files, 'app/layout.tsx').path).toBe('src/app/layout.tsx');
    expect(pickSource(files, 'SoftSnap.tsx').path).toBe('src/components/motion/SoftSnap.tsx');
    expect(() => pickSource(files, 'layout.tsx')).toThrow(/ambiguous/);
    expect(() => pickSource(files, 'nope.tsx')).toThrow(/no source file/);
  });
});

describe('C11: no ad-hoc type sizes, weights or removed classes in src', () => {
  // Whole-source rules live in helpers.SCAN_RULES (with samples). Add an explicit, commented
  // allow-list ONLY for a legitimate case (none exists today).
  const WHOLE_SOURCE = [
    'px-size', 'clamp-size', 'tw-named-size', 'font-black', 'font-sans', 'extra-weights', 'numeric-weight',
    'data-body-large', 'section-header', 'hero-title', 'sub-header', 'contact-email-link',
    'fontSize-style', 'h-screen', 'ungated-h-100svh', 'display-font-in-component', 'ink-box-margin',
  ];

  it.each(WHOLE_SOURCE)('src has no %s', (id) => {
    const r = rule(id);
    expectNone(scan(sources, r.re), `src contains ${r.label}`);
  });

  it('component-level css files (css modules) do not set a font-size under the 14px floor', () => {
    const offenders: string[] = [];
    for (const f of sources.filter((s) => s.name.endsWith('.css') && s.name !== 'globals.css')) {
      for (const m of stripCssComments(f.text).matchAll(/font-size\s*:\s*([^;}]+)/g)) {
        for (const px of m[1].matchAll(/(\d+(?:\.\d+)?)px/g)) if (Number(px[1]) < 14) offenders.push(`${f.path}: ${m[0]}`);
      }
    }
    expectNone(offenders, 'font-size below 14px in a css module');
  });

  it('<main> never has overflow-hidden on the home page (it must clip); the blog pages are the only tolerated main with it', () => {
    // Blog pages do not mount SoftSnap, so their <main overflow-hidden> cannot break snapping.
    // The three pages share <PageShell> (components/site/PageShell.tsx), which builds the <main> class from
    // its `overflow` prop, so the page-level form is `<PageShell overflow="hidden">`: scan both spellings.
    const hits = [...scan(sources, rule('main-overflow-hidden').re), ...scan(sources, rule('pageshell-overflow-hidden').re)]
      .filter((h) => !h.includes('/blog/'));
    expectNone(hits, '<main> with overflow-hidden outside the blog (kills soft snap)');
  });

  it('no class list that carries a type-* class stacks a second type-*, adds font-latin, or overrides line-height/tracking', () => {
    const lits = classLiterals(sources);
    expect(lits.length, 'scan found no type-* class lists: regex went blind').toBeGreaterThan(20);
    const offenders = lits.flatMap(({ file, text }) => typeLiteralOffenses(text).map((o) => `${file}: ${o}`));
    expectNone(offenders, 'type-* class list problems');
  });
});

describe('C17: fonts (declared in app/fonts.ts, applied in app/layout.tsx)', () => {
  const layout = sourceNamed('app/fonts.ts').text;
  const root = sourceNamed('app/layout.tsx').text;
  const blocks = [...layout.matchAll(/const (\w+) = localFont\(\{([\s\S]*?)\n\}\);/g)].map((m) => ({ name: m[1], body: m[2] }));
  const block = (name: string) => blocks.find((b) => b.name === name)?.body ?? '';
  const weights = (body: string) => [...body.matchAll(/weight:\s*"(\d+)"/g)].map((m) => m[1]);

  it('exactly three next/font/local fonts: elamy, stanga, latin', () => {
    expect(blocks.map((b) => b.name).sort()).toEqual(['elamy', 'latin', 'stanga']);
    expect(layout).toContain('from "next/font/local"');
  });

  it('Stanga is 400 + 700 only (no 300), --font-stanga, adjustFontFallback: false', () => {
    const b = block('stanga');
    expect(weights(b)).toEqual(['400', '700']);
    expect(b).not.toMatch(/light|300/);
    expect(b).toContain('variable: "--font-stanga"');
    expect(b).toMatch(/adjustFontFallback:\s*false/);
  });

  it('Elamy is 400 + 700 with --font-elamy', () => {
    const b = block('elamy');
    expect(weights(b)).toEqual(['400', '700']);
    expect(b).toContain('variable: "--font-elamy"');
  });

  it('Roboto Condensed latin companion is 400 + 700, local, --font-latin-next', () => {
    const b = block('latin');
    expect(weights(b)).toEqual(['400', '700']);
    expect(b).toContain('RobotoCondensed-Regular.woff2');
    expect(b).toContain('RobotoCondensed-Bold.woff2');
    expect(b).toContain('variable: "--font-latin-next"');
  });

  it('no next/font/google anywhere in src (the production Vercel build failed fetching Google Fonts)', () => {
    expectNone(scan(sources, rule('google-fonts').re), 'Google Fonts fetch in src (breaks the Vercel prod build)');
  });

  it('layout.tsx applies all three font variables to <html> and imports globals.css after the fonts', () => {
    // the <html> className is `cx(elamy.variable, stanga.variable, latin.variable)`
    for (const f of ['elamy', 'stanga', 'latin']) expect(root, `${f}.variable on <html>`).toMatch(new RegExp(`<html[^>]*className=\\{cx\\([^)]*\\b${f}\\.variable\\b`));
    expect(root.indexOf('from "./fonts"'), 'fonts imported').toBeGreaterThan(-1);
    expect(root.indexOf('import "./globals.css"'), 'globals.css imported after ./fonts so our rules win').toBeGreaterThan(root.indexOf('from "./fonts"'));
  });

  it('every woff2 referenced by fonts.ts is shipped in public/fonts', () => {
    const files = [...layout.matchAll(/public\/fonts\/([\w.-]+\.woff2)/g)].map((m) => m[1]);
    expect(files.length).toBe(6);
    for (const f of files) expect(existsSync(join(ROOT, 'public/fonts', f)), `public/fonts/${f}`).toBe(true);
  });
});

describe('D18: palette lock (hex colours)', () => {
  const BRAND = ['#7a5978', '#c49ab8', '#ecc8ce', '#fff5f0'];
  /**
   * Everything else must be listed here WITH a reason. Keyed by hex + file NAME (not path)
   * so moving a file does not break the entry.
   */
  const ALLOWED: Array<{ hex: string; file: string; reason: string }> = [
    { hex: '#25d366', file: 'ContactFAB.tsx', reason: 'WhatsApp brand green: owner ruling, stays green' },
    { hex: '#1ebe5b', file: 'ContactFAB.tsx', reason: 'darker hover shade of the WhatsApp green' },
    { hex: '#ffffff', file: 'ContactFAB.tsx', reason: 'white label/ring on the WhatsApp green (WhatsApp brand spec)' },
    { hex: '#000', file: 'globals.css', reason: '--color-black in @theme, kept (Tailwind default value) for the photo scrims only: bg-black/20, from-black/60 ...' },
  ];

  function hexHits() {
    const hits: Array<{ hex: string; file: string; path: string; line: number }> = [];
    for (const f of sources) {
      // comments legitimately quote derived colours (#F6E7E8 veil, etc.)
      const text = f.name.endsWith('.css') ? stripCssComments(f.text) : f.text;
      for (const m of text.matchAll(new RegExp(rule('hex').re.source, 'g'))) {
        hits.push({ hex: m[0].toLowerCase(), file: f.name, path: f.path, line: text.slice(0, m.index).split('\n').length });
      }
    }
    return hits;
  }

  it('only the 4 brand hexes plus the allow-listed WhatsApp / legacy ones appear in src', () => {
    const offenders = hexHits()
      .filter((h) => !BRAND.includes(h.hex) && !ALLOWED.some((a) => a.hex === h.hex && a.file === h.file))
      .map((h) => `${h.path}:${h.line}  ${h.hex}`);
    expectNone(offenders, 'new hex colour outside the palette (add to ALLOWED with a reason only if legitimate)');
  });

  it('every allow-list entry is still in use (prune the list when a colour goes away)', () => {
    const hits = hexHits();
    const stale = ALLOWED.filter((a) => !hits.some((h) => h.hex === a.hex && h.file === a.file)).map((a) => `${a.file} ${a.hex}`);
    expectNone(stale, 'allow-list entries no longer used: delete them from ALLOWED');
  });

  it('rgb()/rgba() literals are only brand colours or black (shadows)', () => {
    const OK = ['122,89,120', '196,154,184', '236,200,206', '255,245,240', '0,0,0'];
    const offenders: string[] = [];
    for (const f of sources) {
      for (const m of f.text.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
        if (!OK.includes(`${m[1]},${m[2]},${m[3]}`)) offenders.push(`${f.path}: ${m[0]}`);
      }
    }
    expectNone(offenders, 'rgb()/rgba() literal that is not a brand colour');
  });

  it('no stock Tailwind palette colours (bg-red-500, text-gray-600, ...)', () => {
    expectNone(scan(code, rule('stock-palette').re), 'stock Tailwind palette colour');
  });
});

describe('R9: colour utilities come from the @theme palette, not from arbitrary var() values', () => {
  /**
   * Arbitrary `text-[var(--color-plum)]` style utilities that are legitimately left, keyed by file NAME,
   * each WITH a reason. None today: `text-[color:var(--header-color)]` (SectionTitle) is not a palette
   * colour, it follows the tone, so it does not match the rule at all.
   */
  const ALLOWED: Record<string, string> = {};

  const hits = scan(code, rule('arbitrary-colour-var').re);

  it('no component uses text-[var(--color-*)] / bg-[var(--color-*)] / ring-[...]: use text-plum, bg-cream, ring-mauve ...', () => {
    const unknown = hits.filter((h) => !Object.keys(ALLOWED).some((name) => h.split(':')[0].endsWith('/' + name)));
    expectNone(unknown, 'arbitrary colour utility (the @theme colour name is the utility: text-plum, bg-cream, ring-cream/35 ...)');
  });

  it('every allow-list entry is still in use (prune ALLOWED when it is fixed)', () => {
    for (const name of Object.keys(ALLOWED)) expect(hits.some((h) => h.split(':')[0].endsWith('/' + name)), `${name} no longer needs an exception`).toBe(true);
  });

  it('no bg-white / text-white / bg-white/35 / ring-white: bg-white is pure #fff, the rest resolve through the :root --color-white override; write the -cream utility', () => {
    expectNone(scan(code, rule('white-utility').re), 'named white utility (use cream: same computed colour, no reliance on the :root override)');
  });

  it('Tailwind scans only src (source(none) + @source "../"), so tests, docs, markdown, configs and public/ cannot generate junk CSS', () => {
    // raw text on purpose: the naive stripCssComments would eat any `/**/` inside a glob
    const css = sourceNamed('globals.css').text;
    expect(css, 'auto-detection must be off').toContain('@import "tailwindcss" source(none);');
    expect(css, 'src/ is the one scanned root (path relative to src/app/globals.css)').toContain('@source "../";');
    expect(css, 'the READMEs inside src quote sample classes, so markdown stays excluded').toContain('@source not "../**/*.md";');
  });

  it('the default Tailwind palette is dropped (--color-*: initial) and white stays the cream alias', () => {
    const css = stripCssComments(sourceNamed('globals.css').text);
    const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(theme).toMatch(/--color-\*\s*:\s*initial\s*;/);
    expect(theme).toMatch(/--color-black\s*:/);
  });

  it('the four palette names are declared as @theme colours, so text-plum / bg-cream / ... really generate CSS', () => {
    const css = stripCssComments(sourceNamed('globals.css').text);
    const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    for (const name of ['plum', 'mauve', 'blush', 'cream']) expect(theme, `--color-${name} in @theme`).toMatch(new RegExp(`--color-${name}\\s*:\\s*#`));
  });
});

describe('C1: RTL is declared once, on <html>', () => {
  /**
   * `dir="rtl"` below <html> that is legitimately kept, keyed by file NAME, each WITH a reason
   * (e.g. an element whose mixed Hebrew / Latin inline run reorders without the bidi isolate).
   * None today. `dir="ltr"` (phone, email, step numerals) is not covered by the rule.
   */
  const ALLOWED: Record<string, string> = {};

  const hits = scan(code, rule('rtl-dir').re).filter((h) => !h.split(':')[0].endsWith('/app/layout.tsx'));

  it('no component or page sets dir="rtl" (the document is already rtl); layout.tsx is the one place', () => {
    const unknown = hits.filter((h) => !Object.keys(ALLOWED).some((name) => h.split(':')[0].endsWith('/' + name)));
    expectNone(unknown, 'redundant dir="rtl" (add the file to ALLOWED with a reason only if removing it changes the rendering)');
  });

  it('every allow-list entry is still in use (prune ALLOWED when it is fixed)', () => {
    for (const name of Object.keys(ALLOWED)) expect(hits.some((h) => h.split(':')[0].endsWith('/' + name)), `${name} no longer needs dir="rtl"`).toBe(true);
  });

  it('<html lang="he" dir="rtl"> in layout.tsx and `direction: rtl` on html/body in globals.css are still there', () => {
    expect(sourceNamed('app/layout.tsx').text).toMatch(/<html[^>]*\bdir="rtl"/);
    expect(stripCssComments(sourceNamed('globals.css').text)).toMatch(/direction\s*:\s*rtl/);
  });
});
