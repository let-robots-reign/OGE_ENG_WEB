import { test, expect } from "@playwright/test";

test.describe("Navigation — desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("header nav links are visible", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("header nav");
    await expect(nav.getByText("Главная")).toBeVisible();
    await expect(nav.getByText("Тренировки")).toBeVisible();
    await expect(nav.getByText("Варианты")).toBeVisible();
    await expect(nav.getByText("Теория")).toBeVisible();
    await expect(nav.getByText("Диагностика")).toBeVisible();
  });

  test("diagnostics nav link navigates to /diagnostics/grammar", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator("header nav").getByText("Диагностика").click();
    await expect(page).toHaveURL(/\/diagnostics\/grammar/);
  });

  test("unauthenticated user sees sign-in and sign-up buttons", async ({
    page,
  }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header.getByText("Войти")).toBeVisible();
    await expect(header.getByText("Регистрация")).toBeVisible();
  });

  test("sign-in header button navigates to auth", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByText("Войти").click();
    await expect(page).toHaveURL(/\/auth\/signin|\/api\/auth\/signin/);
  });
});

test.describe("Navigation — mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger menu opens and shows nav items", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Меню" });
    await expect(menuButton).toBeVisible();

    await menuButton.click();

    // The mobile dropdown menu is inside a relative container near the button.
    // Scope assertions to the dropdown to avoid matching page body content.
    const dropdown = page
      .locator("[aria-expanded='true'] + div, [aria-expanded='true'] ~ div")
      .first();

    await expect(
      page.locator("header").getByRole("link", { name: "Главная" }),
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: "Тренировки" }),
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: "Теория" }),
    ).toBeVisible();
    await expect(
      page
        .locator("header")
        .getByRole("link", { name: "Диагностика", exact: true }),
    ).toBeVisible();
  });

  test("mobile menu closes when clicking a nav link", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Меню" });
    await menuButton.click();

    // Click the "Диагностика" link (scoped to header to avoid diagnostics banner).
    await page
      .locator("header")
      .getByRole("link", { name: "Диагностика", exact: true })
      .click();

    await expect(page).toHaveURL(/\/diagnostics\/grammar/);
  });

  test("mobile menu shows auth buttons for unauthenticated user", async ({
    page,
  }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Меню" });
    await menuButton.click();

    await expect(
      page.locator("header").getByRole("link", { name: "Войти" }),
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: "Регистрация" }),
    ).toBeVisible();
  });
});
