const GRADE_STYLES = {
  2: {
    text: "text-err",
    badge: "bg-err-soft text-err",
  },
  3: {
    text: "text-warn",
    badge: "bg-warn-soft text-warn",
  },
  4: {
    text: "text-grade-4",
    badge: "bg-grade-4-soft text-grade-4",
  },
  5: {
    text: "text-grade-5",
    badge: "bg-grade-5-soft text-grade-5",
  },
} as const;

const FALLBACK_STYLE = {
  text: "text-ink-3",
  badge: "bg-surface-2 text-ink-3",
} as const;

const getGradeStyle = (grade: number | null | undefined) =>
  grade === 2 || grade === 3 || grade === 4 || grade === 5
    ? GRADE_STYLES[grade]
    : FALLBACK_STYLE;

export const getMockExamGradeTextClass = (grade: number | null | undefined) =>
  getGradeStyle(grade).text;

export const getMockExamGradeBadgeClass = (grade: number | null | undefined) =>
  getGradeStyle(grade).badge;
