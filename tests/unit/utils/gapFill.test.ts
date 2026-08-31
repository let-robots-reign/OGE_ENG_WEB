import { describe, it, expect } from "vitest";
import {
  formatGapFillAnswer,
  isGapFillAnswerCorrect,
  normalizeGapFillAnswer,
} from "@/app/_utils/gapFill";

describe("gap-fill answer matching", () => {
  describe("normalizeGapFillAnswer", () => {
    it("should trim, upper-case and coerce to string", () => {
      expect(normalizeGapFillAnswer("  fifteen ")).toBe("FIFTEEN");
      expect(normalizeGapFillAnswer(15)).toBe("15");
    });

    it("should turn nullish input into an empty string", () => {
      expect(normalizeGapFillAnswer(null)).toBe("");
      expect(normalizeGapFillAnswer(undefined)).toBe("");
    });
  });

  describe("isGapFillAnswerCorrect", () => {
    it("should match case- and whitespace-insensitively", () => {
      expect(isGapFillAnswerCorrect("  may ", "MAY")).toBe(true);
      expect(isGapFillAnswerCorrect("football", "SWIMMING")).toBe(false);
    });

    it("should accept any of several answer variants", () => {
      expect(isGapFillAnswerCorrect("15", ["FIFTEEN", "15"])).toBe(true);
      expect(isGapFillAnswerCorrect("math", ["MATHS", "MATH"])).toBe(true);
      expect(isGapFillAnswerCorrect("twenty", ["FIFTEEN", "15"])).toBe(false);
    });

    it("should never count an empty answer as correct", () => {
      expect(isGapFillAnswerCorrect(null, "MAY")).toBe(false);
      expect(isGapFillAnswerCorrect("   ", "MAY")).toBe(false);
      // Even when the expected answer is itself missing.
      expect(isGapFillAnswerCorrect("", undefined)).toBe(false);
    });
  });

  describe("formatGapFillAnswer", () => {
    it("should join variants for display", () => {
      expect(formatGapFillAnswer(["FIFTEEN", "15"])).toBe("FIFTEEN / 15");
      expect(formatGapFillAnswer("MAY")).toBe("MAY");
      expect(formatGapFillAnswer(undefined)).toBe("");
    });
  });
});
