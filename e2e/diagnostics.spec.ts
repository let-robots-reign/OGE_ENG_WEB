import { test, expect } from "@playwright/test";

test.describe("Diagnostics Feature - Grammar Diagnostics Flow", () => {
  test("unauthenticated user navigating to grammar diagnostics sees access limit modal", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/diagnostics/grammar");

    // Modal showing registration requirement should be visible
    const modalHeader = page.getByText("Только для участников", {
      exact: true,
    });
    await expect(modalHeader).toBeVisible();

    // Sign in button is visible
    const signInBtn = page.getByRole("button", { name: "Войти" });
    await expect(signInBtn).toBeVisible();

    // Home button is visible
    const homeBtn = page.getByRole("button", { name: "На главную" });
    await expect(homeBtn).toBeVisible();

    // Clicking home redirects back
    await homeBtn.click();
    await expect(page).toHaveURL("/");
  });

  test("authenticated student can complete grammar diagnostics", async ({
    page,
  }) => {
    test.slow();
    // Generate unique credentials to prevent collisions
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const testEmail = `diag_student_${randomSuffix}@example.com`;
    const testName = `Diagnostic Student ${randomSuffix}`;

    // 1. Go to signup page
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // 2. Fill the signup form
    await page.getByPlaceholder("Маша").fill(testName);
    await page.getByPlaceholder("masha@example.com").fill(testEmail);
    await page.getByPlaceholder("••••••••").fill("password123");

    // Click user role button ("Я ученик")
    await page.getByRole("button", { name: /я ученик/i }).click();

    // Check agreement checkbox
    await page.locator("input[type='checkbox']").check();

    // Submit registration
    await page.getByRole("button", { name: "Создать аккаунт →" }).click();

    // 3. Wait for redirect to home
    await page.waitForURL("/");

    // 4. Navigate to grammar diagnostics
    await page.goto("/diagnostics/grammar");
    await page.waitForLoadState("networkidle");

    // Should load the page with "Формы слов" title
    await expect(
      page.getByRole("heading", { name: "Формы слов" }),
    ).toBeVisible();

    // 5. Fill Part 1 questions
    // Question 1 has 2 inputs: not touch (do not touch), tooth (teeth)
    const q1Input1 = page.locator("input[aria-label='Пропуск 1']").first();
    const q1Input2 = page.locator("input[aria-label='Пропуск 2']").first();

    await q1Input1.fill("don't touch");
    await q1Input2.fill("teeth");

    // Go to part 2
    await page.getByRole("button", { name: "Далее →" }).click();
    await expect(page.getByRole("heading", { name: "Перевод" })).toBeVisible();

    // 6. Fill Part 2 translations
    // Question 1 textarea
    const q1Translation = page.locator("textarea").first();
    await q1Translation.fill("These people are my friends. Look at them!");

    // Submit for analysis
    await page.getByRole("button", { name: "Отправить на проверку →" }).click();

    // 7. Verify result feedback is shown
    // Wait for the tRPC call to finish and results to be displayed
    await expect(
      page.getByRole("heading", { name: "Твой персональный разбор" }),
    ).toBeVisible({
      timeout: 25000,
    });
    await expect(page.getByText("разбор готов")).toBeVisible();

    // Feedback content should render
    const feedbackBox = page
      .locator(".fb-correct, .fb-incorrect, p, h2")
      .first();
    await expect(feedbackBox).toBeVisible();

    // Wait for logResult mutation to write to the DB in the background
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Navigating back to grammar diagnostics should redirect to "/" since it is completed
    await page.goto("/diagnostics/grammar");
    await page.waitForURL("/");
  });
});
