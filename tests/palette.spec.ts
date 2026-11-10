import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

const app = join(process.cwd(), 'src/app');
const globals = readFileSync(join(app, 'globals.css'), 'utf8');
const selected = globals.match(/@import "\.\/(palettes\/[\w-]+\.css)";/)?.[1];
if (!selected) throw new Error('No selected palette import');
const css = readFileSync(join(app, selected), 'utf8');
const palette = Object.fromEntries([...css.matchAll(/--color-(plum|mauve|blush|cream):\s*(#[0-9a-f]{6});/gi)].map((m) => [m[1], m[2]]));
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;

test('compiled styles use the selected palette on home and blog, including derived shadows', async ({ page }) => {
  for (const route of ['/', '/blog']) {
    await page.goto(route);
    await expect(page.locator('body')).toHaveCSS('background-color', rgb(palette.cream));
    const colors = await page.evaluate(() => {
      const probe = document.createElement('span');
      document.body.append(probe);
      const result: Record<string, string> = {};
      for (const name of ['plum', 'mauve', 'blush', 'cream', 'white']) {
        probe.style.color = `var(--color-${name})`;
        result[name] = getComputedStyle(probe).color;
      }
      probe.remove();
      return result;
    });
    for (const [name, hex] of Object.entries(palette)) expect(colors[name], `${route}: ${name}`).toBe(rgb(hex));
    expect(colors.white).toBe(rgb(palette.cream));
    const shadows = await page.evaluate(() => {
      const probe = document.createElement('span');
      document.body.append(probe);
      const results = [];
      for (const [name, percent] of [['cover', 60], ['portrait', 30]]) {
        probe.className = `shadow-${name}`;
        probe.style.color = `color-mix(in srgb, var(--color-plum) ${percent}%, transparent)`;
        const computed = getComputedStyle(probe);
        results.push({ shadow: computed.boxShadow, tint: computed.color });
      }
      probe.remove();
      return results;
    });
    for (const { shadow, tint } of shadows) {
      expect(shadow).not.toBe('none');
      expect(shadow).toContain(tint);
    }
    if (route === '/blog' && await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
      const card = page.locator('a[class~="hover:shadow-lift"]').first();
      await card.hover();
      const tint = await card.evaluate((element) => {
        const probe = document.createElement('span');
        probe.style.color = 'color-mix(in srgb, var(--color-plum) 45%, transparent)';
        element.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      await expect.poll(() => card.evaluate((element) => getComputedStyle(element).boxShadow)).toContain(tint);
    }
  }
});
