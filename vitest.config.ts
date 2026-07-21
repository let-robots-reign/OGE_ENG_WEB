import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: [...configDefaults.exclude, "e2e/**/*"],
    alias: [
      {
        find: /src\/env(\.js)?$/,
        replacement: path.resolve(__dirname, "./src/env.mock.ts"),
      },
      {
        find: /@\/env$/,
        replacement: path.resolve(__dirname, "./src/env.mock.ts"),
      },
      {
        find: "next-auth/adapters",
        replacement: path.resolve(__dirname, "./src/server/auth.mock.ts"),
      },
      {
        find: "@/server/auth",
        replacement: path.resolve(__dirname, "./src/server/auth.mock.ts"),
      },
      {
        find: "@/server/auth.ts",
        replacement: path.resolve(__dirname, "./src/server/auth.mock.ts"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
