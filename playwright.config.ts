import { defineConfig, devices } from '@playwright/test';

/**
 * The site under test. Override with BASE_URL to point at another server, e.g.
 *   npm run start -- -p 3200 &  BASE_URL=http://localhost:3200 npx playwright test
 * Specs use relative URLs (`page.goto('/')`) and resolve against this.
 */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const base = new URL(BASE_URL);
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* The visual-regression harness has its own config (tests/visual/playwright.config.ts, `npm run vr`). */
  testIgnore: '**/visual/**',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter: a readable list in the terminal plus the HTML report, which must never open a server and block a run (`open: 'never'`). */
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL for `page.goto('/')` and `request.get('/x')`. */
    baseURL: BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /*
   * Projects: the same specs run on every engine and form factor the site is used on.
   *   chromium  Desktop Chrome: fine pointer, so the slide pager runs (tests/slide-pager.spec.ts)
   *   webkit    Desktop Safari: the engine behind every iOS browser, on a desktop
   *   iphone    iPhone 17, WebKit with isMobile + hasTouch: coarse pointer, narrow viewport, native scroll
   *   ipad      iPad Pro 11 in landscape, 1194px wide but touch: the width where a desktop-only
   *             assumption (pager, hover, fine pointer) would break first
   * firefox is added locally only (CI installs `chromium webkit`, see .github/workflows/playwright.yml).
   * No project uses toHaveScreenshot: there are no snapshot baselines; pixel comparison is `npm run vr`.
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'iphone',
      use: { ...devices['iPhone 17'] },
    },
    {
      name: 'ipad',
      use: { ...devices['iPad Pro 11 landscape'] },
    },
    ...(!process.env.CI ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
    ] : []),
  ],

  /* Start the production server (needs `npm run build` first) when BASE_URL is local
   * and nothing is listening there yet. Remote BASE_URLs are tested as they are. */
  webServer: isLocal
    ? {
        command: `npm run start -- -p ${base.port || '3000'}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
