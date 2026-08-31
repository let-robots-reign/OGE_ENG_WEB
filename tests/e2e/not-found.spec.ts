import { test, expect } from "@playwright/test";

test.describe("404 page", () => {
  test("shows 404 for a nonexistent route", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText(/страница не найдена/i)).toBeVisible();
  });

  test("has a link back to the home page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    const homeLink = page.getByRole("link", {
      name: /вернуться на главную/i,
    });
    await expect(homeLink).toBeVisible();

    await homeLink.click();
    await expect(page).toHaveURL("/");
  });
});
