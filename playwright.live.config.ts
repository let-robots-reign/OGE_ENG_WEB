import { defineConfig } from "@playwright/test";
import path from "node:path";

// Deliberately separate from the default suite: this consumes real AI quota.
export default defineConfig({
  testDir: "./tests/live",
  globalSetup: "./tests/live/setup.ts",
  outputDir: "./tests/e2e/test-results/live",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
    storageState:
      process.env.DIAGNOSTICS_CREATE_LOCAL_TEST_USER === "1"
        ? path.resolve("tests/e2e/test-results/live-auth/session.json")
        : process.env.DIAGNOSTICS_TEST_STORAGE_STATE,
  },
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
