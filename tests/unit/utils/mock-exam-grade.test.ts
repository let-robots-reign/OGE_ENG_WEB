import { describe, expect, it } from "vitest";
import {
  getMockExamGradeBadgeClass,
  getMockExamGradeTextClass,
} from "@/app/_utils/mockExamGrade";

describe("mock exam grade colors", () => {
  it.each([
    [2, "text-err", "bg-err-soft text-err"],
    [3, "text-warn", "bg-warn-soft text-warn"],
    [4, "text-grade-4", "bg-grade-4-soft text-grade-4"],
    [5, "text-grade-5", "bg-grade-5-soft text-grade-5"],
  ] as const)(
    "maps grade %s to its text and badge colors",
    (grade, text, badge) => {
      expect(getMockExamGradeTextClass(grade)).toBe(text);
      expect(getMockExamGradeBadgeClass(grade)).toBe(badge);
    },
  );

  it("uses a neutral fallback for an absent or invalid grade", () => {
    expect(getMockExamGradeTextClass(null)).toBe("text-ink-3");
    expect(getMockExamGradeBadgeClass(1)).toBe("bg-surface-2 text-ink-3");
  });
});
