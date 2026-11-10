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

  test('Mobile hero keeps the compact wordmark right-aligned and the navigation enlarged', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const hero = page.locator('#hero');
    const logo = hero.locator('#brand-logo img');
    await expect(logo).toHaveCSS('width', '156px');
    const alignment = await logo.evaluate((image) => {
      const link = image.closest('a')!;
      return {
        right: image.getBoundingClientRect().right,
        parentRight: link.parentElement!.getBoundingClientRect().right,
      };
    });
    expect(Math.abs(alignment.right - alignment.parentRight)).toBeLessThanOrEqual(1);
    const nav = hero.getByRole('navigation', { name: 'ניווט ראשי' });
    for (const link of await nav.getByRole('link').all()) {
      await expect(link).toHaveCSS('font-size', '24px');
    }
  });

  test('Blog headers match the hero wordmark size at every responsive breakpoint', async ({ page }) => {
    for (const [width, logoWidth] of [[375, 156], [640, 192], [768, 216], [1280, 216]]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/blog', '/blog/loneliness-in-a-relationship', '/blog/one-hour-a-week-is-not-enough']) {
        await page.goto(route);
        await expect(page.locator('#brand-logo img'), `${route} at ${width}px`).toHaveCSS('width', `${logoWidth}px`);
      }
    }
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

  test('FAQ answers use larger text and the full available row width', async ({ page }) => {
    for (const [width, fontSize] of [[375, 24], [1440, 32]]) {
      await page.setViewportSize({ width, height: 900 });
      const faq = page.locator('#faq-section');
      const item = faq.locator('details').first();
      await item.locator('summary').click();
      const answer = item.locator('p');
      await expect(answer).toHaveCSS('font-size', `${fontSize}px`);
      await expect(answer).toHaveCSS('white-space', 'pre-line');
      expect(await answer.textContent()).toContain('שכיח.\nבמערכת');
      const widths = await item.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          available: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
          answer: element.querySelector('p')!.getBoundingClientRect().width,
          row: element.getBoundingClientRect().width,
        };
      });
      expect(Math.abs(widths.answer - widths.available)).toBeLessThanOrEqual(1);
      if (width === 1440) expect(widths.row).toBeGreaterThan(1100);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await item.locator('summary').click();
    }
  });

});
