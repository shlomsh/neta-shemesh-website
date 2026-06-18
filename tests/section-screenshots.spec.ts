import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe.configure({ timeout: 120000 });

test.describe('Section Screenshots (Guard 6)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only');

  test('Capture visual baselines for each section band', async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'load' });

    // Scroll the entire page to ensure IntersectionObserver reveals all sections
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const scrollHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;
      for (let i = 0; i < scrollHeight; i += Math.max(viewportHeight / 2, 100)) {
        window.scrollTo(0, i);
        await delay(300);
      }
      window.scrollTo(0, 0);
    });
    
    // Wait for animations to settle
    await page.waitForTimeout(2000);

    // Get all sections
    const sections = page.locator('main > div[style*="100rem"]');
    const count = await sections.count();
    
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      let id = await section.getAttribute('id');
      if (!id) {
        id = `section-${i}`;
      }

      // Mask any element with animation:pulse or similar, to avoid flakiness
      // We will look for elements containing 'pulse' in style or class
      const maskLocators = [
        section.locator('[style*="pulse"]'),
        section.locator('[class*="pulse"]')
      ];

      await expect(section).toHaveScreenshot(`${id}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
        mask: maskLocators
      });
    }
  });
});
