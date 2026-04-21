import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for kb-next smoke baseline.
 *
 * webServer strategy: always defined.
 * - Local: `pnpm dev` (reuse existing dev server if already running).
 * - CI: `pnpm dev` as well — CI runs `pnpm build` as a prior step for type/build
 *   verification, but we test against the dev server for consistency with local
 *   workflow. Swap to `pnpm start` if production-mode screenshots diverge.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.1 },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
