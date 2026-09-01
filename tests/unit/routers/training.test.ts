/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method */
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
      uoeTaskChains: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      audioTasks: {
        findFirst: vi.fn(),
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
import { trainingRouter } from "@/server/api/routers/training";
import { createCallerFactory } from "@/server/api/trpc";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";

const createCaller = createCallerFactory(trainingRouter);

describe("Training Router tRPC Procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getExamSection", () => {
    const mockTaskSelections = (tasks: any[]) => {
      let callIndex = 0;
      vi.mocked(db.select).mockImplementation(
        () =>
          ({
            from: () => ({
              where: () => ({
                orderBy: () => ({
                  limit: () => Promise.resolve([tasks[callIndex++]]),
                }),
              }),
            }),
          }) as any,
      );
    };

    it("orders audio topics as tasks 1–4, 5, then 6–11", async () => {
      vi.mocked(db.query.trainingTopics.findMany).mockResolvedValue([
        { id: 3, title: "Задания 6-11", category: "audio", isActive: true },
        { id: 1, title: "Задания 1-4", category: "audio", isActive: true },
        { id: 2, title: "Задание 5", category: "audio", isActive: true },
      ] as any);
      mockTaskSelections(
        [1, 2, 3].map((id) => ({
          id,
          topicId: id,
          taskType: "multiple_choice",
          audioUrl: `/audio/${id}.mp3`,
          questions: [],
          total: 1,
        })),
      );

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });
      const result = await caller.getExamSection({ category: "audio" });

      expect(result.steps.map((step) => step.topicTitle)).toEqual([
        "Задания 1-4",
        "Задание 5",
        "Задания 6-11",
      ]);
    });

    it("orders reading topics as task 12, then tasks 13–19", async () => {
      vi.mocked(db.query.trainingTopics.findMany).mockResolvedValue([
        {
          id: 5,
          title: "Задания 13-19",
          category: "reading",
          isActive: true,
        },
        { id: 4, title: "Задание 12", category: "reading", isActive: true },
      ] as any);
      mockTaskSelections(
        [4, 5].map((id) => ({
          id,
          topicId: id,
          taskType: "matching",
          texts: [],
          headings: [],
          total: 1,
        })),
      );

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });
      const result = await caller.getExamSection({ category: "reading" });

      expect(result.steps.map((step) => step.topicTitle)).toEqual([
        "Задание 12",
        "Задания 13-19",
      ]);
    });
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

    it("returns one complete UoE chain in stored order without answers", async () => {
      vi.mocked(db.query.trainingTopics.findFirst).mockResolvedValue({
        id: 7,
        title: "По всем темам",
      } as any);
      const items = Array.from({ length: 9 }, (_, index) => ({
        id: index + 1,
        chainId: 55,
        taskId: 100 + index,
        position: index + 1,
        task: {
          id: 100 + index,
          task: `Sentence ${index + 1}`,
          origin: "WORD",
          answer: "ANSWER",
          topicId: 20,
          isDeleted: false,
          topic: {
            id: 20,
            title: "Grammar",
            category: "use-of-english",
            isActive: true,
          },
        },
      }));
      vi.mocked(db.query.uoeTaskChains.findMany).mockResolvedValue([
        { id: 55, isDeleted: false, items },
      ] as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });
      const result = await caller.getUoeTraining({
        topicId: 7,
        batchSize: 1,
      });

      expect(result.chainId).toBe(55);
      expect(result.tasks).toHaveLength(9);
      expect(result.tasks.map((task) => task.id)).toEqual(
        items.map((item) => item.taskId),
      );
      expect(result.tasks[0]).not.toHaveProperty("answer");
    });

    it("returns a chain for the word-formation topic", async () => {
      vi.mocked(db.query.trainingTopics.findFirst).mockResolvedValue({
        id: 8,
        title: "Словообразование",
      } as any);
      const items = Array.from({ length: 9 }, (_, index) => ({
        id: index + 1,
        chainId: 56,
        taskId: 200 + index,
        position: index + 1,
        task: {
          id: 200 + index,
          task: `Word formation sentence ${index + 1}`,
          origin: "WORD",
          answer: "ANSWER",
          topicId: 8,
          isDeleted: false,
          topic: {
            id: 8,
            title: "Словообразование",
            category: "use-of-english",
            isActive: true,
          },
        },
      }));
      vi.mocked(db.query.uoeTaskChains.findMany).mockResolvedValue([
        { id: 56, topicId: 8, isDeleted: false, items },
      ] as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });
      const result = await caller.getUoeTraining({ topicId: 8 });

      expect(result.chainId).toBe(56);
      expect(result.topicTitle).toBe("Словообразование");
      expect(result.tasks.map((task) => task.id)).toEqual(
        items.map((item) => item.taskId),
      );
      expect(db.select).not.toHaveBeenCalled();
    });

    it("does not fall back to random tasks when no UoE chain exists", async () => {
      vi.mocked(db.query.trainingTopics.findFirst).mockResolvedValue({
        id: 7,
        title: "По всем темам",
      } as any);
      vi.mocked(db.query.uoeTaskChains.findMany).mockResolvedValue([] as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      await expect(caller.getUoeTraining({ topicId: 7 })).rejects.toMatchObject(
        { code: "NOT_FOUND", message: "Пока нет доступных цепочек заданий" },
      );
      expect(db.select).not.toHaveBeenCalled();
    });
  });

  describe("checkUoeTraining chain validation", () => {
    it("rejects answer IDs that do not match the selected chain", async () => {
      vi.mocked(db.query.uoeTaskChains.findFirst).mockResolvedValue({
        id: 55,
        isDeleted: false,
        items: Array.from({ length: 9 }, (_, index) => ({
          taskId: 100 + index,
        })),
      } as any);
      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      await expect(
        caller.checkUoeTraining({
          chainId: 55,
          answers: Array.from({ length: 9 }, (_, index) => ({
            id: 200 + index,
            answer: "ANSWER",
          })),
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(db.query.uoeTasks.findMany).not.toHaveBeenCalled();
    });
  });

  describe("submitAnswers", () => {
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

      await caller.submitAnswers({
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
        caller.submitAnswers({
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

  describe("checkListeningTraining", () => {
    it("should check gap_fill listening task correctly with string answers normalization", async () => {
      vi.mocked(db.query.audioTasks.findFirst).mockResolvedValue({
        id: 50,
        taskType: "gap_fill",
        answers: ["FIFTEEN", "MAY", "SWIMMING"],
        explanations: [{ text: "Exp 1" }, { text: "Exp 2" }, { text: "Exp 3" }],
      } as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.checkListeningTraining({
        id: 50,
        answers: ["  fifteen  ", "may", "FOOTBALL"],
      });

      expect(res.total).toBe(3);
      expect(res.correctCount).toBe(2);
      expect(res.results).toEqual([true, true, false]);
    });

    it("should check gap_fill correctly when answers are provided as array of variants string[][]", async () => {
      vi.mocked(db.query.audioTasks.findFirst).mockResolvedValue({
        id: 55,
        taskType: "gap_fill",
        answers: [["FIFTEEN", "15"], ["MAY"], ["MATHS", "MATH"]],
        explanations: [],
      } as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.checkListeningTraining({
        id: 55,
        answers: ["15", "may", "math"],
      });

      expect(res.total).toBe(3);
      expect(res.correctCount).toBe(3);
      expect(res.results).toEqual([true, true, true]);
    });

    it("should return 0 correct count when all user answers are null or empty strings", async () => {
      vi.mocked(db.query.audioTasks.findFirst).mockResolvedValue({
        id: 51,
        taskType: "gap_fill",
        answers: ["FIFTEEN", "MAY", "SWIMMING"],
        explanations: [],
      } as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.checkListeningTraining({
        id: 51,
        answers: [null, "", "   "],
      });

      expect(res.total).toBe(3);
      expect(res.correctCount).toBe(0);
      expect(res.results).toEqual([false, false, false]);
    });

    it("should check standard multiple_choice audio task correctly even when answers are sent as stringified numbers", async () => {
      vi.mocked(db.query.audioTasks.findFirst).mockResolvedValue({
        id: 52,
        taskType: "multiple_choice",
        answers: [1, 2, 3, 1],
        explanations: [{ text: "Exp" }],
      } as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.checkListeningTraining({
        id: 52,
        answers: ["1", "3", 3, null],
      });

      expect(res.total).toBe(4);
      expect(res.correctCount).toBe(2);
      expect(res.results).toEqual([true, false, true, false]);
    });

    it("should throw NOT_FOUND error when audio task does not exist", async () => {
      vi.mocked(db.query.audioTasks.findFirst).mockResolvedValue(null as any);

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      await expect(
        caller.checkListeningTraining({
          id: 999,
          answers: [1, 2],
        }),
      ).rejects.toThrow(
        new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found for checking.",
        }),
      );
    });
  });
});
