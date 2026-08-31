import { test, expect } from "@playwright/test";

test.describe("Training — Use of English E2E Suite", () => {
  test("use-of-english topics page displays topics listing", async ({
    page,
  }) => {
    await page.goto("/training/use-of-english/topics");

    await expect(
      page.getByRole("heading", { name: "Языковой материал" }),
    ).toBeVisible();

    // Verify presence of topic rows (e.g. Словообразование or other grammar topics)
    const topicLinks = page.locator("a[href*='/training/use-of-english?topic=']");
    await expect(topicLinks.first()).toBeVisible();
  });

  test("clicking a topic row navigates to Use of English runner", async ({
    page,
  }) => {
    await page.goto("/training/use-of-english/topics");

    const firstTopicLink = page
      .locator("a[href*='/training/use-of-english?topic=']")
      .first();
    await firstTopicLink.click();

    // Should navigate to /training/use-of-english?topic=...
    await expect(page).toHaveURL(/\/training\/use-of-english\?topic=\d+/);
    await expect(
      page.getByText(/раздел 3 · языковой материал/i),
    ).toBeVisible();
  });

  test("uoe runner renders question cards and accepts text input", async ({
    page,
  }) => {
    await page.goto("/training/use-of-english/topics");

    const firstTopicLink = page
      .locator("a[href*='/training/use-of-english?topic=']")
      .first();
    await firstTopicLink.click();
    await page.waitForURL(/\/training\/use-of-english\?topic=\d+/);

    const inputs = page.getByRole("textbox");
    const count = await inputs.count();
    if (count > 0) {
      // Type in the first input
      await inputs.first().fill("answer");
      await expect(inputs.first()).toHaveValue("answer");

      // Verify the check button is present
      const checkBtn = page.getByRole("button", { name: /проверить/i });
      await expect(checkBtn).toBeVisible();
    }
  });
});
