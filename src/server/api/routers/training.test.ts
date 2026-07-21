/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { vi } from "vitest";

vi.mock("@/server/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    query: {
      trainingTopics: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      uoeTasks: {
        findMany: vi.fn(),
      },
    },
  },
  trainingTopics: {
    id: "training_topics_id",
    category: "training_topics_category",
  },
  userResults: {
    userId: "user_results_user_id",
    activityId: "user_results_activity_id",
    activityType: "user_results_activity_type",
  },
  activityTypeEnum: {
    enumValues: ["training", "diagnostic"],
  },
}));

import { describe, it, expect, beforeEach } from "vitest";
import { trainingRouter } from "./training";
import { createCallerFactory } from "@/server/api/trpc";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";

const createCaller = createCallerFactory(trainingRouter);

describe("Training Router tRPC Procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTopicsByCategory", () => {
    it("should return topics without progress if user is not logged in", async () => {
      const mockTopics = [
        { id: 1, title: "Topic 1", category: "uoe" },
        { id: 2, title: "Topic 2", category: "uoe" },
      ];
      vi.mocked(db.query.trainingTopics.findMany).mockResolvedValue(
        mockTopics as any,
      );

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.getTopicsByCategory({ category: "uoe" });
      expect(res).toHaveLength(2);
      expect(res[0]).toEqual({
        id: 1,
        title: "Topic 1",
        category: "uoe",
        progress: null,
        score: null,
      });
    });

    it("should return topics with default empty progress if logged-in user has no activity", async () => {
      const mockTopics = [{ id: 1, title: "Topic 1", category: "uoe" }];
      vi.mocked(db.query.trainingTopics.findMany).mockResolvedValue(
        mockTopics as any,
      );

      const mockWhere = vi.fn().mockResolvedValue([]);
      const mockFrom = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.getTopicsByCategory({
        category: "use-of-english",
      });
      expect(res).toHaveLength(1);
      expect(res[0]!.progress).toBeNull();
    });

    it("should calculate average score for use-of-english topics when user has results", async () => {
      const mockTopics = [
        { id: 10, title: "Passive Voice", category: "use-of-english" },
      ];
      vi.mocked(db.query.trainingTopics.findMany).mockResolvedValue(
        mockTopics as any,
      );

      const mockResults = [
        { activityId: 10, result: "4/5" },
        { activityId: 10, result: "3/5" },
      ];
      const mockWhere = vi.fn().mockResolvedValue(mockResults);
      const mockFrom = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.getTopicsByCategory({
        category: "use-of-english",
      });
      expect(res).toHaveLength(1);
      expect(res[0]!.score).toBe(3.5); // (4+3)/2 = 3.5
    });
  });

  describe("getUoeTraining", () => {
    it("should load tasks list for uoe topic", async () => {
      const mockTasks = [
        {
          id: 10,
          task: "Task A",
          origin: "original",
          topicId: 1,
          isDeleted: false,
        },
        {
          id: 11,
          task: "Task B",
          origin: "original",
          topicId: 1,
          isDeleted: false,
        },
      ];

      const mockLimit = vi.fn().mockResolvedValue(mockTasks);
      const mockOrderBy = vi.fn(() => ({ limit: mockLimit }));
      const mockWhere = vi.fn(() => ({ orderBy: mockOrderBy }));
      const mockFrom = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      vi.mocked(db.query.trainingTopics.findFirst).mockResolvedValue({
        title: "Mock Topic Title",
      } as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.getUoeTraining({ topicId: 1 });
      expect(res.topicTitle).toBe("Mock Topic Title");
      expect(res.tasks).toHaveLength(2);
      expect(res.tasks[0]!.id).toBe(10);
    });

    it("should throw NOT_FOUND TRPCError if topic is missing in DB", async () => {
      vi.mocked(db.query.trainingTopics.findFirst).mockResolvedValue(
        null as any,
      );

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      await expect(caller.getUoeTraining({ topicId: 999 })).rejects.toThrow(
        new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found.",
        }),
      );
    });
  });

  describe("logResult", () => {
    it("should record training user activity to DB", async () => {
      const mockInsertValues = vi.fn().mockResolvedValue([{ success: true }]);
      vi.mocked(db.insert).mockReturnValue({
        values: mockInsertValues,
      } as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      await caller.logResult({
        activityId: 1,
        activityType: "training",
        result: "4/5",
      });

      expect(db.insert).toHaveBeenCalled();
    });

    it("should throw UNAUTHORIZED if trying to log result without session", async () => {
      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      await expect(
        caller.logResult({
          activityId: 1,
          activityType: "training",
          result: "4/5",
        }),
      ).rejects.toThrow(
        new TRPCError({
          code: "UNAUTHORIZED",
        }),
      );
    });
  });
});
