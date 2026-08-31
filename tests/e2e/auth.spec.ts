import { test, expect } from "@playwright/test";

test.describe("Auth — Sign In page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin");
  });

  test("renders the sign-in form", async ({ page }) => {
    // The form uses labels "Электронная почта" and "Пароль" without htmlFor,
    // so we locate the inputs by placeholder instead.
    await expect(page.getByPlaceholder("masha@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  });

  test("has a submit button", async ({ page }) => {
    await expect(
      page.locator("main").getByRole("button", { name: "Войти →" }),
    ).toBeVisible();
  });

  test("has a link to sign-up page", async ({ page }) => {
    const signupLink = page
      .locator("main")
      .getByRole("link", { name: "Зарегистрироваться" });
    await expect(signupLink).toBeVisible();

    await signupLink.click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test("shows OAuth provider buttons", async ({ page }) => {
    // OAuth buttons are rendered by OAuthButtons component.
    // Look for buttons that contain provider names or provider icons.
    const oauthButtons = page
      .locator("main")
      .locator("button[type='button'], a")
      .filter({
        hasText: /yandex|vk|яндекс|google/i,
      });
    // At least one OAuth button should be present.
    const count = await oauthButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Auth — Sign Up page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signup");
  });

  test("renders the sign-up form", async ({ page }) => {
    // Sign-up has: Имя, Электронная почта, Пароль fields.
    await expect(page.getByPlaceholder("Маша")).toBeVisible();
    await expect(page.getByPlaceholder("masha@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  });

  test("has role selection (student / teacher)", async ({ page }) => {
    await expect(
      page.locator("main").getByRole("button", { name: /ученик/i }),
    ).toBeVisible();
    await expect(
      page.locator("main").getByRole("button", { name: /учитель/i }),
    ).toBeVisible();
  });

  test("has a link back to sign-in page", async ({ page }) => {
    const signinLink = page
      .locator("main")
      .getByRole("link", { name: "Войти", exact: true });
    await expect(signinLink).toBeVisible();

    await signinLink.click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});
