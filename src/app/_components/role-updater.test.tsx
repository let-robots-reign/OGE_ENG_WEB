/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { RoleUpdater } from "./role-updater";
import { useSession } from "next-auth/react";
import { updateRole } from "./actions";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("./actions", () => ({
  updateRole: vi.fn(),
}));

describe("RoleUpdater Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("should trigger role update and update session if role in sessionStorage", async () => {
    const mockUpdate = vi.fn();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "u1" } }, // no role
      update: mockUpdate,
    } as any);

    sessionStorage.setItem("selectedRole", "student");
    vi.mocked(updateRole).mockResolvedValue({ success: true });

    render(<RoleUpdater />);

    await waitFor(() => {
      expect(updateRole).toHaveBeenCalledWith("student");
      expect(mockUpdate).toHaveBeenCalled();
      expect(sessionStorage.getItem("selectedRole")).toBeNull();
    });
  });

  it("should do nothing if role is already set in session", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "u1", role: "teacher" } },
      update: vi.fn(),
    } as any);

    sessionStorage.setItem("selectedRole", "student");
    render(<RoleUpdater />);

    expect(updateRole).not.toHaveBeenCalled();
  });

  it("should keep selectedRole in sessionStorage and NOT update session if updateRole fails", async () => {
    const mockUpdate = vi.fn();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "u1" } },
      update: mockUpdate,
    } as any);

    sessionStorage.setItem("selectedRole", "teacher");
    vi.mocked(updateRole).mockResolvedValue({ success: false });

    render(<RoleUpdater />);

    await waitFor(() => {
      expect(updateRole).toHaveBeenCalledWith("teacher");
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(sessionStorage.getItem("selectedRole")).toBe("teacher");
    });
  });

  it("should do nothing if selectedRole is not present in sessionStorage", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "u1" } },
      update: vi.fn(),
    } as any);

    render(<RoleUpdater />);

    expect(updateRole).not.toHaveBeenCalled();
  });
});
