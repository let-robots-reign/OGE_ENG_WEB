/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignInForm } from "@/app/auth/signin/_components/sign-in-form";
import { SignUpForm } from "@/app/auth/signup/_components/sign-up-form";
import { signIn } from "next-auth/react";

const mocks = vi.hoisted(() => ({
  mockSignUpAction: vi.fn(),
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  callbackUrl: null as string | null,
}));

// Mock routers/searchparams
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) =>
      key === "callbackUrl"
        ? mocks.callbackUrl
        : key === "error"
          ? "CredentialsSignin"
          : null,
  }),
  useRouter: () => ({
    push: mocks.mockPush,
    replace: mocks.mockReplace,
    refresh: vi.fn(),
  }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("@/app/auth/signup/_components/actions", () => ({
  signup: mocks.mockSignUpAction,
}));

describe("Authentication Views Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.callbackUrl = null;
  });

  describe("SignInForm", () => {
    it("should render error message after submit fails", async () => {
      vi.mocked(signIn).mockResolvedValue({
        error: "CredentialsSignin",
        code: undefined,
        ok: false,
        status: 401,
        url: null,
      });

      render(<SignInForm providers={[]} />);

      const submitBtn = screen.getByRole("button", { name: "Войти →" });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText("Неверная почта или пароль"),
        ).toBeInTheDocument();
      });
    });

    it("should trigger signIn handler when clicking provider buttons", () => {
      const providers = [{ id: "yandex", name: "Yandex" }];
      render(<SignInForm providers={providers} />);

      const yandexBtn = screen.getByRole("button", {
        name: /Войти через Яндекс/i,
      });
      fireEvent.click(yandexBtn);

      expect(signIn).toHaveBeenCalledWith("yandex", { callbackUrl: "/" });
    });

    it("returns to the classroom invite after credentials sign-in", async () => {
      mocks.callbackUrl = "/classes/join/invite-token";
      vi.mocked(signIn).mockResolvedValue({
        error: undefined,
        code: undefined,
        ok: true,
        status: 200,
        url: null,
      });

      render(<SignInForm providers={[]} />);
      fireEvent.change(screen.getByPlaceholderText("masha@example.com"), {
        target: { value: "student@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "password" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Войти →" }));

      await waitFor(() => {
        expect(mocks.mockReplace).toHaveBeenCalledWith(
          "/classes/join/invite-token",
        );
      });
    });

    it("preserves the classroom invite for OAuth sign-in", () => {
      mocks.callbackUrl = "/classes/join/invite-token";

      render(<SignInForm providers={[{ id: "yandex", name: "Yandex" }]} />);
      fireEvent.click(
        screen.getByRole("button", { name: /Войти через Яндекс/i }),
      );

      expect(signIn).toHaveBeenCalledWith("yandex", {
        callbackUrl: "/classes/join/invite-token",
      });
    });
  });

  describe("SignUpForm", () => {
    it("should validate minimum password length locally", async () => {
      render(<SignUpForm providers={[]} />);

      const passInput = screen.getByPlaceholderText(
        "••••••••",
      ) as HTMLInputElement;
      fireEvent.change(passInput, { target: { value: "123" } });

      const submitBtn = screen.getByRole("button", {
        name: "Создать аккаунт →",
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText("Пароль должен содержать не менее 6 символов"),
        ).toBeInTheDocument();
      });
      expect(mocks.mockSignUpAction).not.toHaveBeenCalled();
    });

    it("should display action error if registration action fails", async () => {
      mocks.mockSignUpAction.mockResolvedValue({
        error: "Пользователь с таким email уже существует.",
      });

      render(<SignUpForm providers={[]} />);

      const nameInput = screen.getByPlaceholderText("Маша") as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText(
        "masha@example.com",
      ) as HTMLInputElement;
      const passInput = screen.getByPlaceholderText(
        "••••••••",
      ) as HTMLInputElement;
      const submitBtn = screen.getByRole("button", {
        name: "Создать аккаунт →",
      });

      fireEvent.change(nameInput, { target: { value: "Masha" } });
      fireEvent.change(emailInput, { target: { value: "masha@example.com" } });
      fireEvent.change(passInput, { target: { value: "password" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText("Пользователь с таким email уже существует."),
        ).toBeInTheDocument();
      });
    });

    it("should submit with role 'teacher' when teacher button is clicked", async () => {
      mocks.mockSignUpAction.mockResolvedValue({ success: true });
      vi.mocked(signIn).mockResolvedValue({
        error: undefined,
        code: undefined,
        ok: true,
        status: 200,
        url: "",
      });

      render(<SignUpForm providers={[]} />);

      const nameInput = screen.getByPlaceholderText("Маша");
      const emailInput = screen.getByPlaceholderText("masha@example.com");
      const passInput = screen.getByPlaceholderText("••••••••");
      const teacherBtn = screen.getByRole("button", { name: "Я учитель" });
      const submitBtn = screen.getByRole("button", {
        name: "Создать аккаунт →",
      });

      fireEvent.change(nameInput, { target: { value: "Teacher Name" } });
      fireEvent.change(emailInput, {
        target: { value: "teacher@example.com" },
      });
      fireEvent.change(passInput, { target: { value: "password123" } });
      fireEvent.click(teacherBtn);
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mocks.mockSignUpAction).toHaveBeenCalledWith({
          name: "Teacher Name",
          email: "teacher@example.com",
          password: "password123",
          role: "teacher",
        });
      });
    });
  });
});
