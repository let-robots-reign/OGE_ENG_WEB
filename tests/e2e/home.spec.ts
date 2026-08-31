import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/ОГЭ Английский/);
  });

  test("header shows logo and site name", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header.getByText("ОГЭ Английский")).toBeVisible();
  });

  test("training section shows 4 category cards", async ({ page }) => {
    const section = page.locator("section#training");
    await expect(section).toBeVisible();

    // Each training card is a <Link> with a title inside.
    const cards = section.locator("a");
    await expect(cards).toHaveCount(4);

    // Verify the four card titles are present.
    await expect(section.getByText("Аудирование")).toBeVisible();
    await expect(section.getByText("Чтение")).toBeVisible();
    // "Языковой материал" and "Письмо" might match descriptions too, so check headings.
    await expect(
      section.locator("div.font-display", { hasText: "Языковой материал" }),
    ).toBeVisible();
    await expect(
      section.locator("div.font-display", { hasText: /^Письмо$/ }),
    ).toBeVisible();
  });

  test("variants section shows variant cards", async ({ page }) => {
    const section = page.locator("section#variants");
    await expect(section).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Варианты" }),
    ).toBeVisible();
  });

  test("theory section shows 3 topic cards", async ({ page }) => {
    const section = page.locator("section#theory");
    await expect(section).toBeVisible();
    await expect(
      section.getByRole("heading", { name: "Теория" }),
    ).toBeVisible();

    // Theory cards — each is a link.
    const cards = section.locator("a");
    await expect(cards).toHaveCount(3);

    await expect(
      section.getByText("Общая информация об экзамене"),
    ).toBeVisible();
  });

  test("diagnostics banner is visible", async ({ page }) => {
    const section = page.locator("section#diagnostics");
    await expect(section).toBeVisible();
    await expect(section.getByText(/диагностика/i)).toBeVisible();
  });

  test("footer shows copyright", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText("© 2026 ОГЭ Английский")).toBeVisible();
  });

  test("clicking training card navigates to topics page", async ({ page }) => {
    // Training cards are <a> links. Click the first one (Аудирование).
    const section = page.locator("section#training");
    const firstCard = section.locator("a").first();
    await firstCard.click();

    await expect(page).toHaveURL(/\/training\/audio\/topics/);
  });
});
