// @vitest-environment node
/**
 * SANITY: static bans over src/**\/*.{ts,tsx,css}. Every ban is stated once, here, with a bad/good
 * sample table in helpers.ts (SCAN_RULES, CONTRAST_BANS) so a regex that goes blind fails loudly.
 *
 * History: ad-hoc `text-[18px]`, `font-black` and removed template classes crept back with every
 * re-export; the Vercel prod build failed on next/font/google; off-palette hexes appeared with each
 * new card; mauve/blush text and dropped focus rings came back after contrast fixes.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CONTRAST_BANS,
  ROOT,
  SCAN_RULES,
  classLiterals,
  containsBanSample,
  expectNone,
  ratchetBan,
  readSources,
  sourceNamed,
  stripCssComments,
  typeLiteralOffenses,
  type BanAllow,
} from './helpers';

const sources = readSources();
const code = sources.filter((s) => /\.tsx?$/.test(s.name));
const rule = (id: string) => SCAN_RULES.find((r) => r.id === id)!;
const noComments = (s: string) => s.split('\n').filter((l) => !/^\s*(\/\/|\*|\{?\/\*)/.test(l)).join('\n');
const theme = (css: string) => stripCssComments(css).match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

/** every offender as "file:line  match" */
function scan(files: typeof sources, re: RegExp): string[] {
  const hits: string[] = [];
  for (const f of files) {
    for (const m of f.text.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))) {
      hits.push(`${f.path}:${f.text.slice(0, m.index).split('\n').length}  ${m[0]}`);
    }
  }
  return hits;
}

describe('scan rules: each regex flags its known-bad samples and spares its known-good ones', () => {
  it.each(SCAN_RULES.map((r) => [r.id, r] as const))('%s', (_id, r) => {
    const re = new RegExp(r.re.source, r.re.flags.replace('g', ''));
    for (const s of r.bad) expect(re.test(s), `${r.id} must flag: ${s}`).toBe(true);
    for (const s of r.good) expect(re.test(s), `${r.id} must NOT flag: ${s}`).toBe(false);
  });

  it('typeLiteralOffenses flags stacked type classes, font-latin and leading/tracking overrides, and spares the allowed forms', () => {
    for (const t of ['type-body type-lead', 'type-lead font-latin', 'type-quote leading-[1.2]', 'type-body tracking-wide', 'type-quote tracking-[-0.01em]']) {
      expect(typeLiteralOffenses(t).length, `must flag: ${t}`).toBeGreaterThan(0);
    }
    for (const t of ['type-title font-bold tracking-[-0.01em]', 'type-lead inline-flex items-center font-bold', 'font-latin', 'tracking-wide uppercase']) {
      expect(typeLiteralOffenses(t), `must NOT flag: ${t}`).toEqual([]);
    }
  });
});

describe('type, class and layout bans (CLAUDE.md typography rule 7, layout)', () => {
  // The whole-source rules live in helpers.SCAN_RULES (with samples). An exception needs a named table with a reason.
  const BANNED = [
    'px-size', 'clamp-size', 'tw-named-size', 'font-off-scale', 'removed-classes', 'fontSize-style',
    'card-height', 'display-font-in-component', 'ink-box-margin', 'ink-box-inline', 'css-scroll-snap', 'google-fonts',
  ];
  it.each(BANNED)('src has no %s', (id) => {
    const r = rule(id);
    expectNone(scan(id === 'card-height' ? code : sources, r.re), `src contains ${r.label}`);
  });

  it('no css file sets a font-size under the 14px floor', () => {
    const offenders: string[] = [];
    let seen = 0;
    for (const f of sources.filter((s) => s.name.endsWith('.css'))) {
      for (const m of stripCssComments(f.text).matchAll(/font-size\s*:\s*([^;}]+)/g)) {
        seen++;
        for (const px of m[1].matchAll(/(\d+(?:\.\d+)?)px/g)) if (Number(px[1]) < 14) offenders.push(`${f.path}: ${m[0]}`);
      }
    }
    expect(seen, 'the scan went blind').toBeGreaterThan(5);
    expectNone(offenders, 'font-size below 14px');
  });

  it('no class list that carries a type-* class stacks a second type-*, adds font-latin, or overrides line-height/tracking', () => {
    const lits = classLiterals(sources);
    expect(lits.length, 'scan found no type-* class lists: regex went blind').toBeGreaterThan(20);
    expectNone(lits.flatMap(({ file, text }) => typeLiteralOffenses(text).map((o) => `${file}: ${o}`)), 'type-* class list problems');
  });

  // "Written once" lockups: a primitive or token owns the spelling; the same text anywhere else is a copy that will drift.
  const LOCKUPS: Array<{ what: string; re: RegExp; only?: string[]; bad: string }> = [
    { what: 'lock/grow one-screen height classes (use <Section fit>)', re: /lg:h-\[(?:max\(100svh,720px\)|100svh)\]|lg:min-h-\[max\(100svh,720px\)\]/, only: ['primitives/layout/Section.tsx'], bad: 'lg:h-[100svh]' },
    { what: 'repeated clamp paddings (use Container gutter / Section pad)', re: /px-\[clamp\(24px,5vw,80px\)\]|py-\[clamp\(56px,8vw,120px\)\]|px-\[clamp\(16px,4vw,48px\)\]|py-\[clamp\(48px,5vw,96px\)\]/, bad: 'py-[clamp(56px,8vw,120px)]' },
    { what: 'a bold/tracked type-title (700 and -0.01em are in the class)', re: /type-title font-bold|type-title tracking-\[-0\.01em\]/, bad: 'type-title font-bold' },
    { what: 'the literal .on-dark class', re: /(?<![\w-])on-dark(?![\w-])/, only: ['SectionTitle.tsx'], bad: 'on-dark type-title' },
    { what: 'onDark / onPhoto on a title or header (photo bands only)', re: /<(?:SectionTitle|SectionHeader|SectionSubtitle)\b[^>]*?\b(?:onDark|onPhoto)\b/, only: ['CtaBand.tsx', 'Footer.tsx', 'SectionHeader.tsx'], bad: '<SectionHeader\n id="x"\n onPhoto' },
    { what: 'a bare font-[var(--font-*)] class (generates nothing: use font-[family-name:var(--font-*)])', re: /font-\[var\(--font-[\w-]+\)\]/, bad: 'font-[var(--font-body)]' },
    { what: 'the mask-image style (use <MaskIcon>)', re: /WebkitMaskImage|maskImage/, only: ['primitives/ui/MaskIcon.tsx'], bad: '{ WebkitMaskImage: x }' },
    { what: 'the cover-fit photo (use <Photo>)', re: /absolute inset-0 (?:h-full w-full|w-full h-full) object-cover/, only: ['primitives/ui/Photo.tsx'], bad: 'absolute inset-0 h-full w-full object-cover' },
    { what: 'the round 44px icon button (use <IconButton>)', re: /h-\[44px\] w-\[44px\] items-center justify-center rounded-full/, only: ['primitives/ui/IconButton.tsx'], bad: 'h-[44px] w-[44px] items-center justify-center rounded-full' },
    { what: 'a padding-top aspect-ratio spacer (use Photo ratio / aspect-[w/h])', re: /(?<![\w-])pt-\[\d+(?:\.\d+)?%\]/, bad: 'pt-[62%]' },
    { what: 'a static import of the slide pager (touch devices must not download it; the gate uses import())', re: /from\s+['"][^'"]*SlidePager['"]/, only: ['SlidePager.tsx'], bad: "import { SlidePager } from './SlidePager'" },
  ];
  it.each(LOCKUPS.map((l) => [l.what, l] as const))('%s is written in one place only', (_what, l) => {
    expect(l.re.test(l.bad), 'the regex went blind').toBe(true);
    const offenders = code.filter((f) => !l.only?.some((o) => f.path.endsWith(o)) && l.re.test(noComments(f.text))).map((f) => f.path);
    expectNone(offenders, 'written outside its owner');
  });
});

describe('fonts (app/fonts.ts, applied in app/layout.tsx)', () => {
  const fonts = sourceNamed('app/fonts.ts').text;
  const root = sourceNamed('app/layout.tsx').text;
  const blocks = Object.fromEntries([...fonts.matchAll(/const (\w+) = localFont\(\{([\s\S]*?)\n\}\);/g)].map((m) => [m[1], m[2]]));
  const weights = (name: string) => [...blocks[name].matchAll(/weight:\s*"(\d+)"/g)].map((m) => m[1]);

  it('self-hosted only: exactly four next/font/local calls, two weights per family (CLAUDE.md typography rule 2)', () => {
    expect(Object.keys(blocks).sort()).toEqual(['elamy', 'elamyBold', 'latin', 'stanga']);
    expect(fonts).toContain('from "next/font/local"');
    expect([weights('stanga'), weights('latin')]).toEqual([['400', '700'], ['400', '700']]);
    expect([weights('elamy'), weights('elamyBold')]).toEqual([['400'], ['700']]);
  });

  it('adjustFontFallback is false where the Hebrew-only fallback faces replace the generated Arial one (typography rule 6)', () => {
    for (const name of ['stanga', 'elamy', 'elamyBold']) expect(blocks[name], name).toMatch(/adjustFontFallback:\s*false/);
  });

  it('NS-29: exactly three faces preload (Elamy Bold, Stanga Regular + Bold)', () => {
    const preloaded = (name: string) => (/preload:\s*true/.test(blocks[name]) ? weights(name).length : 0);
    expect(['elamy', 'elamyBold', 'stanga', 'latin'].reduce((n, name) => n + preloaded(name), 0)).toBe(3);
  });

  it('layout.tsx applies all three font variables to <html>, and every woff2 fonts.ts references is shipped', () => {
    for (const f of ['elamy', 'stanga', 'latin']) expect(root, `${f}.variable on <html>`).toMatch(new RegExp(`<html[^>]*className=\\{cx\\([^)]*\\b${f}\\.variable\\b`));
    const files = [...fonts.matchAll(/\.\/fonts\/([\w.-]+\.woff2)/g)].map((m) => m[1]);
    expect(files.length).toBe(6);
    for (const f of files) expect(existsSync(join(ROOT, 'src/app/fonts', f)), f).toBe(true);
  });
});

describe('colour bans (CLAUDE.md colour: four colours only, theme utilities, no bg-white)', () => {
  const BRAND = ['#7a5978', '#c49ab8', '#ecc8ce', '#fff5f0'];
  /** Everything else must be listed WITH a reason, keyed by hex + file NAME so moving a file does not break the entry. */
  const ALLOWED: Array<{ hex: string; file: string; reason: string }> = [
    { hex: '#25d366', file: 'globals.css', reason: '--color-whatsapp: WhatsApp brand green, owner ruling (kept native 2026-10-09); used only as bg-whatsapp in ContactFAB' },
    { hex: '#1ebe5b', file: 'globals.css', reason: '--color-whatsapp-hover: darker hover shade of the WhatsApp green' },
    { hex: '#ffffff', file: 'ContactFAB.tsx', reason: 'white label and glyph on the WhatsApp green (brand spec, owner-approved 1.98:1)' },
    { hex: '#000', file: 'globals.css', reason: '--color-black: Tailwind default kept for the photo scrims (bg-black/20, from-black/60)' },
  ];
  const hexHits = () =>
    sources.flatMap((f) => {
      const text = f.name.endsWith('.css') ? stripCssComments(f.text) : f.text; // comments quote derived colours
      return [...text.matchAll(new RegExp(rule('hex').re.source, 'g'))].map((m) => ({ hex: m[0].toLowerCase(), file: f.name, line: `${f.path}:${text.slice(0, m.index).split('\n').length}` }));
    });

  it('only the 4 brand hexes plus the allow-listed WhatsApp / scrim ones appear in src; every allow entry is still used', () => {
    const hits = hexHits();
    expectNone(hits.filter((h) => !BRAND.includes(h.hex) && !ALLOWED.some((a) => a.hex === h.hex && a.file === h.file)).map((h) => `${h.line}  ${h.hex}`), 'hex colour outside the palette');
    expectNone(ALLOWED.filter((a) => !hits.some((h) => h.hex === a.hex && h.file === a.file)).map((a) => `${a.file} ${a.hex}`), 'stale ALLOWED entries: delete them');
  });

  it('rgb()/rgba() literals are only brand colours or black (shadows)', () => {
    const OK = ['122,89,120', '196,154,184', '236,200,206', '255,245,240', '0,0,0'];
    const offenders = sources.flatMap((f) => [...f.text.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)].filter((m) => !OK.includes(`${m[1]},${m[2]},${m[3]}`)).map((m) => `${f.path}: ${m[0]}`));
    expectNone(offenders, 'rgb()/rgba() literal that is not a brand colour');
  });

  it.each(['stock-palette', 'arbitrary-colour-var', 'white-utility'])('src has no %s', (id) => {
    expectNone(scan(code, rule(id).re), `src contains ${rule(id).label}`);
  });

  it('the theme owns the tokens components rely on: every NS-23 token, so bg-whatsapp / bg-plum-hover / max-w-prose / focus-ring generate CSS', () => {
    const raw = stripCssComments(sourceNamed('app/globals.css').text);
    for (const t of ['--color-whatsapp', '--color-whatsapp-hover', '--color-plum-hover', '--color-cream-hover', '--container-prose']) expect(theme(raw), t).toContain(`${t}:`);
    expect(raw).toMatch(/@utility focus-ring\s*\{/);
  });

  it('no component re-spells what a token owns: color-mix hover tints, max-w-[65ch], the outline-none + ring-2 pair', () => {
    const RESPELL: Array<[RegExp, string]> = [
      [/color-mix\([^)]*(?:var\(--color-(?:plum|cream)\)\s*_?\s*\d+%?,?_?\s*(?:black|var\(--color-blush\))|\d+%,?_?transparent)/, 'color-mix hover/opacity tint (use bg-plum-hover, bg-cream-hover or an /NN modifier)'],
      [/max-w-\[65ch\]/, 'max-w-[65ch] (use max-w-prose)'],
      [/focus-visible:outline-none[\s\S]{0,12}focus-visible:ring-2(?![\w-])/, 'focus-visible:outline-none + ring-2 pair (use focus-ring)'],
    ];
    expectNone(code.filter((f) => f.name !== 'globals.css').flatMap((f) => RESPELL.filter(([re]) => re.test(f.text)).map(([, why]) => `${f.path}: ${why}`)), 'a token/utility exists for this');
  });

  it('Tailwind scans only src (tests, docs and configs cannot generate CSS) and the default palette is dropped', () => {
    const css = sourceNamed('app/globals.css').text; // raw: stripCssComments would eat a `/**/` inside a glob
    for (const s of ['@import "tailwindcss" source(none);', '@source "../";', '@source not "../**/*.md";']) expect(css, s).toContain(s);
    expect(theme(css)).toMatch(/--color-\*\s*:\s*initial\s*;/);
  });

  describe('NS-42 contrast and focus bans (each with an allow table that only shrinks)', () => {
    /** Today's offenders per rule: path suffix under src/ + how many offences. A new one fails; a vanished one fails ("stale"). */
    const BAN_ALLOW: Record<string, BanAllow[]> = {
      'text-mauve': [{ file: 'Attribution.tsx', count: 1, reason: 'parked testimonial role line in mauve (type-small)' }],
      'small-text-blush': [{ file: 'HeroHeading.tsx', count: 1, reason: 'the hand-drawn underline stroke (aria-hidden svg, currentColor): decorative, carries no text' }],
      'text-colour-mix-transparent': [
        { file: 'PostBody.tsx', count: 1, reason: 'pull-quote: plum at 92% (text-plum/92)' },
        { file: 'StepCard.tsx', count: 1, reason: 'step bullets: cream at 90% over the dark photo scrim, measured 13-15:1 (listed in PHOTO_BACKDROP)' },
      ],
      'focus-outline-none': [{ file: 'PageShell.tsx', count: 1, reason: '<main tabIndex=-1> is the skip-link target: programmatic focus only, not reachable by Tab' }],
    };

    describe.each(CONTRAST_BANS.map((b) => [b.id, b] as const))('%s', (id, r) => {
      it('the rule flags every known-bad sample and spares every known-good one', () => {
        for (const s of r.bad) expect(containsBanSample(r, s), `${id} must flag:\n${s}`).toBe(true);
        for (const s of r.good) expect(containsBanSample(r, s), `${id} must NOT flag:\n${s}`).toBe(false);
      });

      it(`src has no new offender and no stale allow entry: ${r.label}`, () => {
        expectNone(ratchetBan(sources.flatMap((f) => r.find(f)), BAN_ALLOW[id]), `${id}: fix the offence (or, only with the owner agreeing, list it in BAN_ALLOW); delete a row whose offence is gone`);
      });
    });

    it('ratchetBan reports more hits than allowed, an unlisted file and a vanished offence', () => {
      const h = (file: string, line = 1) => ({ file, path: `src/${file}`, line, match: 'x' });
      const allow: BanAllow[] = [{ file: 'A.tsx', count: 2, reason: 'because' }];
      expect(ratchetBan([h('A.tsx'), h('A.tsx', 2)], allow)).toEqual([]);
      expect(ratchetBan([h('A.tsx'), h('A.tsx', 2), h('A.tsx', 3)], allow)[0]).toMatch(/^new offence in A\.tsx/);
      expect(ratchetBan([h('A.tsx'), h('A.tsx', 2), h('B.tsx')], allow)[0]).toMatch(/^new offence in src\/B\.tsx/);
      expect(ratchetBan([h('A.tsx')], allow)[0]).toMatch(/^stale allow entry, lower its count 2 -> 1/);
      expect(ratchetBan([], allow)[0]).toMatch(/^stale allow entry, remove it: A\.tsx/);
    });
  });
});

describe('RTL is declared once, on <html>', () => {
  it('no component or page sets dir="rtl" (the document is already rtl; dir="ltr" for phone / email is fine)', () => {
    expectNone(scan(code, rule('rtl-dir').re).filter((h) => !h.split(':')[0].endsWith('/app/layout.tsx')), 'redundant dir="rtl"');
  });

  it('<html lang="he" dir="rtl"> in layout.tsx and `direction: rtl` on html/body in globals.css are still there', () => {
    expect(sourceNamed('app/layout.tsx').text).toMatch(/<html[^>]*\bdir="rtl"/);
    expect(stripCssComments(sourceNamed('app/globals.css').text)).toMatch(/direction\s*:\s*rtl/);
  });
});
