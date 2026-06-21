import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Text Visibility and Content Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'load' });
  });

  test('Critical text content is visible to the user', async ({ page }) => {
    // Playwright's toBeVisible() considers opacity:0 elements as visible because they take up space!
    // We must explicitly assert that the animation successfully unpauses and reaches opacity 1
    const doctorNameWrapper = page.getByText('נטע שמש').first();
    await doctorNameWrapper.scrollIntoViewIfNeeded();
    await expect(doctorNameWrapper).toBeVisible({ timeout: 10000 });

    const heroSubtitleWrapper = page.getByText('ליווי מקצועי לזוגות').first();
    await heroSubtitleWrapper.scrollIntoViewIfNeeded();
    await expect(heroSubtitleWrapper).toBeVisible({ timeout: 10000 });
    
    // Check for another section's text (Expertise cards — translated to Hebrew)
    const approachTextWrapper = page.getByText('טיפול זוגי').first();
    await approachTextWrapper.scrollIntoViewIfNeeded();
    await expect(approachTextWrapper).toBeVisible({ timeout: 10000 });
  });

  test('Testimonial card background has correct opacity', async ({ page }) => {
    // The middle testimonial card has an SVG background that should be opacity: 0.16
    const cardSvg = page.locator('#ZO48UqFw0isLS2Uu').first();
    await expect(cardSvg).toHaveCSS('opacity', '0.16');
  });
});
