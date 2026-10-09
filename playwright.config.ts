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
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL for `page.goto('/')` and `request.get('/x')`. */
    baseURL: BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // firefox and webkit run locally only — cross-browser snapshot baselines don't exist for linux CI
    ...(!process.env.CI ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ] : []),

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
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
