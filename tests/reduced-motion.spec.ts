import { test, expect } from '@playwright/test';

/**
 * Regression: with prefers-reduced-motion: reduce, ScrollReveal-style wrappers used to keep
 * the SSR inline `opacity:0` forever (hydration does not patch style attributes), leaving
 * most sections blank. Run against another server with BASE_URL=http://localhost:3200.
 */
test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.describe('prefers-reduced-motion: reduce', () => {
  test('all text in main/footer is visible (no element left at opacity < 0.99)', async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' && /hydrat|did not match|Minified React error #(418|423|425)/i.test(m.text())) hydrationErrors.push(m.text());
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    expect(await h1.evaluate((e) => Number(getComputedStyle(e).opacity))).toBeGreaterThanOrEqual(0.99);

    // Scroll through the whole page so any whileInView would have fired.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = page.viewportSize()?.height ?? 720;
    for (let y = 0; y <= height; y += Math.floor(vh / 2)) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(500);

    const hidden = await page.evaluate(() => {
      const bad: string[] = [];
      for (const el of Array.from(document.querySelectorAll('main *, footer *'))) {
        if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
        if (!(el.textContent || '').trim()) continue;
        if (el.getClientRects().length === 0) continue; // display:none etc.
        // Deliberate static design opacity (expertise CardLabel overlay is opacity-95), not a reveal state.
        if (el.closest('.opacity-95')) continue;
        // Effective opacity = product along the ancestor chain (a transparent parent hides children).
        let eff = 1;
        for (let n: Element | null = el; n && n !== document.documentElement; n = n.parentElement) {
          eff *= Number(getComputedStyle(n).opacity);
        }
        const own = Number(getComputedStyle(el).opacity);
        if (own < 0.99 || eff < 0.99) {
          bad.push(`${el.tagName.toLowerCase()} own=${own} eff=${eff.toFixed(2)} "${(el.textContent || '').trim().slice(0, 30)}"`);
        }
      }
      return bad;
    });
    expect(hidden, `hidden text elements:\n${hidden.slice(0, 10).join('\n')}`).toEqual([]);
    expect(hydrationErrors).toEqual([]);
  });
});
