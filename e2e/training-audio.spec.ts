import { test, expect } from "@playwright/test";

test.describe("Training — Audio (Listening) E2E Suite", () => {
  test("audio topics page displays 'Задания 6-11' as active topic", async ({ page }) => {
    await page.goto("/training/audio/topics");

    await expect(page.getByRole("heading", { name: "Аудирование" })).toBeVisible();

    // Verify all 3 audio task cards are rendered
    await expect(page.getByText("Задания 1–4")).toBeVisible();
    await expect(page.getByText("Задание 5")).toBeVisible();
    await expect(page.getByText("Задания 6–11")).toBeVisible();

    // Ensure "Задания 6-11" is clickable and not disabled with "В разработке"
    const gapFillCard = page.locator("a", { hasText: "Задания 6–11" });
    await expect(gapFillCard).toBeVisible();
    await expect(gapFillCard).not.toHaveClass(/pointer-events-none/);
  });

  test("clicking 'Задания 6-11' card navigates to audio runner with gap_fill interface", async ({ page }) => {
    await page.goto("/training/audio/topics");

    const gapFillCard = page.locator("a", { hasText: "Задания 6–11" });
    await gapFillCard.click();

    // Should navigate to /training/audio?topic=...
    await expect(page).toHaveURL(/\/training\/audio\?topic=\d+/);

    // Verify header and instruction text
    await expect(page.getByText(/раздел 1 · аудирование/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /вы услышите/i }),
    ).toBeVisible();
  });

  test("gap_fill runner allows filling text inputs and interacting with instructions modal", async ({ page }) => {
    await page.goto("/training/audio/topics");

    // Click "Задания 6-11"
    await page.locator("a", { hasText: "Задания 6–11" }).click();
    await page.waitForURL(/\/training\/audio\?topic=\d+/);

    // Open instruction modal
    const infoBtn = page.getByRole("button", { name: /инструкция/i });
    if (await infoBtn.isVisible()) {
      await infoBtn.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/занесите данные в таблицу/i)).toBeVisible();

      // Close modal
      await page.getByRole("button", { name: "ОК" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }

    // Verify presence of input textboxes for gap fill questions
    const textboxes = page.getByRole("textbox");
    const count = await textboxes.count();

    if (count > 0) {
      // Type in the first gap input
      await textboxes.first().fill("fifteen");
      await expect(textboxes.first()).toHaveValue("FIFTEEN");

      // Verify check button is enabled once an answer is entered
      const checkBtn = page.getByRole("button", { name: /проверить ответы/i });
      await expect(checkBtn).toBeEnabled();
    }
  });
});
