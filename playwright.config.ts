import { defineConfig, devices } from "@playwright/test";
import { loadEnvFile } from "node:process";

if (!process.env.DATABASE_URL) loadEnvFile();

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/e2e/test-results",

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry once on CI to handle flaky network/tRPC hydration. */
  retries: process.env.CI ? 1 : 0,

  /* Parallel tests — use half the available cores on CI. */
  workers: process.env.CI ? "50%" : undefined,

  /* Reporter: list for local dev, html report on CI. */
  reporter: process.env.CI ? "html" : "list",

  /* Shared settings for all the projects below. */
  use: {
    baseURL,
    /* Collect trace on first retry (great for debugging CI failures). */
    trace: "on-first-retry",
    /* Screenshot on failure. */
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],

  /* Run the local dev server before starting the tests. */
  webServer: {
    command: `pnpm exec next dev --turbo --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
