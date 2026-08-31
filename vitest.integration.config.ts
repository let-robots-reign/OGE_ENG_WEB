import { defineConfig } from "vitest/config";
import { loadEnvFile } from "node:process";
import path from "node:path";

if (!process.env.DATABASE_URL) loadEnvFile(".env");
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/diagnostics.test.ts"],
    testTimeout: 15_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
