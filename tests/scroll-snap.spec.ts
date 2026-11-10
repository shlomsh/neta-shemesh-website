import { test, expect, type Page } from '@playwright/test';

/**
 * CSS-only card snap applies at every width and pointer type unless reduced motion is requested.
 * Only home carries data-snap-cards; blog pages retain ordinary scrolling.
 */
const read = (page: Page) =>
  page.evaluate(() => {
    const targets = [...document.querySelectorAll('main > section, main > footer')];
    return {
      type: getComputedStyle(document.documentElement).scrollSnapType,
      count: targets.length,
      aligns: targets.map((el) => {
        const s = getComputedStyle(el);
        return `${s.scrollSnapAlign}|${s.scrollSnapStop}`;
      }),
    };
  });

test.describe('wide viewport, mouse or touch', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('home: html snaps y mandatory, every card and the footer is a start/always target', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const r = await read(page);
    expect(r.type).toBe('y mandatory');
    expect(r.count, 'home has the cards plus the footer').toBeGreaterThan(5);
    expect(new Set(r.aligns)).toEqual(new Set(['start|always']));
  });

  test('blog: no snap', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    const r = await read(page);
    expect(r.type).toBe('none');
    for (const a of r.aligns) expect(a).toBe('none|normal');
  });

  test.describe('reduced motion', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } });
    test('home: no snap', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const r = await read(page);
      expect(r.type).toBe('none');
      for (const a of r.aligns) expect(a).toBe('none|normal');
    });
  });
});

test.describe('phone width', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('home: one touch swipe advances to the next card without skipping it', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Native touch gesture synthesis uses Chromium CDP');
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const session = await page.context().newCDPSession(page);
    try {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart', touchPoints: [{ x: 195, y: 700 }],
      });
      for (let step = 1; step <= 12; step++) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove', touchPoints: [{ x: 195, y: 700 - step * 50 }],
        });
        await page.waitForTimeout(16);
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const next = page.locator('main > section').nth(1);
      await expect.poll(() => next.evaluate((el) => Math.abs(el.getBoundingClientRect().top))).toBeLessThanOrEqual(1);
    } finally {
      await session.detach();
    }
  });

  test('home: snaps to the next card after scrolling', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    const r = await read(page);
    expect(r.type).toBe('y mandatory');
    expect(new Set(r.aligns)).toEqual(new Set(['start|always']));
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const hero = document.querySelector('main > section')!;
      window.scrollBy({ top: hero.getBoundingClientRect().height * 0.75, behavior: 'instant' });
    });
    const next = page.locator('main > section').nth(1);
    await expect.poll(() => next.evaluate((el) => Math.abs(el.getBoundingClientRect().top))).toBeLessThanOrEqual(1);
  });

  test('home: taller cards remain scrollable between snap points', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const target = await page.evaluate(() => {
      const tall = [...document.querySelectorAll('main > section')]
        .find((el) => el.getBoundingClientRect().height > innerHeight + 100);
      if (!tall) throw new Error('Expected a tall mobile card to verify content remains reachable');
      const rect = tall.getBoundingClientRect();
      const top = scrollY + rect.top + (rect.height - innerHeight) / 2;
      window.scrollTo({ top, behavior: 'instant' });
      return top;
    });
    await expect.poll(() => page.evaluate((top) => Math.abs(scrollY - top), target)).toBeLessThanOrEqual(1);
  });

  test('blog: no snap on mobile', async ({ page }) => {
    await page.goto('/blog');
    expect((await read(page)).type).toBe('none');
  });

  test('home: reduced motion disables snap on mobile', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const r = await read(page);
    expect(r.type).toBe('none');
    for (const a of r.aligns) expect(a).toBe('none|normal');
  });
});
