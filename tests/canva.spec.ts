import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.BASE_URL || 'https://kromaticdesignstudio.my.canva.site/couples-therapist';

test.describe.configure({ timeout: 120000 });

test.describe('1:1 Canva Template Migration Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate and wait for the page to fully load
    await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 90000 });
    // Wait an extra few seconds for client-side rendering to finish
    await page.waitForTimeout(3000);
  });

  test('Page Title matches', async ({ page }) => {
    await expect(page).toHaveTitle(/נטע שמש/i);
  });

  test('Responsive Layout: No horizontal scroll overflow', async ({ page }) => {
    // Evaluates the scroll width vs client width on whatever viewport the test runner is currently using
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Visual Regression: Full Page Layout', async ({ page }) => {
    test.setTimeout(90000);

    // Scroll down slowly to trigger all scroll-based animations (common in Canva sites)
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const scrollHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;

      for (let i = 0; i < scrollHeight; i += viewportHeight / 2) {
        window.scrollTo(0, i);
        await delay(300); // wait for animations at each step
      }
      // Scroll back up to the top
      window.scrollTo(0, 0);
    });

    // Wait for any remaining animations to settle
    await page.waitForTimeout(2000);

    // Hide the Canva cookie banner or floating elements if they exist, 
    // to avoid flaky visual diffs.
    await page.addStyleTag({ content: 'div[class*="cookie"], div[class*="banner"], iframe { display: none !important; }' });

    // Assert the full page snapshot
    await expect(page).toHaveScreenshot('full-page-layout.png', { fullPage: true, maxDiffPixelRatio: 0.1 });
  });
});
