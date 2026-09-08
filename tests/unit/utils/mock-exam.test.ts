import { describe, expect, it } from "vitest";
import {
  getMockExamGrade,
  gradeMockExam,
  MOCK_EXAM_SLOT_ORDER,
  toStudentSnapshot,
} from "@/server/api/lib/mock-exams";
import type { MockExamSnapshot } from "@/server/db/schema";

const snapshot: MockExamSnapshot = {
  version: 1,
  mockExam: { id: 1, title: "Вариант 01", order: 1 },
  parts: [
    {
      slot: "audio_1_4",
      label: "Задания 1–4",
      kind: "audio",
      topicTitle: "Задания 1-4",
      resourceId: 10,
      taskType: "multiple_choice",
      total: 2,
      audioUrl: "/audio.mp3",
      questions: [
        { questionText: "One", options: ["A", "B"] },
        { questionText: "Two", options: ["A", "B"] },
      ],
      correctAnswers: [1, 2],
      explanations: [{ text: "First" }, { text: "Second" }],
    },
    ...MOCK_EXAM_SLOT_ORDER.slice(1).map((slot) => ({
      slot,
      label: slot,
      kind: slot.startsWith("reading")
        ? ("reading" as const)
        : slot.startsWith("uoe")
          ? ("uoe" as const)
          : ("audio" as const),
      topicTitle: slot,
      resourceId: 20,
      total: 0,
      ...(slot.startsWith("uoe") ? { tasks: [] } : { correctAnswers: [] }),
    })),
  ],
};

describe("mock exam grading", () => {
  it.each([
    [0, 2],
    [49, 2],
    [50, 3],
    [64, 3],
    [65, 4],
    [84, 4],
    [85, 5],
    [100, 5],
  ] as const)("maps %s%% to grade %s", (percentage, grade) => {
    expect(getMockExamGrade(percentage)).toBe(grade);
  });

  it("grades on the server and treats missing answers as incorrect", () => {
    const details = gradeMockExam(
      snapshot,
      MOCK_EXAM_SLOT_ORDER.map((slot) => ({
        slot,
        values: slot === "audio_1_4" ? [1, null] : [],
      })),
      { attemptKey: "attempt", timeSpent: 120, timedOut: false },
    );
    expect(details.correctCount).toBe(1);
    expect(details.total).toBe(2);
    expect(details.percentage).toBe(50);
    expect(details.grade).toBe(3);
    expect(details.parts[0]?.items[1]?.userAnswer).toBe("Нет ответа");
  });

  it("accepts slash-separated UOE answer variants", () => {
    const uoeSnapshot: MockExamSnapshot = {
      ...snapshot,
      parts: [
        {
          slot: "uoe_all_topics",
          label: "По всем темам",
          kind: "uoe",
          topicTitle: "По всем темам",
          resourceId: 30,
          total: 1,
          tasks: [
            {
              id: 31,
              task: "They ___ ready.",
              origin: "BE",
              answer: "WERE/WAS",
            },
          ],
        },
      ],
    };

    const details = gradeMockExam(
      uoeSnapshot,
      [{ slot: "uoe_all_topics", values: ["was"] }],
      { attemptKey: "attempt", timeSpent: 10, timedOut: false },
    );

    expect(details.correctCount).toBe(1);
    expect(details.parts[0]?.items[0]).toMatchObject({
      isCorrect: true,
      correctAnswer: "WERE/WAS",
    });
  });

  it("does not accept an empty UOE answer from a trailing slash", () => {
    const uoeSnapshot: MockExamSnapshot = {
      ...snapshot,
      parts: [
        {
          slot: "uoe_all_topics",
          label: "По всем темам",
          kind: "uoe",
          topicTitle: "По всем темам",
          resourceId: 30,
          total: 1,
          tasks: [
            {
              id: 31,
              task: "They ___ ready.",
              origin: "BE",
              answer: "WAS/",
            },
          ],
        },
      ],
    };

    const details = gradeMockExam(
      uoeSnapshot,
      [{ slot: "uoe_all_topics", values: [""] }],
      { attemptKey: "attempt", timeSpent: 10, timedOut: false },
    );

    expect(details.correctCount).toBe(0);
    expect(details.parts[0]?.items[0]?.isCorrect).toBe(false);
  });

  it("removes correct answers and explanations from the start payload", () => {
    const publicSnapshot = toStudentSnapshot(snapshot);
    const first = publicSnapshot.parts[0]!;
    expect(first).not.toHaveProperty("correctAnswers");
    expect(first).not.toHaveProperty("explanations");
  });
});
