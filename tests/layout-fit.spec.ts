import { test, expect } from '@playwright/test';

/**
 * Layout-fit invariant net (implementation-independent).
 *
 * Unlike responsive.spec.ts — which only checks `documentElement.scrollWidth >
 * clientWidth` and is therefore MASKED by `main { overflow:hidden }` — this spec
 * asserts that each section title is actually fully ON-SCREEN (not clipped off the
 * left/right edge) and that its font has not collapsed (rem-scaling regression).
 *
 * This survives any future layout rebuild: it makes no assumption about HOW the
 * layout is built, only that titles render on-screen at a legible size.
 */

const TARGET_URL = process.env.BASE_URL || 'http://localhost:3000';

// The 13 section title IDs (same source of truth as computed-style-golden.spec.ts).
const TITLE_IDS = [
  'yWav85A872J3eebD', // Hero
  'GDq1TYUPnp1UCFMP', // About-Intro-Dark
  'about-me-title',   // About-Me-Cream
  'YoSfu967TqAAsgNM', // About-Light
  'JkkbI1eIj5p9V33T', // Reignite
  'vyKTmOw3YNYlJZPL', // SafeSpace
  'pEc3w8pe4QAw5k7o', // HowItWorks
  // 'Dct2rK7XCXJaLA2e', // Testimonials — hidden behind SHOW_TESTIMONIALS flag
  'iVtldd7PMtN1BthG', // Scheduling
  'T749khVkMfNluBNv', // CoupleTherapy
  'ZgJbejfHoeBrgmf7', // Contact-Follow
  'zNSWHTotP3XOaXao', // Contact-Office
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const EDGE_TOLERANCE = 1;   // px, sub-pixel rounding
const MIN_FONT_SIZE = 12;   // px, below this text is effectively collapsed/illegible

test.describe.configure({ timeout: 120000 });

test.describe('Layout-fit invariant (no off-screen clipping, no font collapse)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only');

  for (const vp of VIEWPORTS) {
    test(`section titles fit on-screen and stay legible at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(TARGET_URL, { waitUntil: 'load' });

      // Scroll the page to trigger IntersectionObserver reveal animations,
      // then return to top so geometry is measured in final rendered state.
      await page.evaluate(async () => {
        const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const scrollHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        for (let i = 0; i < scrollHeight; i += Math.max(viewportHeight / 2, 100)) {
          window.scrollTo(0, i);
          await delay(200);
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);

      const measurements = await page.evaluate(({ ids }) => {
        return ids.map((id) => {
          const el = document.getElementById(id);
          if (!el) return { id, found: false };
          const rect = el.getBoundingClientRect();
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          return {
            id,
            found: true,
            left: rect.left,
            right: rect.left + rect.width,
            width: rect.width,
            fontSize,
          };
        });
      }, { ids: TITLE_IDS });

      for (const m of measurements) {
        expect(m.found, `Title #${m.id} should exist in the DOM`).toBe(true);
        if (!m.found) continue;

        // Not clipped off the left edge.
        expect(
          m.left,
          `#${m.id} left edge (${m.left?.toFixed(1)}) is off-screen at ${vp.name}`
        ).toBeGreaterThanOrEqual(-EDGE_TOLERANCE);

        // Not overflowing the right edge.
        expect(
          m.right,
          `#${m.id} right edge (${m.right?.toFixed(1)}) exceeds viewport ${vp.width} at ${vp.name}`
        ).toBeLessThanOrEqual(vp.width + EDGE_TOLERANCE);

        // Font has not collapsed (rem-scaling regression guard).
        expect(
          m.fontSize,
          `#${m.id} font-size (${m.fontSize?.toFixed(2)}px) collapsed below ${MIN_FONT_SIZE}px at ${vp.name}`
        ).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
      }
    });
  }
});
