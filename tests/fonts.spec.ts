import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Font availability tests.
 *
 * These tests exist to prevent the class of Vercel build failures caused by
 * font files being gitignored or otherwise missing from the repository.
 *
 * Next.js `localFont` resolves font paths at BUILD TIME — if a file is absent,
 * the build crashes with "Font file not found". By asserting each font is served
 * with HTTP 200 here, we catch missing files before they ever reach production.
 *
 * If you add a new font to layout.tsx, add it to FONTS below.
 */

const FONTS = [
  { name: 'Dganit-Medium',       path: '/fonts/Dganit-Medium.woff2' },
  { name: 'Elamy-Regular',       path: '/fonts/Elamy-Regular.woff2' },
  { name: 'Elamy-Bold',          path: '/fonts/Elamy-Bold.woff2' },
  { name: 'Stanga-Regular',      path: '/fonts/stanga-regular-aaa.woff2' },
];

test.describe('Font File Availability', () => {

  for (const font of FONTS) {
    test(`${font.name} is served with HTTP 200`, async ({ request }) => {
      const response = await request.get(`${TARGET_URL}${font.path}`);
      expect(
        response.status(),
        `Font "${font.name}" not found at ${font.path} — is it committed to git and not gitignored?`
      ).toBe(200);
    });
  }

  test('Custom fonts are applied via CSS variables on <html>', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'load' });

    // Each localFont() injects a CSS variable onto <html>. If the font file
    // failed to load, Next.js would skip the variable entirely.
    const html = page.locator('html');
    const className = await html.getAttribute('class') ?? '';

    // Next.js localFont() generates hashed class names like:
    //   "dganit_fcb43083-module__xszqaq__variable"
    // The class starts with the variable name, not "--font-<name>".
    expect(className, 'Missing dganit font class on <html> — is Dganit-Medium.woff2 committed to git?').toMatch(/\bdganit_/);
    expect(className, 'Missing elamy font class on <html>  — is Elamy-Regular/Bold.woff2 committed to git?').toMatch(/\belamy_/);
    expect(className, 'Missing stanga font class on <html> — is stanga-regular-aaa.woff2 committed to git?').toMatch(/\bstanga_/);
  });

});
