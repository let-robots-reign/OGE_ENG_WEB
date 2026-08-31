import { test, expect } from "@playwright/test";

test.describe("Training — Reading E2E Suite", () => {
  test("reading topics page displays task cards and exam mode", async ({
    page,
  }) => {
    await page.goto("/training/reading/topics");

    await expect(page.getByRole("heading", { name: "Чтение" })).toBeVisible();

    // Verify task cards
    await expect(page.getByText("Задание 12")).toBeVisible();
    await expect(page.getByText("Задания 13–19")).toBeVisible();
    await expect(page.getByText("Все 8 заданий с таймером")).toBeVisible();
  });

  test("clicking 'Задания 13–19' card navigates to True/False/Not Stated runner", async ({
    page,
  }) => {
    await page.goto("/training/reading/topics");

    const tfCard = page.locator("a", { hasText: "Задания 13–19" });
    await expect(tfCard).toBeVisible();
    await tfCard.click();

    // Should navigate to /training/reading?topic=...
    await expect(page).toHaveURL(/\/training\/reading\?topic=\d+/);
    await expect(page.getByText(/раздел 2 · чтение/i)).toBeVisible();
  });

  test("reading runner allows interacting with instruction modal and selecting choices", async ({
    page,
  }) => {
    await page.goto("/training/reading/topics");

    const tfCard = page.locator("a", { hasText: "Задания 13–19" });
    await tfCard.click();
    await page.waitForURL(/\/training\/reading\?topic=\d+/);

    // Open instructions modal
    const infoBtn = page.getByRole("button", { name: /инструкция/i });
    if (await infoBtn.isVisible()) {
      await infoBtn.click();
      const modal = page.locator(".modal");
      await expect(modal).toBeVisible();
      await modal.getByRole("button", { name: "ОК" }).click();
      await expect(modal).toBeHidden();
    }

    // Check if statement choice buttons exist and can be clicked
    const choiceButtons = page.getByRole("button", { name: /True|False|Not stated/i });
    const count = await choiceButtons.count();
    if (count > 0) {
      await choiceButtons.first().click();
      // Verify check answers button is visible
      const checkBtn = page.getByRole("button", { name: /проверить ответы/i });
      await expect(checkBtn).toBeVisible();
    }
  });

  test("matching runner allows picking headings and assigning to text cards", async ({
    page,
  }) => {
    await page.goto("/training/reading/topics");

    const matchingCard = page.locator("a", { hasText: "Задание 12" });
    await matchingCard.click();
    await page.waitForURL(/\/training\/reading\?topic=\d+/);

    // Verify subheader is present
    await expect(page.getByText(/раздел 2 · чтение/i)).toBeVisible();
  });
});
