/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { vi } from "vitest";

vi.mock("@/server/db", () => ({
  db: {
    select: vi.fn(),
    query: {
      userResults: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      trainingTopics: {
        findMany: vi.fn(),
      },
    },
  },
  userResults: {
    id: "user_results_id",
    userId: "user_results_user_id",
    activityType: "user_results_activity_type",
  },
  users: {
    id: "users_id",
  },
}));

import { describe, it, expect, beforeEach } from "vitest";
import { adminRouter } from "./admin";
import { createCallerFactory } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

const createCaller = createCallerFactory(adminRouter);

describe("Admin Router tRPC Procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTrainingResults", () => {
    it("should throw UNAUTHORIZED if not logged in", async () => {
      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      await expect(caller.getTrainingResults()).rejects.toThrow(
        new TRPCError({
          code: "UNAUTHORIZED",
        }),
      );
    });

    it("should throw FORBIDDEN if not an admin", async () => {
      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      await expect(caller.getTrainingResults()).rejects.toThrow(
        new TRPCError({
          code: "FORBIDDEN",
        }),
      );
    });

    it("should return lists of training logs if user is admin", async () => {
      const mockResult = [
        {
          id: 1,
          score: 80,
          activityId: 10,
          user: { name: "Ivan", email: "ivan@example.com" },
        },
      ];
      vi.mocked(db.query.userResults.findMany).mockResolvedValue(
        mockResult as any,
      );
      vi.mocked(db.query.trainingTopics.findMany).mockResolvedValue([
        { id: 10, title: "Topic A" },
      ] as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "admin-1", role: "admin" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.getTrainingResults();
      expect(res).toHaveLength(1);
      expect(res[0]!.user.name).toBe("Ivan");
      expect(res[0]!.topic?.title).toBe("Topic A");
    });
  });

  describe("getDiagnosticsResults", () => {
    it("should return list of diagnostics results for admin", async () => {
      const mockResult = [
        {
          id: 1,
          score: 90,
          details: { feedback: "Well done", userAnswers: [] },
          createdAt: new Date(),
          user: { name: "Masha", email: "masha@example.com" },
        },
      ];
      vi.mocked(db.query.userResults.findMany).mockResolvedValue(
        mockResult as any,
      );

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "admin-1", role: "admin" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.getDiagnosticsResults();
      expect(res).toHaveLength(1);
      expect(res[0]!.user.name).toBe("Masha");
      expect(res[0]!.details.feedback).toBe("Well done");
    });
  });

  describe("getResultById", () => {
    it("should return single result record with parsed details", async () => {
      const mockLog = {
        id: 1,
        details: { feedback: "Excellent", userAnswers: ["a", "b"] },
      };
      vi.mocked(db.query.userResults.findFirst).mockResolvedValue(
        mockLog as any,
      );

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "admin-1", role: "admin" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.getResultById({ id: 1 });
      expect(res).toEqual({
        id: 1,
        details: { feedback: "Excellent", userAnswers: ["a", "b"] },
      });
    });

    it("should return null if result record is missing in DB", async () => {
      vi.mocked(db.query.userResults.findFirst).mockResolvedValue(null as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "admin-1", role: "admin" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.getResultById({ id: 999 });
      expect(res).toBeNull();
    });
  });
});
