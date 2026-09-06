import { describe, it, expect } from "vitest";
import {
  computeBestStreak,
  computeCurrentStreak,
  parseResult,
} from "@/server/api/lib/progress";

describe("progress helpers (extracted from userRouter)", () => {
  describe("parseResult", () => {
    it("parses a well-formed correct/total string", () => {
      expect(parseResult("6/9")).toEqual({ correct: 6, total: 9 });
      expect(parseResult("  10 / 12 ")).toEqual({ correct: 10, total: 12 });
    });

    it("rejects malformed / zero-total strings", () => {
      expect(parseResult("")).toBeNull();
      expect(parseResult("abc")).toBeNull();
      expect(parseResult("5/0")).toBeNull();
      expect(parseResult("5")).toBeNull();
    });
  });

  describe("computeCurrentStreak", () => {
    it("counts consecutive days anchored at today", () => {
      const days = ["2026-09-05", "2026-09-04", "2026-09-03"];
      expect(computeCurrentStreak(days, "2026-09-05")).toEqual({
        count: 3,
        isActiveToday: true,
      });
    });

    it("anchors at yesterday when today is missing", () => {
      const days = ["2026-09-04", "2026-09-03"];
      expect(computeCurrentStreak(days, "2026-09-05")).toEqual({
        count: 2,
        isActiveToday: false,
      });
    });

    it("returns zero when the latest day is older than yesterday", () => {
      const days = ["2026-09-01"];
      expect(computeCurrentStreak(days, "2026-09-05")).toEqual({
        count: 0,
        isActiveToday: false,
      });
    });

    it("stops at the first gap", () => {
      const days = ["2026-09-05", "2026-09-04", "2026-09-02"];
      expect(computeCurrentStreak(days, "2026-09-05").count).toBe(2);
    });

    it("handles no activity", () => {
      expect(computeCurrentStreak([], "2026-09-05")).toEqual({
        count: 0,
        isActiveToday: false,
      });
    });
  });

  describe("computeBestStreak", () => {
    it("finds the longest consecutive run across ascending days", () => {
      const days = [
        "2026-08-01",
        "2026-08-02",
        "2026-08-03", // run of 3
        "2026-08-10",
        "2026-08-11", // run of 2
      ];
      expect(computeBestStreak(days)).toBe(3);
    });

    it("returns 0 for no days and 1 for a single day", () => {
      expect(computeBestStreak([])).toBe(0);
      expect(computeBestStreak(["2026-08-01"])).toBe(1);
    });
  });
});
