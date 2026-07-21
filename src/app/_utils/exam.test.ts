import { describe, it, expect } from "vitest";
import { getExamName, getExamCountdownText } from "./exam";
import { pluralizeDays } from "@/app/_utils/pluralize";

describe("exam utils", () => {
  describe("getExamName", () => {
    it("should return current year before August 1st", () => {
      const date = new Date("2026-05-15T00:00:00Z");
      expect(getExamName(date)).toBe("ОГЭ 2026");
    });

    it("should return next year on or after August 1st", () => {
      const date = new Date("2026-08-01T00:00:00Z");
      expect(getExamName(date)).toBe("ОГЭ 2027");
    });
  });

  describe("pluralizeDays", () => {
    it("should return 'день' for numbers ending in 1 but not 11", () => {
      expect(pluralizeDays(1)).toBe("день");
      expect(pluralizeDays(21)).toBe("день");
      expect(pluralizeDays(101)).toBe("день");
    });

    it("should return 'дня' for numbers ending in 2, 3, 4 but not 12, 13, 14", () => {
      expect(pluralizeDays(2)).toBe("дня");
      expect(pluralizeDays(3)).toBe("дня");
      expect(pluralizeDays(4)).toBe("дня");
      expect(pluralizeDays(24)).toBe("дня");
    });

    it("should return 'дней' for 11-14 and numbers ending in 5-9, 0", () => {
      expect(pluralizeDays(11)).toBe("дней");
      expect(pluralizeDays(12)).toBe("дней");
      expect(pluralizeDays(13)).toBe("дней");
      expect(pluralizeDays(14)).toBe("дней");
      expect(pluralizeDays(5)).toBe("дней");
      expect(pluralizeDays(10)).toBe("дней");
      expect(pluralizeDays(20)).toBe("дней");
    });

    it("should return 'дней' for 0 or negative numbers", () => {
      expect(pluralizeDays(0)).toBe("дней");
      expect(pluralizeDays(-1)).toBe("дней");
    });
  });

  describe("getExamCountdownText", () => {
    it("should return 'экзамен прошел 06.06.2026' between exam date and August 1st, 2026", () => {
      const date = new Date("2026-06-07T00:00:00Z");
      expect(getExamCountdownText(date)).toBe("экзамен прошел 06.06.2026");
    });

    it("should return 'дата экзамена еще не объявлена' on or after August 1st, 2026", () => {
      const date = new Date("2026-08-02T00:00:00Z");
      expect(getExamCountdownText(date)).toBe("дата экзамена еще не объявлена");
    });

    it("should return remaining days before exam date", () => {
      // June 6, 2026 is the exam.
      // 5 June 2026 -> 1 day remaining
      const date1 = new Date("2026-06-05T00:00:00Z");
      expect(getExamCountdownText(date1)).toBe("до экзамена 1 день");

      // 4 June 2026 -> 2 days remaining
      const date2 = new Date("2026-06-04T00:00:00Z");
      expect(getExamCountdownText(date2)).toBe("до экзамена 2 дня");

      // 1 June 2026 -> 5 days remaining
      const date3 = new Date("2026-06-01T00:00:00Z");
      expect(getExamCountdownText(date3)).toBe("до экзамена 5 дней");
    });

    it("should return exam passed message on the actual day of the exam", () => {
      const date = new Date("2026-06-06T12:00:00Z");
      expect(getExamCountdownText(date)).toBe("экзамен прошел 06.06.2026");
    });
  });
});
