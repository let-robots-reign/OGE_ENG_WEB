/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockExamsRouter } from "@/server/api/routers/mock-exams";
import { createCallerFactory } from "@/server/api/trpc";
import type { MockExamResultDetails } from "@/server/db/schema";

const createCaller = createCallerFactory(mockExamsRouter);
const findFirst = vi.fn();

const details: MockExamResultDetails = {
  version: 1,
  attemptKey: "11111111-1111-4111-8111-111111111111",
  mockExam: { id: 3, title: "Вариант 3" },
  correctCount: 40,
  total: 47,
  percentage: 85,
  grade: 5,
  timeSpent: 3600,
  timedOut: false,
  parts: [],
};

const savedResult = {
  id: 17,
  userId: "student-owner",
  activityType: "mock_exam",
  activityId: 3,
  result: "40/47",
  createdAt: new Date("2026-09-04T10:00:00Z"),
  details,
};

function callerFor(user?: { id: string; role: "student" | "admin" }) {
  return createCaller({
    db: {
      query: {
        userResults: { findFirst },
      },
    } as any,
    session: user ? { user, expires: "" } : null,
    headers: new Headers(),
  });
}

describe("mock exams result access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findFirst.mockResolvedValue(savedResult);
  });

  it("rejects an unauthenticated request", async () => {
    await expect(callerFor().getResult({ id: 17 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("does not let a student read another student's result", async () => {
    await expect(
      callerFor({ id: "student-other", role: "student" }).getResult({ id: 17 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("lets a student read their own result", async () => {
    const result = await callerFor({
      id: "student-owner",
      role: "student",
    }).getResult({ id: 17 });

    expect(result).toEqual({
      id: 17,
      createdAt: savedResult.createdAt,
      details,
    });
  });

  it("lets an admin read another user's result", async () => {
    const result = await callerFor({ id: "admin", role: "admin" }).getResult({
      id: 17,
    });

    expect(result?.id).toBe(17);
  });
});
