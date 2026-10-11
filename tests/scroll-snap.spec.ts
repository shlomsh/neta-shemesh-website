import { test, expect, type Page } from '@playwright/test';

/**
 * Desktop card snap is one CSS rule in globals.css (no JS): `html` snaps y-mandatory and every home `main > section` and the
 * footer is a start/always target, only at >= 1024px with a fine pointer and no reduced motion, and only on pages whose
 * `<main>` carries data-snap-cards (home). Asserted by computed style: no wheel timing.
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

test.describe('desktop, fine pointer', () => {
  test.skip(({ hasTouch }) => hasTouch, 'touch devices never snap (covered by the narrow and reduced-motion cases)');
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
  test.use({ viewport: { width: 390, height: 844 } });
  test('home: no snap', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const r = await read(page);
    expect(r.type).toBe('none');
    for (const a of r.aligns) expect(a).toBe('none|normal');
  });
});
