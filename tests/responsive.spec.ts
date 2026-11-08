import { test, expect } from '@playwright/test';

test.describe('Responsive Layout Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    // Let the layout settle (fonts, hero entrance)
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

  test('Consultation buttons fit within narrow and desktop viewports', async ({ page }) => {
    for (const width of [320, 375, 1280]) {
      await page.setViewportSize({ width, height: 812 });
      await page.evaluate(() => document.fonts.ready);
      for (const selector of ['#hero', 'footer']) {
        const link = page.locator(selector).getByRole('link', { name: 'לשיחת יעוץ טלפונית לא מחייבת' });
        const box = await link.boundingBox();
        expect(box, `${selector} at ${width}px`).not.toBeNull();
        expect(box!.x, `${selector} left edge at ${width}px`).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width, `${selector} right edge at ${width}px`).toBeLessThanOrEqual(width);
      }
    }
  });

  test('Mobile hero shows the full navigation above the title', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const hero = page.locator('#hero');
    const nav = hero.getByRole('navigation', { name: 'ניווט ראשי' });
    const heading = hero.locator('h1');
    await expect(nav.getByRole('link', { name: 'קצת עלי' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'התמחות' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'מאמרים' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'שאלות נפוצות' })).toBeVisible();
    const navBottom = await nav.evaluate((el) => el.getBoundingClientRect().bottom);
    const headingTop = await heading.evaluate((el) => el.getBoundingClientRect().top);
    expect(navBottom).toBeLessThan(headingTop);
  });

  test('Desktop hero fits within the first viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();
    const height = await hero.evaluate((element) => element.getBoundingClientRect().height);
    expect(height).toBeLessThanOrEqual(721);
  });

  test('Expertise topic buttons reveal the selected topic', async ({ page }) => {
    const topics = page.getByRole('group', { name: 'טיפול זוגי ומשפחתי בנתניה' });
    const family = topics.getByRole('button', { name: /טיפול משפחתי/ });
    await family.click();
    await expect(family).toHaveAttribute('aria-expanded', 'true');
    await expect(topics.getByRole('region', { name: 'טיפול משפחתי' })).toContainText(
      'חיזוק הקשרים בתוך המשפחה',
    );
  });

  test('FAQ answers expand when their question is selected', async ({ page }) => {
    const faq = page.locator('#faq-section');
    const firstAnswer = faq.locator('details').filter({ hasText: 'מה קורה אם בן או בת הזוג מסרבים להגיע לטיפול?' });
    await expect(firstAnswer.locator('summary')).toBeVisible();
    await expect(firstAnswer).not.toHaveAttribute('open', '');
    await firstAnswer.locator('summary').click();
    await expect(firstAnswer).toHaveAttribute('open', '');
    await expect(firstAnswer).toContainText('אפשר בהחלט להתחיל במפגש אישי שלך');
  });

});
