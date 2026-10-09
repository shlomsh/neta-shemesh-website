#!/usr/bin/env node
/**
 * Metric-matched Hebrew fallback faces (NS-35 / NS-46).
 *
 * The page paints in a system font while Stanga / Elamy download, then swaps. The system Hebrew font
 * (Arial / Arial Hebrew) is ~1.6x wider per glyph than Stanga, so every paragraph re-wraps on swap
 * (a 390px blog post reflowed ~800px). The `@font-face` blocks in globals.css ("stanga-fb" / "elamy-fb")
 * point at local Arial and scale it to Stanga's / Elamy's average Hebrew advance with `size-adjust`,
 * and line up ascent / descent / line-gap, so the swap barely moves anything.
 *
 *   node scripts/font-fallback-metrics.mjs            print the CSS values (paste into globals.css)
 *   node scripts/font-fallback-metrics.mjs --refresh  re-read system Arial, rewrite the reference JSON
 *
 * The fallback font's numbers live in scripts/font-fallback-reference.json (advances of the glyphs the
 * faces cover, plus hhea metrics) so the unit test is machine-independent. Real fonts are read from
 * public/fonts (fontkit, a devDependency).
 */
import * as fontkit from 'fontkit';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF_FILE = path.join(ROOT, 'scripts/font-fallback-reference.json');
const FONT_DIR = path.join(ROOT, 'public/fonts');

/** What the fallback faces cover: Hebrew + the space/punctuation/digits Stanga itself carries (NOT A-Z/a-z). */
export const COVERED = [
  [0x20, 0x25], [0x27, 0x39], [0x3a, 0x40], [0x5b, 0x5f], [0x7b, 0x7d], [0xa0, 0xa0], [0xab, 0xab], [0xbb, 0xbb],
  [0x590, 0x5ff], [0x2013, 0x2014], [0x2018, 0x201e], [0x20aa, 0x20aa], [0xfb1d, 0xfb4f],
];
export const UNICODE_RANGE = COVERED.map(([a, b]) => (a === b ? `U+${a.toString(16).toUpperCase()}` : `U+${a.toString(16).toUpperCase()}-${b.toString(16).toUpperCase()}`)).join(', ');
export const isCovered = (cp) => COVERED.some(([a, b]) => cp >= a && cp <= b);

/** Face -> [real font file, fallback key in the reference JSON]. */
export const FACES = {
  'stanga-fb 400': ['stanga-regular-aaa.woff2', 'arial-400'],
  'stanga-fb 700': ['stanga-bold-aaa.woff2', 'arial-700'],
  'elamy-fb 400': ['Elamy-Regular.woff2', 'arial-400'],
  'elamy-fb 700': ['Elamy-Bold.woff2', 'arial-700'],
};

/** Every character the site renders, counted: all source under src/ (content + components). */
export function corpus() {
  const counts = new Map();
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = path.join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|md)$/.test(f)) {
        for (const ch of readFileSync(p, 'utf8')) {
          const cp = ch.codePointAt(0);
          if (cp >= 0x590 && cp <= 0x5ff) counts.set(cp, (counts.get(cp) || 0) + 1);
        }
      }
    }
  };
  walk(path.join(ROOT, 'src/content'));
  walk(path.join(ROOT, 'src/components'));
  // Spaces + punctuation + digits matter too (every word break): weight them off the Hebrew letter count.
  const letters = [...counts].filter(([cp]) => cp >= 0x5d0 && cp <= 0x5ea).reduce((s, [, n]) => s + n, 0);
  counts.set(0x20, Math.round(letters * 0.2));
  counts.set(0x2e, Math.round(letters * 0.01));
  counts.set(0x2c, Math.round(letters * 0.02));
  return counts;
}

const adv = (font, cp) => {
  const g = font.glyphForCodePoint(cp);
  return g && g.id ? g.advanceWidth / font.unitsPerEm : null;
};

/** Average advance (em) over the corpus, only chars both fonts carry. */
function avgAdvance(counts, getAdv) {
  let sum = 0, n = 0;
  for (const [cp, c] of counts) {
    const a = getAdv(cp);
    if (a != null) { sum += a * c; n += c; }
  }
  return { sum, n };
}

/** Compute the overrides (fractions) for one face from the real font and a fallback reference entry. */
export function compute(realFont, ref, counts) {
  const shared = new Map([...counts].filter(([cp]) => adv(realFont, cp) != null && ref.advances[cp] != null));
  const real = avgAdvance(shared, (cp) => adv(realFont, cp)).sum;
  const fb = avgAdvance(shared, (cp) => ref.advances[cp]).sum;
  const sizeAdjust = real / fb;
  return {
    sizeAdjust,
    ascent: realFont.ascent / realFont.unitsPerEm / sizeAdjust,
    descent: -realFont.descent / realFont.unitsPerEm / sizeAdjust,
    lineGap: realFont.lineGap / realFont.unitsPerEm / sizeAdjust,
  };
}

export const loadRef = () => JSON.parse(readFileSync(REF_FILE, 'utf8'));
export const loadReal = (file) => fontkit.openSync(path.join(FONT_DIR, file));

function refresh() {
  const sys = '/System/Library/Fonts/Supplemental';
  const out = {};
  for (const [key, file] of [['arial-400', 'Arial.ttf'], ['arial-700', 'Arial Bold.ttf']]) {
    const f = fontkit.openSync(path.join(sys, file));
    const advances = {};
    for (const [a, b] of COVERED) for (let cp = a; cp <= b; cp++) { const v = adv(f, cp); if (v != null) advances[cp] = +v.toFixed(5); }
    out[key] = { source: file, ascent: f.ascent / f.unitsPerEm, descent: -f.descent / f.unitsPerEm, lineGap: f.lineGap / f.unitsPerEm, advances };
  }
  writeFileSync(REF_FILE, JSON.stringify(out, null, 1) + '\n');
  console.log('wrote', REF_FILE);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--refresh') || !existsSync(REF_FILE)) refresh();
  const refs = loadRef();
  const counts = corpus();
  for (const [face, [file, key]] of Object.entries(FACES)) {
    const r = compute(loadReal(file), refs[key], counts);
    const pct = (v) => (v * 100).toFixed(2) + '%';
    console.log(`${face.padEnd(14)} size-adjust ${pct(r.sizeAdjust)}  ascent-override ${pct(r.ascent)}  descent-override ${pct(r.descent)}  line-gap-override ${pct(r.lineGap)}`);
  }
  console.log('unicode-range:', UNICODE_RANGE);
}
