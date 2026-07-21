/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */
import { vi } from "vitest";

vi.mock("@/server/db", () => ({
  db: {
    update: vi.fn(),
  },
}));

import { describe, it, expect, beforeEach } from "vitest";
import { updateRole } from "./actions";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

describe("updateRole Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail if user is not authenticated", async () => {
    (vi.mocked(auth) as any).mockResolvedValue(null);
    const res = await updateRole("student");
    expect(res).toEqual({ success: false });
  });

  it("should update role in DB and return success", async () => {
    (vi.mocked(auth) as any).mockResolvedValue({
      user: { id: "user-123" },
      expires: "",
    });

    const mockSet = vi.fn().mockReturnThis();
    const mockWhere = vi.fn().mockResolvedValue([{ success: true }]);
    vi.mocked(db.update).mockReturnValue({
      set: mockSet,
    } as any);
    mockSet.mockReturnValue({
      where: mockWhere,
    } as any);

    const res = await updateRole("teacher");
    expect(res).toEqual({ success: true });
    expect(db.update).toHaveBeenCalled();
  });

  it("should return success: false if database update throws an exception", async () => {
    (vi.mocked(auth) as any).mockResolvedValue({
      user: { id: "user-123" },
      expires: "",
    });

    vi.mocked(db.update).mockImplementation(() => {
      throw new Error("DB Connection Interrupted");
    });

    const res = await updateRole("student");
    expect(res).toEqual({ success: false });
  });
});
