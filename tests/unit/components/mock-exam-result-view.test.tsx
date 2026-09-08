import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MockExamResultView } from "@/app/_components/mock-exams/mock-exam-result-view";
import type { MockExamResultDetails } from "@/server/db/schema";

const details: MockExamResultDetails = {
  version: 1,
  attemptKey: "attempt-1",
  mockExam: { id: 1, title: "Вариант 1" },
  correctCount: 1,
  total: 2,
  percentage: 50,
  grade: 3,
  timeSpent: 3600,
  timedOut: false,
  parts: [
    {
      slot: "audio_1_4",
      label: "Задания 1–4",
      kind: "audio",
      resourceId: 10,
      correctCount: 1,
      total: 2,
      items: [
        {
          label: "1",
          title: "Question one",
          userAnswer: "A",
          correctAnswer: "A",
          isCorrect: true,
          explanation: "Read the key phrase here",
          highlightedText: "key phrase",
        },
        {
          label: "2",
          title: "Question two",
          userAnswer: "Нет ответа",
          correctAnswer: "B",
          isCorrect: false,
        },
      ],
    },
  ],
};

describe("MockExamResultView", () => {
  it("renders the stable score, grade, answers and highlighted explanation", () => {
    render(<MockExamResultView details={details} />);

    expect(screen.getByText("Оценка 3")).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
    expect(screen.getByText("Нет ответа")).toBeInTheDocument();
    expect(screen.getAllByText("Правильный:")).toHaveLength(2);
    expect(screen.getByText("key phrase").tagName).toBe("STRONG");
  });
});
