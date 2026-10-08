/**
 * Track C — Header fidelity
 *
 * Every section-level H2 renders with the canonical `.type-title` class
 * (clamp(30px, 5vw, 52px) → 52px at a 1280px viewport). These tests assert
 * that each section heading lands in the ~52px band (47–59 with tolerance)
 * and stays below the hero display size.
 */
import { ID } from '../src/content/ids';
import { test, expect, type Page } from '@playwright/test';

const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 800;

// .type-title = 52px @1280; tolerance band 47 – 59
const MIN_SECTION_PX = 47;
const MAX_SECTION_PX = 59;

test.describe('Track C — Section header size fidelity @1280', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only');
  test.use({ viewport: { width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
  });

  const getFontSize = (page: Page, id: string) =>
    page.evaluate((id: string) => {
      const el = document.getElementById(id);
      return el ? parseFloat(getComputedStyle(el).fontSize) : null;
    }, id);

  // ── Section headers (.type-title, 52px @1280) ──────────────────────────────
  test('About-Intro section header ~52px / .type-title', async ({ page }) => {
    const px = await getFontSize(page, ID.aboutIntroTitle);
    expect(px, 'About-Intro').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'About-Intro').toBeLessThan(MAX_SECTION_PX);
  });

  test('SafeSpace section header ~52px / .type-title', async ({ page }) => {
    const px = await getFontSize(page, ID.expertiseTitle);
    expect(px, 'SafeSpace').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'SafeSpace').toBeLessThan(MAX_SECTION_PX);
  });

  test('HowItWorks section header ~52px / .type-title', async ({ page }) => {
    const px = await getFontSize(page, ID.servicesTitle);
    expect(px, 'HowItWorks').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'HowItWorks').toBeLessThan(MAX_SECTION_PX);
  });

  test.skip('Testimonials section header ~52px / .type-title', async ({ page }) => {
    const px = await getFontSize(page, ID.testimonialsTitle);
    expect(px, 'Testimonials').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'Testimonials').toBeLessThan(MAX_SECTION_PX);
  });

  test('Contact-Follow section header ~52px / .type-title', async ({ page }) => {
    const px = await getFontSize(page, ID.contactSocialTitle);
    expect(px, 'Contact-Follow').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'Contact-Follow').toBeLessThan(MAX_SECTION_PX);
  });

  test('Contact-Office section header ~52px / .type-title', async ({ page }) => {
    const px = await getFontSize(page, ID.contactOfficeTitle);
    expect(px, 'Contact-Office').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'Contact-Office').toBeLessThan(MAX_SECTION_PX);
  });

  // ── Headers that were once sub-tier; must now render at section size ──────
  test('AboutLight "ליווי להתגברות" ~52px / .type-title (was sub, needs section)', async ({ page }) => {
    const px = await getFontSize(page, ID.aboutCredentialsTitle);
    expect(px, 'AboutLight').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'AboutLight').toBeLessThan(MAX_SECTION_PX);
  });

  test('Scheduling "קביעת פגישת ייעוץ" ~52px / .type-title (was sub, needs section)', async ({ page }) => {
    const px = await getFontSize(page, ID.ctaBandTitle);
    expect(px, 'Scheduling').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'Scheduling').toBeLessThan(MAX_SECTION_PX);
  });

  test('CoupleTherapy "טיפול זוגי" ~52px / .type-title (was sub, needs section)', async ({ page }) => {
    const px = await getFontSize(page, ID.photoGalleryTitle);
    expect(px, 'CoupleTherapy').toBeGreaterThan(MIN_SECTION_PX);
    expect(px, 'CoupleTherapy').toBeLessThan(MAX_SECTION_PX);
  });

  // ── Reignite — ungoverned outlier (currently 68px Elamy) ─────────────────
  test('Reignite "להצית מחדש" is .type-title sized, uses Elamy', async ({ page }) => {
    const result = await page.evaluate((id: string) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const s = getComputedStyle(el);
      return { fontSize: parseFloat(s.fontSize), fontFamily: s.fontFamily };
    }, ID.aboutGalleryTitle);
    expect(result, 'about-gallery title element exists').not.toBeNull();
    expect(result!.fontSize, 'Reignite font-size').toBeGreaterThan(MIN_SECTION_PX);
    expect(result!.fontSize, 'Reignite font-size').toBeLessThan(MAX_SECTION_PX);
    expect(result!.fontFamily.toLowerCase(), 'Reignite must use Elamy').toContain('elamy');
  });

  // ── Hero stays larger than section headers ────────────────────────────────
  test('Hero title is larger than section headers', async ({ page }) => {
    const heroSize = await getFontSize(page, ID.heroTitle);
    const sectionSize = await getFontSize(page, ID.aboutIntroTitle);
    expect(heroSize, 'hero exists').not.toBeNull();
    expect(heroSize!, 'hero > section').toBeGreaterThan(sectionSize!);
  });
});
