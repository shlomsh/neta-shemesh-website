import { test, expect, type Page } from '@playwright/test';
import { getAllPosts } from '../src/content/posts';
import { SITE } from '../src/content/site';

const enabled = process.env.VERCEL_ENV === 'production';
const firstPost = getAllPosts()[0]!;
const secondPost = getAllPosts()[1]!;

async function events(page: Page) {
  return page.evaluate(() =>
    Array.from(window.dataLayer ?? [], (entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((entry) => entry[0] === 'event'),
  );
}

test.beforeEach(async ({ page }) => {
  // Keep the real bootstrap/queue, but never send synthetic visits to the live property.
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '/* analytics test stub */' }),
  );
  await page.route(/https:\/\/[^/]*google-analytics\.com\//, (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
});

test('GA4 tag is production-only and its queue initializes before article effects', async ({ page }) => {
  const tagRequest = enabled
    ? page.waitForRequest((request) => request.url().startsWith('https://www.googletagmanager.com/gtag/js'))
    : null;
  await page.goto(`/blog/${firstPost.slug}`);
  if (!enabled) {
    await expect(page.locator('#ga4-init')).toHaveCount(0);
    await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
    expect(await events(page)).toEqual([]);
    return;
  }

  await tagRequest;
  await expect.poll(() => events(page)).toContainEqual([
    'event', 'blog_view', {
      send_to: SITE.ga4MeasurementId,
      page_path: `/blog/${firstPost.slug}`,
      article_id: firstPost.slug,
    },
  ]);
  const commands = await page.evaluate(() =>
    Array.from(window.dataLayer ?? [], (entry) => Array.from(entry as ArrayLike<unknown>)[0]),
  );
  expect(commands.slice(0, 3)).toEqual(['js', 'config', 'event']);
  await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1);
});

test('production tracks contact activation and each Next.js article visit with a fresh reading timer', async ({ page }) => {
  test.skip(!enabled, 'Run with VERCEL_ENV=production and a matching fresh production build.');
  await page.goto(`/blog/${firstPost.slug}`);
  await expect.poll(() => events(page)).toHaveLength(1);

  // Cancel only in the test, after the analytics capture handler has observed the real link.
  await page.evaluate(() => {
    document.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a[href^="tel:"], a[href*="wa.me"]')) {
        event.preventDefault();
      }
    });
  });
  // The blog has a phone CTA only below md; exercise its real mobile pill on every engine.
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByTestId('fab-phone').click();
  await page.setViewportSize(viewport);
  await page.getByTestId('fab-whatsapp').click();
  await expect.poll(async () => (await events(page)).map((event) => event[1]))
    .toEqual(['blog_view', 'phone_click', 'whatsapp_click']);

  // A real Next Link transition, not a document reload: the GA4 queue must survive.
  await page.locator(`a[href="/blog/${secondPost.slug}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/blog/${secondPost.slug}$`));
  await expect.poll(async () => (await events(page)).filter((event) => event[1] === 'blog_view'))
    .toHaveLength(2);
  await expect.poll(async () => (await events(page)).filter((event) => event[1] === 'blog_read_10s'), {
    timeout: 15_000,
  }).toEqual([[
    'event', 'blog_read_10s', {
      send_to: SITE.ga4MeasurementId,
      page_path: `/blog/${secondPost.slug}`,
      article_id: secondPost.slug,
    },
  ]]);
});
