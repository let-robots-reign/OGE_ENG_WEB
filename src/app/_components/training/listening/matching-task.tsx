"use client";

interface MatchingTaskProps {
  rubrics: string[];
  answers: (number | null)[];
  setAnswer: (speakerIdx: number, rubricNum: number | null) => void;
  checked: boolean;
  correctAnswers: number[];
  // Per-speaker verdicts from the server, so the cells can never colour
  // themselves differently from the score the student is shown.
  results: boolean[];
  speakerCount: number;
}

const SPEAKER_LETTERS = "ABCDEFGHIJ";

// Speakers are labelled A, B, C… — how many there are comes from the task data
// rather than a constant, since it is the answer count that defines the task.
export const speakersFor = (count: number): string[] =>
  Array.from(
    { length: Math.max(count, 0) },
    (_, i) => SPEAKER_LETTERS[i] ?? String(i + 1),
  );

export function MatchingTask({
  rubrics,
  answers,
  setAnswer,
  checked,
  correctAnswers,
  results,
  speakerCount,
}: MatchingTaskProps) {
  const speakers = speakersFor(speakerCount);
  const rubricNumbers = rubrics.map((_, i) => i + 1);

  // Find which speakers are assigned to which rubric
  const assignedSpeakersMap = new Map<number, string>();
  answers.forEach((val, speakerIdx) => {
    const speaker = speakers[speakerIdx];
    if (val !== null && speaker) {
      assignedSpeakersMap.set(val, speaker);
    }
  });

  return (
    <div className="flex flex-col gap-6">
      {/* List of rubrics */}
      <div className="bg-surface border-line rounded-lg border p-5 sm:p-6">
        <div className="text-ink-3 mb-4 text-[12px] font-medium tracking-[0.1em] uppercase">
          Список рубрик (1–{rubrics.length})
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rubrics.map((rubricText, i) => {
            const rubricNum = i + 1;
            const assignedSpeaker = assignedSpeakersMap.get(rubricNum);
            return (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-md border p-3.5 transition-colors ${
                  assignedSpeaker
                    ? "bg-accent-subtle/40 border-accent/30"
                    : "bg-surface-2 border-line-2"
                }`}
              >
                <span className="bg-ink text-on-ink font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] font-medium">
                  {rubricNum}
                </span>
                <span className="text-ink-1 text-[14.5px] leading-snug">
                  {rubricText}
                </span>
                {assignedSpeaker && (
                  <span className="bg-accent/15 text-accent rounded-pill ml-auto shrink-0 px-2 py-0.5 text-[11px] font-semibold uppercase">
                    Спикер {assignedSpeaker}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Table (Exam Style) */}
      <div className="bg-surface border-line rounded-lg border p-5 sm:p-6">
        <div className="text-ink-3 mb-3 text-[12px] font-medium tracking-[0.1em] uppercase">
          Бланк ответов (выберите цифру рубрики 1–{rubrics.length} для каждого
          говорящего)
        </div>

        <div className="overflow-x-auto">
          <table className="border-line w-full min-w-[550px] table-fixed border-collapse text-center">
            <thead>
              <tr className="bg-surface-2 border-line border-b">
                <th className="border-line text-ink-2 w-32 border-r p-3 text-left text-[14px] font-medium">
                  Говорящий
                </th>
                {speakers.map((sp) => (
                  <th
                    key={sp}
                    className="border-line font-display text-ink-1 border-r p-3 text-[18px] font-semibold uppercase last:border-r-0"
                    style={{
                      width: `calc((100% - 128px) / ${speakers.length})`,
                    }}
                  >
                    {sp}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-line text-ink-1 font-display border-r p-3 text-left text-[14px] font-medium">
                  Рубрика
                </td>
                {speakers.map((sp, idx) => {
                  const userVal = answers[idx] ?? null;
                  const correctVal = correctAnswers[idx];
                  const isCorrect = checked && (results[idx] ?? false);
                  const isWrong = checked && !isCorrect;

                  return (
                    <td
                      key={sp}
                      className={`border-line border-r p-2.5 last:border-r-0 ${
                        isCorrect
                          ? "bg-emerald-500/10"
                          : isWrong
                            ? "bg-rose-500/10"
                            : ""
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <select
                          disabled={checked}
                          aria-label={`Рубрика для говорящего ${sp}`}
                          value={userVal ?? ""}
                          onChange={(e) => {
                            const val = e.target.value
                              ? Number(e.target.value)
                              : null;
                            setAnswer(idx, val);
                          }}
                          className={`bg-surface-1 border-line-2 focus:border-accent text-ink-1 font-display h-11 w-full max-w-[120px] rounded-md border text-center text-[16px] font-medium transition-all outline-none disabled:cursor-not-allowed disabled:opacity-90 ${
                            isCorrect
                              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : isWrong
                                ? "border-rose-500 text-rose-600 dark:text-rose-400"
                                : ""
                          }`}
                        >
                          <option value="">—</option>
                          {rubricNumbers.map((num) => (
                            <option
                              key={num}
                              value={num}
                              // Each rubric may be used only once (task 5 rule),
                              // so hide the ones another speaker already took.
                              disabled={
                                assignedSpeakersMap.has(num) && userVal !== num
                              }
                            >
                              {num}
                            </option>
                          ))}
                        </select>
                        {checked && (
                          <div className="flex min-h-[18px] items-center justify-center text-[11.5px] font-medium">
                            {isWrong ? (
                              <span className="text-rose-500">
                                Правильно: {correctVal}
                              </span>
                            ) : (
                              <span className="invisible" aria-hidden="true">
                                Правильно: 0
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
