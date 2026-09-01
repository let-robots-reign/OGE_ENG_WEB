"use client";

const ANSWER_LABELS = ["", "True", "False", "Not stated"] as const;

interface TrueFalseTaskProps {
  text: string;
  statements: string[];
  answers: (number | null)[];
  onAnswer: (index: number, value: number) => void;
  checked: boolean;
  correctAnswers: number[];
  results: boolean[];
}

export function TrueFalseTask({
  text,
  statements,
  answers,
  onAnswer,
  checked,
  correctAnswers,
  results,
}: TrueFalseTaskProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-line bg-surface rounded-lg border p-6 sm:p-8">
        <div className="text-ink-3 mb-3 inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.1em] uppercase">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          текст для чтения
        </div>
        <div className="text-ink text-[15px] leading-[1.8] whitespace-pre-line">
          {text}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {statements.map((statement, i) => {
          const selected = answers[i];
          const isCorrect = checked && results[i];
          const isWrong = checked && !results[i];
          const correctN = correctAnswers[i];

          return (
            <div
              key={i}
              className={`rounded-lg border p-7 ${
                checked
                  ? isCorrect
                    ? "border-ok bg-[linear-gradient(180deg,var(--color-surface)_0%,rgba(26,164,99,0.04)_100%)]"
                    : "border-err bg-[linear-gradient(180deg,var(--color-surface)_0%,rgba(220,38,38,0.03)_100%)]"
                  : "border-line bg-surface"
              }`}
            >
              <div className="flex items-start gap-[18px]">
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-[10px] font-mono text-[14px] font-medium ${
                    checked
                      ? isCorrect
                        ? "bg-ok text-white"
                        : "bg-err text-white"
                      : "bg-ink text-on-ink"
                  }`}
                >
                  {13 + i}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-display flex-1 text-[20px] leading-[1.35] tracking-[-0.015em]">
                      {statement}
                    </div>
                    {checked && (
                      <div
                        className={`mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${
                          isCorrect ? "text-ok" : "text-err"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                            верно
                          </>
                        ) : (
                          <>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path d="M6 6l12 12M6 18L18 6" />
                            </svg>
                            {selected == null ? "не отвечено" : "ошибка"}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-[18px] flex flex-wrap gap-2">
                    {([1, 2, 3] as const).map((optNum) => {
                      const isSelected = selected === optNum;
                      const isCorrectOpt = checked && optNum === correctN;
                      const isWrongPick = checked && isSelected && isWrong;

                      return (
                        <button
                          key={optNum}
                          type="button"
                          onClick={() => !checked && onAnswer(i, optNum)}
                          disabled={checked}
                          className={`inline-flex items-center gap-2.5 rounded-md border px-4.5 py-2.5 text-[14px] font-medium transition-all ${
                            checked ? "cursor-default" : "cursor-pointer"
                          } ${
                            checked
                              ? isCorrectOpt
                                ? "border-ok bg-ok-soft text-ok"
                                : isWrongPick
                                  ? "border-err bg-err-soft text-err"
                                  : "border-line-2 bg-surface text-ink-3"
                              : isSelected
                                ? "border-ink bg-ink text-on-ink"
                                : "border-line-2 bg-surface text-ink"
                          }`}
                        >
                          <span
                            className={`grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] ${
                              checked
                                ? isCorrectOpt
                                  ? "border-ok bg-ok"
                                  : isWrongPick
                                    ? "border-err bg-err"
                                    : "border-line-2 bg-transparent"
                                : isSelected
                                  ? "border-on-ink bg-transparent"
                                  : "border-line-2 bg-transparent"
                            }`}
                          >
                            {checked && isCorrectOpt && (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="3"
                              >
                                <path d="M5 12l5 5L20 7" />
                              </svg>
                            )}
                            {checked && isWrongPick && (
                              <svg
                                width="8"
                                height="8"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="3"
                              >
                                <path d="M6 6l12 12M6 18L18 6" />
                              </svg>
                            )}
                            {!checked && isSelected && (
                              <span className="bg-on-ink size-2 rounded-full" />
                            )}
                          </span>
                          {ANSWER_LABELS[optNum]}
                          {checked && isSelected && (
                            <span
                              className={`rounded-[5px] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase ${
                                isCorrect
                                  ? "bg-ok/15 text-ok"
                                  : "bg-err/12 text-err"
                              }`}
                            >
                              ваш ответ
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
