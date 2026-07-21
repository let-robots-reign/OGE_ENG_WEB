/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminView } from "./admin-view";
import { api } from "@/trpc/react";

const mockGet = vi.fn();
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: mockGet,
  })),
  useRouter: vi.fn(() => ({
    push: mockPush,
    refresh: vi.fn(),
  })),
}));

// Mock tRPC API
vi.mock("@/trpc/react", () => ({
  api: {
    admin: {
      getTrainingResults: {
        useQuery: vi.fn(),
      },
      getDiagnosticsResults: {
        useQuery: vi.fn(),
      },
    },
  },
}));

describe("AdminView Components Panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue("training");

    // Mock both methods by default to prevent undefined destructuring crashes
    vi.mocked(api.admin.getTrainingResults.useQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(api.admin.getDiagnosticsResults.useQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
  });

  it("should show loader initially when querying training results", () => {
    vi.mocked(api.admin.getTrainingResults.useQuery).mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    render(<AdminView />);
    expect(screen.getByText("Загрузка данных...")).toBeInTheDocument();
  });

  it("should support tab switching and load diagnostics data", () => {
    const mockDiagnostics = [
      {
        id: 1,
        score: 90,
        createdAt: new Date("2026-06-20T10:00:00Z"),
        user: { name: "User Diagnostic", email: "diag@test.com" },
      },
    ];

    vi.mocked(api.admin.getDiagnosticsResults.useQuery).mockReturnValue({
      data: mockDiagnostics,
      isLoading: false,
    } as any);

    mockGet.mockReturnValue("diagnostics");

    render(<AdminView />);

    expect(screen.getByText("User Diagnostic")).toBeInTheDocument();

    // Verify viewer link is rendered correctly
    const link = screen.getByRole("link", { name: "Просмотреть →" });
    expect(link).toHaveAttribute("href", "/admin/diagnostics/1");
  });

  it("should render empty state message when there are no training logs", () => {
    render(<AdminView />);
    expect(
      screen.getByText("Пока нет результатов тренировок."),
    ).toBeInTheDocument();
  });

  it("should render empty state message when there are no diagnostics logs on diagnostics tab", () => {
    mockGet.mockReturnValue("diagnostics");

    render(<AdminView />);

    expect(
      screen.getByText("Пока нет результатов диагностик."),
    ).toBeInTheDocument();
  });
});
