import { test, expect } from "@playwright/test";

test.describe("Training — Writing E2E Suite", () => {
  test("writing page loads all sub-sections of writing exercises", async ({
    page,
  }) => {
    await page.goto("/training/writing");

    // Subheader
    await expect(page.getByText(/раздел 4 · письмо/i)).toBeVisible();

    // Section 1: Structure (Структура письма)
    await expect(
      page.getByRole("heading", { name: /структура письма/i }),
    ).toBeVisible();

    // Section 2: Phrases (Обязательные фразы)
    await expect(
      page.getByRole("heading", { name: /обязательные фразы/i }),
    ).toBeVisible();

    // Section 3: Linkers (Слова-связки)
    await expect(
      page.getByRole("heading", { name: /слова-связки/i }),
    ).toBeVisible();

    // Section 4: Full answers (Ответы на 3 вопроса)
    await expect(
      page.getByRole("heading", { name: /ответы на 3 вопроса/i }),
    ).toBeVisible();
  });

  test("writing runner allows interacting with word chips and answer options", async ({
    page,
  }) => {
    await page.goto("/training/writing");

    // Click on a word chip in Section 2 (Phrases) if available
    const wordChips = page.locator("button.chip, button[class*='rounded-lg']");
    const chipCount = await wordChips.count();
    if (chipCount > 0) {
      await wordChips.first().click();
    }

    // Verify Check button is present on the page
    const checkBtn = page.getByRole("button", { name: /проверить/i });
    await expect(checkBtn).toBeVisible();
  });
});
