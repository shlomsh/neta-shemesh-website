// @vitest-environment node
/**
 * SANITY: the metric-matched Hebrew fallback faces (NS-35 / NS-46) in globals.css.
 *
 * Pins (1) the size-adjust / ascent / descent / line-gap numbers to what scripts/font-fallback-metrics.mjs
 * derives from the real Stanga / Elamy files (so swapping a font file without re-running the script fails),
 * (2) that the faces are Hebrew-only (a face that also covered A-Z would capture the Latin companion's text
 * with Arial), and (3) the font-family order: real font, fallback face, Latin companion, generic.
 */
import { describe, expect, it } from 'vitest';
import { FACES, unicodeRange, compute, corpus, isCovered, loadRef, loadReal } from '../../scripts/font-fallback-metrics.mjs';
import { cssVar, globalsCss, stripCssComments } from './helpers';

const css = stripCssComments(globalsCss());

function faceBlock(family: string, weight: string): string {
  const re = new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"${family}";\\s*font-weight:\\s*${weight};[^}]*\\}`);
  const m = css.match(re);
  expect(m, `@font-face ${family} ${weight}`).not.toBeNull();
  return m![0];
}
const pct = (block: string, prop: string) => parseFloat(block.match(new RegExp(`${prop}:\\s*([\\d.]+)%`))![1]) / 100;

describe('Hebrew fallback faces', () => {
  const refs = loadRef();
  const counts = corpus();
  it.each(Object.entries(FACES) as [string, [string, string]][])('%s matches the derived metrics', (face, [file, key]) => {
    const [family, weight] = face.split(' ');
    const block = faceBlock(family, weight);
    const want = compute(loadReal(file), refs[key], counts);
    expect(pct(block, 'size-adjust')).toBeCloseTo(want.sizeAdjust, 3);
    expect(pct(block, 'ascent-override')).toBeCloseTo(want.ascent, 3);
    expect(pct(block, 'descent-override')).toBeCloseTo(want.descent, 3);
    expect(pct(block, 'line-gap-override')).toBeCloseTo(want.lineGap, 3);
    expect(block).toContain(`unicode-range: ${unicodeRange(loadReal(file))};`);
  });

  it('size-adjust shrinks the wide system Hebrew font (a sane band, not 100%)', () => {
    for (const face of ['stanga-fb', 'elamy-fb']) for (const w of ['400', '700']) {
      const s = pct(faceBlock(face, w), 'size-adjust');
      expect(s).toBeGreaterThan(0.5);
      expect(s).toBeLessThan(1);
    }
  });

  it('never covers Latin letters (they must fall to the Roboto Condensed companion)', () => {
    for (let cp = 0x41; cp <= 0x5a; cp++) expect(isCovered(cp), String.fromCharCode(cp)).toBe(false);
    for (let cp = 0x61; cp <= 0x7a; cp++) expect(isCovered(cp), String.fromCharCode(cp)).toBe(false);
    expect(isCovered(0xa9), '©').toBe(false);
    expect(isCovered(0x5d0), 'alef').toBe(true);
    // at rest the fallback must not claim glyphs the real font lacks (gershayim in "עו״ס", maqaf)
    expect(unicodeRange(loadReal('stanga-regular-aaa.woff2'))).not.toMatch(/5F4|5BE/);
  });

  it('font stacks: real font, Hebrew-only fallback, Latin companion, generic', () => {
    expect(cssVar(css, '--font-body')).toBe('var(--font-stanga), "stanga-fb", var(--font-latin), sans-serif');
    expect(cssVar(css, '--font-display')).toBe('var(--font-elamy), "elamy-fb", cursive');
  });
});
