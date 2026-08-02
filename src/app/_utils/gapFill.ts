// Shared between the server checker and the gap-fill UI so both agree on what
// counts as a match. A correct answer may be a single value or a list of
// acceptable variants (e.g. ["FIFTEEN", "15"]).
export type GapFillCorrectAnswer = string | string[] | number;

// What a student may have typed, or what the runner holds in state.
export type GapFillUserAnswer = string | number | null | undefined;

export const normalizeGapFillAnswer = (value: GapFillUserAnswer): string =>
  (value ?? "").toString().trim().toUpperCase();

export const getGapFillVariants = (
  correct: GapFillCorrectAnswer | undefined,
): string[] =>
  Array.isArray(correct)
    ? correct.map(normalizeGapFillAnswer)
    : [normalizeGapFillAnswer(correct)];

export const isGapFillAnswerCorrect = (
  userAnswer: GapFillUserAnswer,
  correct: GapFillCorrectAnswer | undefined,
): boolean => {
  const normalized = normalizeGapFillAnswer(userAnswer);
  if (normalized === "") return false;
  return getGapFillVariants(correct).includes(normalized);
};

// Human-readable form of the expected answer, for the "Правильно: …" hints.
export const formatGapFillAnswer = (
  correct: GapFillCorrectAnswer | undefined,
): string =>
  Array.isArray(correct) ? correct.join(" / ") : (correct ?? "").toString();
