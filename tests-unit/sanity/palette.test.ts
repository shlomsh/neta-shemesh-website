// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { ROOT, colourEnv, contrastRatio, cssVar, evalColour, globalsCss, hex2, sourceNamed, themeColours } from './helpers';

const PRESETS = [
  ['color-hunt', ['#724060', '#A070A1', '#F8E7E7', '#FDF3F3']],
  ['airy-rose', ['#7A5978', '#C49AB8', '#ECC8CE', '#FFF5F0']],
] as const;

describe('selectable palette', () => {
  it.each(PRESETS)('%s preserves the four source colors and accessible reading surfaces', (name, colors) => {
    const css = sourceNamed(`app/palettes/${name}.css`).text;
    for (const [i, role] of ['plum', 'mauve', 'blush', 'cream'].entries()) {
      expect(cssVar(css, `--color-${role}`)).toBe(colors[i]);
    }
    const palette = themeColours(css);
    expect(contrastRatio(palette.plum, palette.cream)).toBeGreaterThanOrEqual(4.5);
    const veil = evalColour('var(--surface-veil)', { palette, vars: colourEnv().vars })!;
    expect(contrastRatio(palette.plum, veil)).toBeGreaterThanOrEqual(4.5);
    expect(css).toMatch(/--color-\*\s*:\s*initial\s*;/);
  });

  it('imports exactly one known preset; no brand values are redefined after selection', () => {
    const raw = sourceNamed('app/globals.css').text;
    const imports = [...raw.matchAll(/@import "\.\/palettes\/([\w-]+)\.css";/g)];
    expect(imports).toHaveLength(1);
    expect(PRESETS.map(([name]) => name)).toContain(imports[0][1]);
    expect(raw).not.toMatch(/--color-(?:plum|mauve|blush|cream)\s*:/);
    const selected = themeColours(sourceNamed(`app/palettes/${imports[0][1]}.css`).text);
    const active = themeColours();
    for (const role of ['plum', 'mauve', 'blush', 'cream']) expect(active[role]).toEqual(selected[role]);
  });

  it('aliases, hover tints, and all colored shadows follow the selected roles', () => {
    const css = globalsCss();
    expect(cssVar(css, '--color-white')).toBe('var(--color-cream)');
    expect(cssVar(css, '--color-plum-hover')).toBe('color-mix(in srgb, var(--color-plum) 88%, black)');
    expect(cssVar(css, '--color-cream-hover')).toBe('color-mix(in srgb, var(--color-cream) 85%, var(--color-blush))');
    for (const [name, percent] of [['cover', 60], ['portrait', 30], ['lift', 45]]) {
      expect(cssVar(css, `--shadow-${name}`)).toContain(`color-mix(in srgb, var(--color-plum) ${percent}%, transparent)`);
    }
  });

  it.each(['light', 'plum'])('generated %s wordmarks use the selected palette, including the house artwork', async (tone) => {
    const expected = hex2(themeColours()[tone === 'light' ? 'cream' : 'plum']);
    for (const suffix of ['', '-compact']) {
      const { data, info } = await sharp(join(ROOT, 'public/images', `logo-tagline-${tone}${suffix}.webp`))
        .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect(info).toMatchObject({ width: 1073, height: 320, channels: 4 });
      let lettering = 0;
      let house = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 250) continue;
        const color = hex2({ r: data[i], g: data[i + 1], b: data[i + 2] });
        expect(color).toBe(expected);
        if ((i / 4) % info.width < 768) lettering++;
        else house++;
      }
      expect(lettering).toBeGreaterThan(100);
      expect(house).toBeGreaterThan(100);
    }
  });

  it('lists presets without writing, and rejects invalid selections without changing the active CSS', () => {
    const before = sourceNamed('app/globals.css').text;
    const script = join(ROOT, 'scripts/select-palette.mjs');
    const listed = spawnSync(process.execPath, [script], { encoding: 'utf8', cwd: ROOT });
    expect(listed.status, listed.stderr).toBe(0);
    for (const [name] of PRESETS) expect(listed.stdout).toContain(name);
    const invalid = spawnSync(process.execPath, [script, '../unknown'], { encoding: 'utf8', cwd: ROOT });
    expect(invalid.status).not.toBe(0);
    expect(invalid.stderr).toContain('Unknown palette');
    expect(readFileSync(join(ROOT, 'src/app/globals.css'), 'utf8')).toBe(before);
  });
});
