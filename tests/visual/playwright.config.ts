import { defineConfig } from '@playwright/test';

/**
 * Visual-regression config. NOT used by `npm run test:e2e` / the default Playwright config:
 * the default config ignores tests/visual, and this one only matches `vr.shots.ts`.
 * Driven by `npm run vr` (tests/visual/run.mjs), which sets the VR_* env vars below.
 *
 *   VR_BASE_URL   server under test
 *   VR_SNAP_DIR   where baseline PNGs live (a temp dir, never committed)
 *   VR_MODE       'baseline' (write snapshots) | 'candidate' (compare at 0 px)
 *   VR_RESULTS    JSONL file the spec appends one row per shot to
 *   VR_PAGES / VR_VIEWPORTS / VR_SECTIONS   scoping filters (comma lists)
 */
const SNAP_DIR = process.env.VR_SNAP_DIR ?? '.vr-snapshots';

export default defineConfig({
  testDir: '.',
  testMatch: 'vr.shots.ts',
  outputDir: './.out', // actual / expected / diff PNGs of failing shots (gitignored)
  snapshotPathTemplate: `${SNAP_DIR}/{arg}{ext}`,
  fullyParallel: true,
  workers: 2, // keep the owner's CPU free
  retries: 0,
  reporter: [['dot']],
  timeout: 180_000,
  expect: {
    toHaveScreenshot: { maxDiffPixels: 0, maxDiffPixelRatio: 0, threshold: 0 },
  },
  use: {
    baseURL: process.env.VR_BASE_URL ?? 'http://127.0.0.1:3000',
    browserName: 'chromium',
    deviceScaleFactor: 1,
    contextOptions: { reducedMotion: 'reduce' },
  },
});
