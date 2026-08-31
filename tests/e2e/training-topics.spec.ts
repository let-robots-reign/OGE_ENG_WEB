import { test, expect } from "@playwright/test";

test.describe("Training — topic listing pages", () => {
  test("audio topics page loads with correct heading", async ({ page }) => {
    await page.goto("/training/audio/topics");

    await expect(
      page.getByRole("heading", { name: "Аудирование" }),
    ).toBeVisible();
    await expect(page.getByText(/listening/i)).toBeVisible();
  });

  test("reading topics page loads with correct heading", async ({ page }) => {
    await page.goto("/training/reading/topics");

    await expect(page.getByRole("heading", { name: "Чтение" })).toBeVisible();
    await expect(page.getByText(/reading/i)).toBeVisible();
  });

  test("use-of-english topics page loads with correct heading", async ({
    page,
  }) => {
    await page.goto("/training/use-of-english/topics");

    await expect(
      page.getByRole("heading", { name: "Языковой материал" }),
    ).toBeVisible();
    await expect(page.getByText(/use of english/i)).toBeVisible();
  });

  test("writing page loads", async ({ page }) => {
    await page.goto("/training/writing");

    // The page should render without errors.
    await expect(page.locator("main")).toBeVisible();
  });

  test("each topics page has a section sub-header", async ({ page }) => {
    // Verify the sub-header pattern on one page as a representative check.
    await page.goto("/training/audio/topics");

    // The sub-header shows the section label (e.g. "раздел 1 · listening").
    await expect(page.getByText(/раздел.*listening/i)).toBeVisible();
  });
});
