/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./header";
import { auth } from "@/server/auth";

vi.mock("@/server/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
    reset: vi.fn(),
  },
}));

describe("Header RSC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render sign in and signup links when user is guest", async () => {
    (vi.mocked(auth) as any).mockResolvedValue(null);

    const jsx = await Header();
    render(jsx);

    expect(screen.getByText("Войти")).toBeInTheDocument();
    expect(screen.getByText("Регистрация")).toBeInTheDocument();
    expect(screen.queryByText("Профиль")).not.toBeInTheDocument();
    expect(screen.queryByText("Админка")).not.toBeInTheDocument();
  });

  it("should render profile link and SignOutButton when user is student", async () => {
    (vi.mocked(auth) as any).mockResolvedValue({
      user: { id: "user-123", role: "student" },
      expires: "",
    });

    const jsx = await Header();
    render(jsx);

    expect(screen.getByText("Профиль")).toBeInTheDocument();
    expect(screen.getByText("Выход")).toBeInTheDocument();
    expect(screen.queryByText("Войти")).not.toBeInTheDocument();
    expect(screen.queryByText("Админка")).not.toBeInTheDocument();
  });

  it("should render admin link when user is admin", async () => {
    (vi.mocked(auth) as any).mockResolvedValue({
      user: { id: "admin-123", role: "admin" },
      expires: "",
    });

    const jsx = await Header();
    render(jsx);

    expect(screen.getByText("Админка")).toBeInTheDocument();
    expect(screen.getByText("Профиль")).toBeInTheDocument();
    expect(screen.getByText("Выход")).toBeInTheDocument();
  });

  it("should render profile but NOT admin link when user is teacher", async () => {
    (vi.mocked(auth) as any).mockResolvedValue({
      user: { id: "teacher-123", role: "teacher" },
      expires: "",
    });

    const jsx = await Header();
    render(jsx);

    expect(screen.getByText("Профиль")).toBeInTheDocument();
    expect(screen.getByText("Выход")).toBeInTheDocument();
    expect(screen.queryByText("Админка")).not.toBeInTheDocument();
  });
});
