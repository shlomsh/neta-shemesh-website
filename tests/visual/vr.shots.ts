import { test, expect, type Page, type Locator } from '@playwright/test';
import { appendFileSync } from 'node:fs';

/**
 * Visual-regression shots. One test per (page, viewport). Driven by `npm run vr`; see README.md.
 *
 * reducedMotion: 'reduce' (config) renders the final static frames and turns SoftSnap off,
 * so the output is deterministic. Hover states are therefore NOT exercised.
 */

const VIEWPORTS = [
  { w: 1280, h: 900 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
  { w: 768, h: 1024 },
  { w: 375, h: 812 },
];
const BLOG_VIEWPORTS = [1280, 768, 375];

const MODE = process.env.VR_MODE === 'baseline' ? 'baseline' : 'candidate';
const RESULTS = process.env.VR_RESULTS;

const csv = (v?: string) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : null);
const PAGES = csv(process.env.VR_PAGES) ?? ['home', 'blog', 'post'];
const WIDTHS = csv(process.env.VR_VIEWPORTS)?.map(Number) ?? null;
const SECTIONS = csv(process.env.VR_SECTIONS);

type Row = { shot: string; viewport: number; diffPx: number | null; status: string; note?: string };
const record = (row: Row) => {
  if (RESULTS) appendFileSync(RESULTS, JSON.stringify(row) + '\n');
};

/** Load, scroll through once so lazy images/backgrounds load, then settle fonts and images. */
async function settle(page: Page) {
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.setAttribute('loading', 'eager'));
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map(async (img) => {
        if (!img.complete) await new Promise((r) => { img.onload = img.onerror = () => r(null); });
        try { await img.decode(); } catch { /* broken image: same on both sides */ }
      }),
    );
  });
  await page.waitForTimeout(300);
}

/** Compare one screenshot at 0 px; record the result, return whether it was clean. */
async function shoot(page: Page, file: string, label: string, viewport: number, target: Page | Locator, fullPage: boolean) {
  const name = `${file}-${viewport}.png`;
  const base = { shot: label, viewport };
  try {
    await expect(target).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      mask: [page.locator('[data-map-embed], iframe')],
      ...(fullPage ? { fullPage: true } : {}),
    });
    record({ ...base, diffPx: 0, status: MODE === 'baseline' ? 'recorded' : 'ok' });
    return true;
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    const px = /(\d+) pixels? \(ratio/.exec(msg);
    if (px) record({ ...base, diffPx: Number(px[1]), status: 'DIFF' });
    else if (/snapshot doesn't exist/i.test(msg)) record({ ...base, diffPx: null, status: 'NO-BASELINE' });
    else if (/Expected an image|sizes do not match/i.test(msg)) {
      const sz = /Expected an image (\d+px by \d+px), received (\d+px by \d+px)/.exec(msg);
      record({ ...base, diffPx: null, status: 'SIZE', note: sz ? `${sz[1]} -> ${sz[2]}` : undefined });
    } else record({ ...base, diffPx: null, status: 'ERROR', note: msg.split('\n')[0].slice(0, 120) });
    return false;
  }
}

async function assertNoOverflow(page: Page, shot: string, viewport: number) {
  if (MODE === 'baseline') return true;
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  const ok = sw <= cw;
  record({ shot: `${shot} overflow`, viewport, diffPx: null, status: ok ? 'ok' : 'OVERFLOW', note: ok ? undefined : `scrollWidth ${sw} > clientWidth ${cw}` });
  return ok;
}

const wanted = (w: number) => !WIDTHS || WIDTHS.includes(w);

/* ---------- home: one element shot per top-level section + footer ---------- */
if (PAGES.includes('home')) {
  for (const vp of VIEWPORTS.filter((v) => wanted(v.w))) {
    test(`home @${vp.w}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('/');
      await settle(page);

      const els = page.locator('main > section, footer');
      const count = await els.count();
      let clean = await assertNoOverflow(page, 'home', vp.w);
      for (let i = 0; i < count; i++) {
        const el = els.nth(i);
        const id = (await el.getAttribute('id')) ?? (await el.evaluate((n) => n.tagName.toLowerCase()));
        const idx = String(i + 1).padStart(2, '0');
        if (SECTIONS && !SECTIONS.includes(id) && !SECTIONS.includes(String(i + 1)) && !SECTIONS.includes(idx)) continue;
        clean = (await shoot(page, `home-${idx}`, `home-${idx} #${id}`, vp.w, el, false)) && clean;
      }
      expect(clean, 'one or more home shots differ (see the summary)').toBe(true);
    });
  }
}

/* ---------- blog index + first post: full page ---------- */
for (const vp of VIEWPORTS.filter((v) => BLOG_VIEWPORTS.includes(v.w) && wanted(v.w))) {
  for (const kind of ['blog', 'post'] as const) {
    if (!PAGES.includes(kind)) continue;
    test(`${kind} @${vp.w}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      let path = '/blog';
      if (kind === 'post') {
        await page.goto('/blog');
        const href = await page.locator('main a[href^="/blog/"]').first().getAttribute('href');
        expect(href, 'no post link on /blog').toBeTruthy();
        path = href!;
      }
      await page.goto(path);
      await settle(page);
      let clean = await assertNoOverflow(page, kind, vp.w);
      clean = (await shoot(page, kind, kind, vp.w, page, true)) && clean;
      expect(clean, `${kind} differs (see the summary)`).toBe(true);
    });
  }
}
