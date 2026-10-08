import { ID } from '../src/content/ids';
import { test, expect } from '@playwright/test';

/**
 * Layout-fit invariant net (implementation-independent).
 *
 * Unlike responsive.spec.ts — which only checks `documentElement.scrollWidth >
 * clientWidth`, a check that `overflow: clip` on <main> can mask — this spec
 * asserts that each section title is actually fully ON-SCREEN (not clipped off the
 * left/right edge) and that its font has not collapsed (rem-scaling regression).
 *
 * This survives any future layout rebuild: it makes no assumption about HOW the
 * layout is built, only that titles render on-screen at a legible size.
 */

// Section title ids. An entry with several ids is a title rendered twice (one per breakpoint,
// the other `display:none`): at least one of them must be rendered, on-screen and legible.
const TITLE_IDS: string[][] = [
  [ID.heroTitle], // Hero
  [ID.aboutIntroTitle], // About-Intro-Dark
  [ID.aboutMeTitle],   // About-Me-Cream
  [ID.aboutCredentialsTitle], // About-Light
  [ID.aboutGalleryTitle], // Reignite
  [ID.expertiseTitle], // SafeSpace
  [ID.servicesTitle], // HowItWorks
  // [ID.testimonialsTitle], // Testimonials — hidden behind SHOW_TESTIMONIALS flag
  [ID.ctaBandTitle], // Scheduling
  [ID.photoGalleryTitle], // CoupleTherapy
  [ID.contactSocialTitle, ID.contactSocialTitleMobile], // Contact-Follow
  [ID.contactOfficeTitle], // Contact-Office
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
      await page.goto('/', { waitUntil: 'load' });

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
        return ids.map((candidates) => {
          // Keep only candidates that are rendered (not display:none).
          const rendered = candidates
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => !!el && el.getClientRects().length > 0);
          const el = rendered[0];
          const id = candidates.join(' | ');
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
        expect(m.found, `Title #${m.id} should exist and be rendered in the DOM`).toBe(true);
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
