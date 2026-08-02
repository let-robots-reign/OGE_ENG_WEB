import { test, expect } from "@playwright/test";

test.describe("Training — Audio (Listening) E2E Suite", () => {
  test("audio topics page displays 'Задания 6-11' as active topic", async ({
    page,
  }) => {
    await page.goto("/training/audio/topics");

    await expect(
      page.getByRole("heading", { name: "Аудирование" }),
    ).toBeVisible();

    // Verify all 3 audio task cards are rendered
    await expect(page.getByText("Задания 1–4")).toBeVisible();
    await expect(page.getByText("Задание 5")).toBeVisible();
    await expect(page.getByText("Задания 6–11")).toBeVisible();

    // Ensure "Задания 6-11" is clickable and not disabled with "В разработке"
    const gapFillCard = page.locator("a", { hasText: "Задания 6–11" });
    await expect(gapFillCard).toBeVisible();
    await expect(gapFillCard).not.toHaveClass(/pointer-events-none/);
  });

  test("clicking 'Задания 6-11' card navigates to audio runner with gap_fill interface", async ({
    page,
  }) => {
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

  test("gap_fill runner allows filling text inputs and interacting with instructions modal", async ({
    page,
  }) => {
    await page.goto("/training/audio/topics");

    // Click "Задания 6-11"
    await page.locator("a", { hasText: "Задания 6–11" }).click();
    await page.waitForURL(/\/training\/audio\?topic=\d+/);

    // Open instruction modal. The shared Modal has no dialog role, so scope
    // assertions to its container instead.
    const infoBtn = page.getByRole("button", { name: /инструкция/i });
    await expect(infoBtn).toBeVisible();
    await infoBtn.click();

    const modal = page.locator(".modal");
    await expect(modal).toBeVisible();
    // Wording unique to the modal — the gap-fill instructions also appear in
    // the page heading and above the answer table.
    await expect(modal.getByText(/вы услышите запись дважды/i)).toBeVisible();

    // Close modal
    await modal.getByRole("button", { name: "ОК" }).click();
    await expect(modal).toBeHidden();

    // Tasks 6–11 are six gaps, each with its own labelled input.
    const textboxes = page.getByRole("textbox");
    await expect(textboxes).toHaveCount(6);

    // Input is upper-cased as the student types.
    await textboxes.first().fill("fifteen");
    await expect(textboxes.first()).toHaveValue("FIFTEEN");

    // Verify check button is enabled once an answer is entered
    const checkBtn = page.getByRole("button", { name: /проверить ответы/i });
    await expect(checkBtn).toBeEnabled();
  });

  test("matching runner enforces that each rubric is used only once", async ({
    page,
  }) => {
    await page.goto("/training/audio/topics");

    await page.locator("a", { hasText: "Задание 5" }).click();
    await page.waitForURL(/\/training\/audio\?topic=\d+/);

    // Five speakers A–E, each answered with a rubric number.
    const selects = page.getByRole("combobox");
    await expect(selects).toHaveCount(5);

    await selects.first().selectOption("1");

    // Rubric 1 is now spoken for, so speaker B cannot reuse it.
    await expect(selects.nth(1).locator('option[value="1"]')).toBeDisabled();
    await expect(selects.nth(1).locator('option[value="2"]')).toBeEnabled();
  });
});
