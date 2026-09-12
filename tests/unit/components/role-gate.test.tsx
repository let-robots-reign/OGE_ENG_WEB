/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { RoleGate } from "@/app/_components/role-gate";
import { updateRole } from "@/app/_components/actions";

const mockRefresh = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
  usePathname: () => mockPathname,
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("@/app/_components/actions", () => ({
  updateRole: vi.fn(),
}));

const mockSession = (user: Record<string, unknown> | null) => {
  const update = vi.fn();
  vi.mocked(useSession).mockReturnValue({
    data: user ? { user } : null,
    update,
  } as any);
  return update;
};

describe("RoleGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
  });

  it("renders nothing for guests", () => {
    mockSession(null);
    render(<RoleGate />);
    expect(screen.queryByText("Кто вы?")).toBeNull();
  });

  it("renders nothing when the role is already set", () => {
    mockSession({ id: "u1", role: "student" });
    render(<RoleGate />);
    expect(screen.queryByText("Кто вы?")).toBeNull();
  });

  it("renders nothing on auth pages", () => {
    mockPathname = "/auth/signin";
    mockSession({ id: "u1", role: null });
    render(<RoleGate />);
    expect(screen.queryByText("Кто вы?")).toBeNull();
  });

  it("saves the chosen role and refreshes the session", async () => {
    const update = mockSession({ id: "u1", role: null });
    vi.mocked(updateRole).mockResolvedValue({ success: true });

    render(<RoleGate />);
    fireEvent.click(screen.getByRole("button", { name: /Я учитель/ }));

    await waitFor(() => {
      expect(updateRole).toHaveBeenCalledWith("teacher");
      expect(update).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows an error and keeps the session when saving fails", async () => {
    const update = mockSession({ id: "u1", role: null });
    vi.mocked(updateRole).mockResolvedValue({ success: false });

    render(<RoleGate />);
    fireEvent.click(screen.getByRole("button", { name: /Я ученик/ }));

    expect(
      await screen.findByText("Не удалось сохранить роль. Попробуйте ещё раз."),
    ).toBeTruthy();
    expect(updateRole).toHaveBeenCalledWith("student");
    expect(update).not.toHaveBeenCalled();
  });
});
