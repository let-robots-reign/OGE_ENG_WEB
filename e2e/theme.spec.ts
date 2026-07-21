import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any persisted theme preference before each test.
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("theme"));
    await page.reload();
  });

  test("starts in light mode by default", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
  });

  test("switches to dark mode on toggle click", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /тему/i });
    await toggle.click();

    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");
  });

  test("switches back to light mode on second click", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /тему/i });

    // First click → dark
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Second click → light
    await toggle.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("light");
  });

  test("dark mode persists after page reload", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /тему/i });
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
