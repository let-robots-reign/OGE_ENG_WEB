/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { vi } from "vitest";

vi.mock("@/server/db", () => ({
  db: {
    select: vi.fn(),
    selectDistinct: vi.fn(),
    update: vi.fn(),
    query: {
      users: {
        findFirst: vi.fn(),
      },
      userResults: {
        findMany: vi.fn(),
      },
      trainingTopics: {
        findMany: vi.fn(() => []),
      },
    },
  },
}));

import { describe, it, expect, beforeEach } from "vitest";
import { userRouter } from "./user";
import { createCallerFactory } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

const createCaller = createCallerFactory(userRouter);

describe("User Router tRPC Procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfileHeader", () => {
    it("should return DB user fields if user is found", async () => {
      const userMock = {
        name: "Test Name",
        email: "test@example.com",
        role: "student",
        telegramUsername: "tg",
        school: "School A",
        examPointsGoal: 35,
        notificationsWeekly: true,
        notificationsMarketing: false,
      };

      vi.mocked(db.query.users.findFirst).mockResolvedValue(userMock as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.getProfileHeader();
      expect(res).toEqual(userMock);
      expect(db.query.users.findFirst).toHaveBeenCalled();
    });

    it("should return fallback data if DB user is not found", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);

      const caller = createCaller({
        db: db as any,
        session: {
          user: {
            id: "user-1",
            name: "Session Name",
            email: "session@example.com",
            role: "student",
          },
          expires: "",
        },
        headers: new Headers(),
      });

      const res = await caller.getProfileHeader();
      expect(res.name).toBe("Session Name");
      expect(res.email).toBe("session@example.com");
    });
  });

  describe("updateProfile", () => {
    it("should throw CONFLICT if another user has the same email", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: "user-2",
      } as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      await expect(
        caller.updateProfile({
          name: "New Name",
          email: "conflict@example.com",
          telegramUsername: null,
          school: null,
          examPointsGoal: 30,
          notificationsWeekly: true,
          notificationsMarketing: false,
        }),
      ).rejects.toThrow(
        new TRPCError({
          code: "CONFLICT",
          message: "Этот e-mail уже используется.",
        }),
      );
    });

    it("should perform db update if email is safe", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);

      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue([{ success: true }]);
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);
      mockSet.mockReturnValue({ where: mockWhere } as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.updateProfile({
        name: "New Name",
        email: "safe@example.com",
        telegramUsername: "tg",
        school: "123",
        examPointsGoal: 35,
        notificationsWeekly: true,
        notificationsMarketing: false,
      });

      expect(res).toEqual({ success: true });
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw UNAUTHORIZED if not logged in", async () => {
      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      await expect(
        caller.updateProfile({
          name: "New Name",
          email: "safe@example.com",
          telegramUsername: "tg",
          school: "123",
          examPointsGoal: 35,
          notificationsWeekly: true,
          notificationsMarketing: false,
        }),
      ).rejects.toThrow(
        new TRPCError({
          code: "UNAUTHORIZED",
        }),
      );
    });
  });

  describe("getStreak & getActivity", () => {
    it("should calculate correct active streak math", async () => {
      const mockWhereDistinct = vi
        .fn()
        .mockResolvedValue([
          { day: "2026-06-30" },
          { day: "2026-06-29" },
          { day: "2026-06-28" },
        ]);
      vi.mocked(db.selectDistinct).mockReturnValue({
        from: vi.fn(() => ({
          where: mockWhereDistinct,
        })),
      } as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      // Use Vitest fake timers to mock date securely
      vi.useFakeTimers({
        toFake: ["Date"],
      });
      vi.setSystemTime(new Date("2026-06-30T12:00:00Z"));

      try {
        const res = await caller.getStreak({ timeZone: "Europe/Moscow" });
        expect(res.count).toBe(3);
        expect(res.isActiveToday).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it("should map Asia/Saigon to Asia/Ho_Chi_Minh and succeed", async () => {
      const mockWhereDistinct = vi.fn().mockResolvedValue([]);
      vi.mocked(db.selectDistinct).mockReturnValue({
        from: vi.fn(() => ({
          where: mockWhereDistinct,
        })),
      } as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      await caller.getStreak({ timeZone: "Asia/Saigon" });
      expect(db.selectDistinct).toHaveBeenCalled();
    });

    it("should fallback to Europe/Moscow if db query fails due to timezone", async () => {
      const mockWhereDistinct = vi
        .fn()
        .mockRejectedValueOnce(
          new Error('PostgresError: time zone "Invalid/TZ" not recognized'),
        )
        .mockResolvedValueOnce([{ day: "2026-06-30" }]);
      vi.mocked(db.selectDistinct).mockReturnValue({
        from: vi.fn(() => ({
          where: mockWhereDistinct,
        })),
      } as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-06-30T12:00:00Z"));

      try {
        const res = await caller.getStreak({ timeZone: "Invalid/TZ" });
        expect(res.count).toBe(1);
        expect(res.isActiveToday).toBe(true);
        expect(mockWhereDistinct).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it("should throw UNAUTHORIZED if trying to fetch streak without session", async () => {
      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      await expect(
        caller.getStreak({ timeZone: "Europe/Moscow" }),
      ).rejects.toThrow(
        new TRPCError({
          code: "UNAUTHORIZED",
        }),
      );
    });
  });
});
