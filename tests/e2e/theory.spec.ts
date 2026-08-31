import { test, expect } from "@playwright/test";

test.describe("Theory pages", () => {
  test("general theory category page loads", async ({ page }) => {
    await page.goto("/theory/general");

    // The page should show theory cards.
    await expect(
      page.locator("div.font-mono", { hasText: /^теория$/ }),
    ).toBeVisible();
    await expect(page.locator("main a").first()).toBeVisible();
  });

  test("use-of-english theory category page loads", async ({ page }) => {
    await page.goto("/theory/use-of-english");

    await expect(
      page.locator("div.font-mono", { hasText: /^теория$/ }),
    ).toBeVisible();
    await expect(page.locator("main a").first()).toBeVisible();
  });

  test("writing theory category page loads", async ({ page }) => {
    await page.goto("/theory/writing");

    await expect(
      page.locator("div.font-mono", { hasText: /^теория$/ }),
    ).toBeVisible();
    await expect(page.locator("main a").first()).toBeVisible();
  });

  test("clicking a theory card navigates to the topic page", async ({
    page,
  }) => {
    await page.goto("/theory/general");
    await page.waitForLoadState("networkidle");
    // Wait a brief moment for Next.js client-side router hydration
    await page.waitForTimeout(500);

    // Click the first topic card.
    const firstCard = page.locator("main a[href^='/theory/general/']").first();

    // Wait for the URL to change to the topic page
    await Promise.all([
      page.waitForURL(/\/theory\/general\/.+/),
      firstCard.click(),
    ]);
  });

  test("theory topic page renders content", async ({ page }) => {
    await page.goto("/theory/general");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Navigate to the first topic.
    const firstCard = page.locator("main a[href^='/theory/general/']").first();
    await Promise.all([
      page.waitForURL(/\/theory\/general\/.+/),
      firstCard.click(),
    ]);

    // Content should be present (theory articles have substantial text).
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Verify it's indeed the topic page and not the category listing by checking for a back button
    // or specific structures of the article page.
    const backButton = main.locator("a[href='/theory/general']");
    await expect(backButton).toBeVisible();
  });

  test("invalid theory category shows 404", async ({ page }) => {
    const response = await page.goto("/theory/nonexistent-category");

    // Should get a 404 response.
    expect(response?.status()).toBe(404);
  });
});
