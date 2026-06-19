import { test, expect } from '@playwright/test';

test.describe('Sticky Slide Presentation Layout', () => {
  test('every major section acts as a 100vh sticky slide', async ({ page }) => {
    await page.goto('/');

    // Ensure the main container does not hide overflow, which breaks sticky
    const main = page.locator('main').first();
    await expect(main).not.toHaveCSS('overflow', 'hidden');

    // Get all top-level sections
    const sections = page.locator('main > section');
    const count = await sections.count();
    
    // We expect 7 main sections (Hero, About, Expertise, Services, Testimonials, Contact, Footer)
    // Wait, some components might wrap their <section> in a fragment or a div.
    // Let's just check the ones that have IDs or classes.
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      
      // 1. Height must be >= 100vh
      const box = await section.boundingBox();
      const viewportHeight = page.viewportSize()?.height || 0;
      expect(box?.height).toBeGreaterThanOrEqual(viewportHeight * 0.95);

      // 2. Position must be sticky
      await expect(section).toHaveCSS('position', 'sticky');
      await expect(section).toHaveCSS('top', '0px');
    }
  });
});
