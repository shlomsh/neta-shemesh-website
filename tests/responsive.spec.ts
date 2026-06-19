import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Responsive Layout Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'load' });
    // Wait for the layout to settle, especially due to ScrollAnimator
    await page.waitForTimeout(1000);
  });

  test('Mobile viewport (375px) has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Check that document scroll width does not exceed the viewport width
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Tablet viewport (768px) has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Main grid container exists and has hidden overflow', async ({ page }) => {
    // The main container in page.tsx has 'overflow-hidden' which is critical to preventing 
    // absolute elements from breaking the page width on mobile.
    const mainElement = page.locator('main');
    await expect(mainElement).toHaveCSS('overflow', 'hidden');
  });

  test('Critical text scales correctly and remains visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Check that the hero text doesn't flow off-screen
    const heroTitle = page.getByText('נטע שמש').first();
    await heroTitle.scrollIntoViewIfNeeded();
    
    const isVisible = await heroTitle.isVisible();
    expect(isVisible).toBe(true);

    const boundingBox = await heroTitle.boundingBox();
    expect(boundingBox).not.toBeNull();
    if (boundingBox) {
       // Ensure the element's right edge doesn't significantly exceed viewport width (375)
       expect(boundingBox.x).toBeGreaterThanOrEqual(-5); // Allow slight sub-pixel rounding
       expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(375 + 10); // Allow slight sub-pixel rounding
    }
  });

});
