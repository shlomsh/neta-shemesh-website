import { test, expect } from '@playwright/test';

/**
 * Built-output guard for the next/font/local setup in src/app/fonts.ts (NS-29).
 *
 * Elamy is declared as two localFont() calls (Regular owns `--font-elamy`, Bold is the preloaded
 * face); both set `declarations: [{ prop: 'font-family', value: 'elamy' }]`. That only works while
 * Turbopack emits the UNHASHED family name `elamy` for the variable and for both @font-face rules.
 * A Next upgrade can change that silently (the text just falls back to a system font), so this spec
 * checks the BUILT output, not the source. Run it against `npm run start`, never `next dev`.
 */

const FAMILY = 'elamy';

test.describe('fonts (built output)', () => {
  test('--font-elamy first family matches an @font-face family in the built CSS', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const probe = await page.evaluate(async () => {
      const root = getComputedStyle(document.documentElement);
      const varValue = root.getPropertyValue('--font-elamy').trim();

      // Raw CSS of every same-origin stylesheet the page links (built output, not the CSSOM).
      const hrefs = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((l) => l.href);
      const css = (await Promise.all(hrefs.map((h) => fetch(h).then((r) => r.text())))).join('\n');
      const faces = [...css.matchAll(/@font-face\s*\{[^}]*?font-family:\s*(?:"([^"]+)"|'([^']+)'|([^;}\s]+))/g)].map(
        (m) => (m[1] ?? m[2] ?? m[3]).trim(),
      );

      return {
        varValue,
        faces,
        elamyBold: document.fonts.check('700 1em elamy'),
        elamyRegular: document.fonts.check('400 1em elamy'),
        displayFamily: getComputedStyle(document.querySelector('h1') as Element).fontFamily,
      };
    });

    const first = probe.varValue.split(',')[0].trim().replace(/^["']|["']$/g, '');
    expect(first, `--font-elamy = ${probe.varValue}`).toBe(FAMILY);
    expect(probe.faces, `@font-face families = ${JSON.stringify(probe.faces)}`).toContain(first);
    // Both Elamy weights are registered under that one family name.
    expect(probe.faces.filter((f) => f === FAMILY).length).toBeGreaterThanOrEqual(2);
    // The hero H1 resolves through the variable and its 700 face really loaded.
    expect(probe.displayFamily).toContain(FAMILY);
    expect(probe.elamyBold).toBe(true);
  });

  test('exactly 3 font preloads on / (Elamy Bold, Stanga Regular, Stanga Bold)', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page.$$eval('link[rel="preload"][as="font"]', (els) =>
      els.map((e) => (e as HTMLLinkElement).getAttribute('href')),
    );
    expect(hrefs, JSON.stringify(hrefs)).toHaveLength(3);
    expect(new Set(hrefs).size).toBe(3);
  });
});
