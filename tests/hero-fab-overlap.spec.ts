import { test, expect, type Page } from '@playwright/test';

/**
 * The contact pill (ContactFAB, fixed bottom-left) never covers hero content or a card title on a phone (NS-61).
 *
 * Measured, not assumed: the geometry of the real page at the two phone shapes that matter (375x812, a tall
 * iPhone, and 375x667, the shortest one we still support), with the iOS 26 hero overshoot simulated. iOS 26
 * Safari draws the page under its floating bottom bar, so --card-h / --hero-h are `100lvh + 80px` there
 * (globals.css, gated to iOS WebKit); this spec forces the same three tokens on every engine so the
 * overshoot case is tested everywhere, not only on a real iPhone.
 *
 * Two guards:
 *   1. At scroll 0 the hero is at most one (overshoot-extended) screen tall and the pill does not intersect the
 *      art or any hero text / button box.
 *   2. Scrolled to the top of every card the pill does not intersect that card's visible title (h2).
 * Reduced motion is emulated so no reveal or entrance transform moves a box while it is measured.
 */

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 375, height: 667 },
];
const OVERSHOOT = 80;
/** Boxes that merely touch are fine; anything that shares more than this many px on both axes is an overlap. */
const TOUCH_TOLERANCE = 1;

/** The same tokens globals.css sets for iOS 26 Safari below lg, forced so the overshoot case runs on every engine. */
const IOS26_TOKENS = `@media (width < 64rem) { :root { --hero-overshoot: ${OVERSHOOT}px; --card-h: calc(100lvh + var(--hero-overshoot)); --hero-h: var(--card-h); } }`;

type Box = { left: number; top: number; right: number; bottom: number };
type Named = Box & { name: string };

function overlaps(a: Box, b: Box): boolean {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > TOUCH_TOLERANCE && h > TOUCH_TOLERANCE;
}

async function open(page: Page, viewport: { width: number; height: number }) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize(viewport);
  await page.goto('/', { waitUntil: 'load' });
  await page.addStyleTag({ content: IOS26_TOKENS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('[data-testid="contact-fab"]');
}

/** The pill's border box in viewport coordinates. */
const fabBox = (page: Page) =>
  page.evaluate((): Box => {
    const r = document.querySelector('[data-testid="contact-fab"]')!.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  });

test.describe('contact pill vs hero content and card titles (phone, iOS 26 overshoot simulated)', () => {
  for (const viewport of VIEWPORTS) {
    const at = `${viewport.width}x${viewport.height}`;

    test(`hero at ${at}: at most one screen, pill clear of the art and every text / button box`, async ({ page }) => {
      await open(page, viewport);
      await page.evaluate(() => window.scrollTo(0, 0));

      const { heroHeight, boxes } = await page.evaluate(() => {
        const hero = document.getElementById('hero')!;
        const visible = (e: Element) => e.getClientRects().length > 0 && e.getBoundingClientRect().width > 0;
        const boxOf = (name: string, e: Element) => {
          const r = e.getBoundingClientRect();
          return { name, left: r.left, top: r.top, right: r.right, bottom: r.bottom };
        };
        const out: { name: string; left: number; top: number; right: number; bottom: number }[] = [];
        for (const e of hero.querySelectorAll('h1, p, a, button')) if (visible(e)) out.push(boxOf(`<${e.tagName.toLowerCase()}> "${(e.textContent ?? '').trim().slice(0, 24)}"`, e));
        const art = hero.querySelector('[data-testid="hero-art"]');
        if (art) out.push(boxOf('hero art', art));
        return { heroHeight: hero.getBoundingClientRect().height, boxes: out };
      });

      expect(boxes.some((b) => b.name === 'hero art'), 'the hero art (data-testid="hero-art") is on the page').toBe(true);
      expect(boxes.length, 'hero text / button boxes were found').toBeGreaterThan(4);
      expect.soft(heroHeight, `hero (${heroHeight}px) grew past one screen + the iOS 26 overshoot (${viewport.height + OVERSHOOT}px)`).toBeLessThanOrEqual(viewport.height + OVERSHOOT + 1);

      const fab = await fabBox(page);
      const hits = (boxes as Named[]).filter((b) => overlaps(b, fab)).map((b) => `${b.name} [${Math.round(b.top)}..${Math.round(b.bottom)}]`);
      expect(hits, `the contact pill [${Math.round(fab.top)}..${Math.round(fab.bottom)}] covers hero content at ${at}`).toEqual([]);
    });

    test(`every card at ${at}: scrolled to its top, the pill does not cover its title`, async ({ page }) => {
      await open(page, viewport);

      const count = await page.evaluate(() => document.querySelectorAll('main > section').length);
      expect(count, 'cards on the page').toBeGreaterThanOrEqual(10);

      const problems: string[] = [];
      let titles = 0;
      for (let i = 0; i < count; i++) {
        const label = await page.evaluate((idx) => {
          const s = document.querySelectorAll('main > section')[idx];
          window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY);
          return s.id || `section #${idx}`;
        }, i);
        await page.waitForTimeout(50);
        const headings = await page.evaluate((idx) => {
          const s = document.querySelectorAll('main > section')[idx];
          return [...s.querySelectorAll('h2')]
            .filter((h) => h.getClientRects().length > 0)
            .map((h) => {
              const r = h.getBoundingClientRect();
              return { text: (h.textContent ?? '').trim().slice(0, 24), left: r.left, top: r.top, right: r.right, bottom: r.bottom };
            });
        }, i);
        titles += headings.length;
        const fab = await fabBox(page);
        for (const h of headings) if (overlaps(h, fab)) problems.push(`#${label} title "${h.text}" [${Math.round(h.top)}..${Math.round(h.bottom)}] vs pill [${Math.round(fab.top)}..${Math.round(fab.bottom)}]`);
      }

      expect(titles, 'card titles (h2) were measured').toBeGreaterThanOrEqual(8);
      expect(problems, `the contact pill covers a card title at the top of its card at ${at}`).toEqual([]);
    });
  }
});
