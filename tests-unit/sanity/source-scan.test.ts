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
    'fontSize-style', 'h-screen', 'ungated-h-100svh', 'display-font-in-component', 'ink-box-margin', 'ink-box-inline',
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

  it('exactly four next/font/local calls, three families: elamy (Regular + Bold calls), stanga, latin', () => {
    expect(blocks.map((b) => b.name).sort()).toEqual(['elamy', 'elamyBold', 'latin', 'stanga']);
    expect(layout).toContain('from "next/font/local"');
  });

  it('Stanga is 400 + 700 only (no 300), --font-stanga, adjustFontFallback: false', () => {
    const b = block('stanga');
    expect(weights(b)).toEqual(['400', '700']);
    expect(b).not.toMatch(/light|300/);
    expect(b).toContain('variable: "--font-stanga"');
    expect(b).toMatch(/adjustFontFallback:\s*false/);
  });

  it('Elamy is 400 (elamy, owns --font-elamy) + 700 (elamyBold), one shared family name "elamy"', () => {
    const regular = block('elamy');
    const bold = block('elamyBold');
    expect(weights(regular)).toEqual(['400']);
    expect(regular).toContain('Elamy-Regular.woff2');
    expect(regular).toContain('variable: "--font-elamy"');
    expect(weights(bold)).toEqual(['700']);
    expect(bold).toContain('Elamy-Bold.woff2');
    expect(bold, 'the Bold call must not declare a second variable').not.toContain('variable:');
    for (const b of [regular, bold]) expect(b).toContain('{ prop: "font-family", value: "elamy" }');
  });

  it('NS-29: exactly three preloaded faces (Elamy Bold, Stanga Regular + Bold); Elamy Regular and both Roboto Condensed faces are not preloaded', () => {
    const preloaded = (b: string) => !/preload:\s*false/.test(b);
    expect(preloaded(block('elamyBold')), 'elamyBold preload').toBe(true);
    expect(block('elamyBold')).toMatch(/preload:\s*true/);
    expect(block('stanga')).toMatch(/preload:\s*true/);
    expect(weights(block('stanga')).length, 'stanga faces').toBe(2);
    expect(block('elamy')).toMatch(/preload:\s*false/);
    expect(block('latin')).toMatch(/preload:\s*false/);
    // 1 (elamyBold) + 2 (stanga) faces preload; nothing else does
    const count = ['elamy', 'elamyBold', 'stanga', 'latin'].reduce((n, name) => n + (preloaded(block(name)) ? weights(block(name)).length : 0), 0);
    expect(count).toBe(3);
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
    { hex: '#25d366', file: 'ContactFAB.tsx', reason: 'WhatsApp brand green: owner ruling, stays green (re-confirmed 2026-10-09: owner kept the native WhatsApp colours)' },
    { hex: '#1ebe5b', file: 'ContactFAB.tsx', reason: 'darker hover shade of the WhatsApp green (owner kept the native WhatsApp colours, 2026-10-09)' },
    { hex: '#ffffff', file: 'ContactFAB.tsx', reason: 'white label and glyph on the WhatsApp green (WhatsApp brand spec; owner kept the native WhatsApp colours, 2026-10-09; 1.98:1 is an owner-approved exception). The focus ring is cream + plum, not white (NS-41)' },
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

// ════════════════════════════════════════════════════════════════════════════
// NS-42: contrast and focus bans (own block, kept at the end of the file)
// ════════════════════════════════════════════════════════════════════════════
import { CONTRAST_BANS, containsBanSample, maskIconHasDefaultFocus, ratchetBan, type BanAllow } from './helpers';

describe('NS-42: contrast and focus source bans (each with an allow-list that only shrinks)', () => {
  /**
   * Today's offenders per rule, keyed by a path suffix under src/ (`blog/[slug]/page.tsx`; a bare file name only when it is unique) with the number of offences in it. The table is a
   * RATCHET: a new offence (or a file not listed) fails; an entry whose offences are gone ALSO fails
   * ("stale allow entry, remove it"), so the fix commit has to delete its row.
   */
  const BAN_ALLOW: Record<string, BanAllow[]> = {
    'text-mauve': [
      { file: 'Attribution.tsx', count: 1, reason: 'testimonial role line in mauve (type-small)' },
    ],
    'small-text-blush': [
      { file: 'HeroHeading.tsx', count: 1, reason: 'the hand-drawn underline stroke (aria-hidden svg, currentColor): decorative, carries no text' },
    ],
    'text-colour-mix-transparent': [
      { file: 'PostBody.tsx', count: 1, reason: 'pull-quote: plum at 92%' },
    ],
    // Rows marked OWNER EXCEPTION are permanent owner decisions (2026-10-09), not debt: leave them in place.
    'bg-mauve-with-text': [
      { file: 'ExpertiseCard.tsx', count: 1, reason: 'OWNER EXCEPTION (permanent, ruling 2026-10-09, do not "fix"): Expertise pills keep the mauve chip with cream label; bold cream 14px on bg-mauve, 2.26:1' },
    ],
    'opacity-on-text': [
      { file: 'IconButton.tsx', count: 1, reason: 'icon-only button: the child is an svg, not text; hover fades the icon (NS-41 may swap it for a colour change)' },
      { file: 'ContactDetails.tsx', count: 1, reason: 'phone / email link fades to opacity-80 on hover' },
      { file: 'ExpertiseCard.tsx', count: 1, reason: 'OWNER EXCEPTION (permanent, ruling 2026-10-09, do not "fix"): the Expertise pill chip is bg-mauve opacity-95' },
      { file: 'MobileMenu.tsx', count: 1, reason: 'overlay nav links fade to opacity-75 on hover' },
      { file: 'SiteNav.tsx', count: 1, reason: 'desktop nav links fade to opacity-75 on hover' },
    ],
    'focus-outline-none': [
      { file: 'PageShell.tsx', count: 1, reason: '<main tabIndex=-1> is the skip-link target: programmatic focus only, not reachable by Tab; NS-41 decides whether it needs a ring' },
    ],
    'focus-mask-link': [],
  };

  const bySource = (id: string) => {
    const r = CONTRAST_BANS.find((b) => b.id === id)!;
    let hits = sources.flatMap((f) => r.find(f));
    // a MaskIcon whose own anchor ships a focus ring covers every `<MaskIcon as="a">` usage
    if (id === 'focus-mask-link' && maskIconHasDefaultFocus()) hits = hits.filter((h) => !h.match.startsWith('<MaskIcon'));
    return hits;
  };

  it('the rule table and the allow table list the same rules', () => {
    expect(Object.keys(BAN_ALLOW).sort()).toEqual(CONTRAST_BANS.map((b) => b.id).sort());
  });

  describe.each(CONTRAST_BANS.map((b) => [b.id, b] as const))('%s', (id, r) => {
    it('positive control: flags every known-bad sample and spares every known-good one', () => {
      expect(r.bad.length, `${id} needs bad samples`).toBeGreaterThan(0);
      expect(r.good.length, `${id} needs good samples`).toBeGreaterThan(0);
      for (const s of r.bad) expect(containsBanSample(r, s), `${id} must flag:\n${s}`).toBe(true);
      for (const s of r.good) expect(containsBanSample(r, s), `${id} must NOT flag:\n${s}`).toBe(false);
    });

    it(`src has no new offender: ${r.label}`, () => {
      const problems = ratchetBan(bySource(id), BAN_ALLOW[id]).filter((p) => !p.startsWith('stale'));
      expectNone(problems, `${id}: new offence (fix it, or add the file to BAN_ALLOW with a reason only if the owner agrees)`);
    });

    it('every allow entry still has its offence: stale allow entry, remove it', () => {
      const problems = ratchetBan(bySource(id), BAN_ALLOW[id]).filter((p) => p.startsWith('stale'));
      expectNone(problems, `${id}: the offence is gone, delete or lower the BAN_ALLOW row`);
    });

    it('every allow entry has a reason and a positive count', () => {
      for (const a of BAN_ALLOW[id]) {
        expect(a.reason.length, `${id} ${a.file}`).toBeGreaterThan(10);
        expect(a.count, `${id} ${a.file}`).toBeGreaterThan(0);
      }
    });
  });

  it('ratchetBan: more hits than allowed, a file that is not listed, and a vanished offence are all reported', () => {
    const h = (file: string, line = 1) => ({ file, path: `src/${file}`, line, match: 'x' });
    const allow: BanAllow[] = [{ file: 'A.tsx', count: 2, reason: 'because' }];
    expect(ratchetBan([h('A.tsx'), h('A.tsx', 2)], allow)).toEqual([]);
    expect(ratchetBan([h('A.tsx'), h('A.tsx', 2), h('A.tsx', 3)], allow)[0]).toMatch(/^new offence in A\.tsx/);
    expect(ratchetBan([h('A.tsx'), h('A.tsx', 2), h('B.tsx')], allow)[0]).toMatch(/^new offence in src\/B\.tsx/);
    expect(ratchetBan([h('A.tsx')], allow)[0]).toMatch(/^stale allow entry, lower its count 2 -> 1/);
    expect(ratchetBan([], allow)[0]).toMatch(/^stale allow entry, remove it: A\.tsx/);
    // path suffixes tell two page.tsx files apart
    const p = (path: string) => ({ file: 'page.tsx', path, line: 1, match: 'x' });
    const two: BanAllow[] = [{ file: 'blog/page.tsx', count: 1, reason: 'because' }];
    expect(ratchetBan([p('src/app/blog/page.tsx')], two)).toEqual([]);
    expect(ratchetBan([p('src/app/blog/page.tsx'), p('src/app/blog/[slug]/page.tsx')], two)[0]).toMatch(/^new offence in src\/app\/blog\/\[slug\]\/page\.tsx/);
  });
});
