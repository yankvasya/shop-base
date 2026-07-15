import { defineConfig, devices } from '@playwright/test'

/**
 * These are smoke tests against a real Shopify store (no mocking), so they
 * need the same live Storefront API credentials as `pnpm dev` — see
 * README.md's "E2E tests" section for local and CI setup.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry everywhere, not just CI: these tests hit a live third-party API
  // with no mocking, so an occasional transient fetch failure is expected
  // noise, not a real bug.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
