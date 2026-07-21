import { pluralizeDays } from "@/app/_utils/pluralize";

export const EXAM_DATE = "06.06.2026";

export const getExamName = (currentDate: Date = new Date()): string => {
  const year = currentDate.getFullYear();
  const august1 = new Date(year, 7, 1);
  return currentDate < august1 ? `ОГЭ ${year}` : `ОГЭ ${year + 1}`;
};

export const EXAM_NAME = getExamName();

export const getExamCountdownText = (
  currentDate: Date = new Date(),
): string => {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const exam = new Date(2026, 5, 6); // June 6, 2026
  exam.setHours(0, 0, 0, 0);

  const august1 = new Date(2026, 7, 1); // August 1, 2026
  august1.setHours(0, 0, 0, 0);

  if (today >= exam) {
    if (today < august1) {
      return `экзамен прошел ${EXAM_DATE}`;
    } else {
      return "дата экзамена еще не объявлена";
    }
  }

  const diffMs = exam.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return `до экзамена ${diffDays} ${pluralizeDays(diffDays)}`;
};
