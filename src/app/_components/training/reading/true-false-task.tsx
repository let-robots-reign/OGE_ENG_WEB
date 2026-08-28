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
      <div
        className="rounded-lg border p-6 sm:p-8"
        style={{
          borderColor: "var(--color-line)",
          background: "var(--color-surface)",
        }}
      >
        <div
          className="mb-3 inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.1em] uppercase"
          style={{ color: "var(--color-ink-3)" }}
        >
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
        <div
          className="text-[15px] leading-[1.8] whitespace-pre-line"
          style={{ color: "var(--color-ink)" }}
        >
          {text}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {statements.map((statement, i) => {
          const selected = answers[i];
          const isCorrect = checked && results[i];
          const isWrong = checked && !results[i];
          const correctN = correctAnswers[i];

          const borderColor = checked
            ? isCorrect
              ? "var(--color-ok)"
              : "var(--color-err)"
            : "var(--color-line)";

          const cardBg = checked
            ? isCorrect
              ? "linear-gradient(180deg, var(--color-surface) 0%, rgba(26,164,99,0.04) 100%)"
              : "linear-gradient(180deg, var(--color-surface) 0%, rgba(220,38,38,0.03) 100%)"
            : "var(--color-surface)";

          const numBg = checked
            ? isCorrect
              ? "var(--color-ok)"
              : "var(--color-err)"
            : "var(--color-ink)";

          return (
            <div
              key={i}
              className="rounded-lg border"
              style={{ padding: 28, borderColor, background: cardBg }}
            >
              <div className="flex items-start gap-[18px]">
                <div
                  className="grid shrink-0 place-items-center font-mono"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: numBg,
                    color: checked ? "#fff" : "var(--color-on-ink)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {13 + i}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="font-display flex-1"
                      style={{
                        fontSize: 20,
                        letterSpacing: "-0.015em",
                        lineHeight: 1.35,
                      }}
                    >
                      {statement}
                    </div>
                    {checked && (
                      <div
                        className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap"
                        style={{
                          color: isCorrect
                            ? "var(--color-ok)"
                            : "var(--color-err)",
                        }}
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

                      let border = "var(--color-line-2)";
                      let bg = "var(--color-surface)";
                      let color = "var(--color-ink)";

                      if (checked) {
                        if (isCorrectOpt) {
                          border = "var(--color-ok)";
                          bg = "var(--color-ok-soft)";
                          color = "var(--color-ok)";
                        } else if (isWrongPick) {
                          border = "var(--color-err)";
                          bg = "var(--color-err-soft)";
                          color = "var(--color-err)";
                        } else {
                          color = "var(--color-ink-3)";
                        }
                      } else if (isSelected) {
                        border = "var(--color-ink)";
                        bg = "var(--color-ink)";
                        color = "var(--color-on-ink)";
                      }

                      return (
                        <button
                          key={optNum}
                          type="button"
                          onClick={() => !checked && onAnswer(i, optNum)}
                          disabled={checked}
                          className="inline-flex items-center gap-2.5 rounded-md text-[14px] font-medium transition-all"
                          style={{
                            padding: "10px 18px",
                            border: `1px solid ${border}`,
                            background: bg,
                            color,
                            cursor: checked ? "default" : "pointer",
                          }}
                        >
                          <span
                            className="grid shrink-0 place-items-center"
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: `1.5px solid ${
                                checked
                                  ? isCorrectOpt
                                    ? "var(--color-ok)"
                                    : isWrongPick
                                      ? "var(--color-err)"
                                      : "var(--color-line-2)"
                                  : isSelected
                                    ? "var(--color-on-ink)"
                                    : "var(--color-line-2)"
                              }`,
                              background:
                                checked && isCorrectOpt
                                  ? "var(--color-ok)"
                                  : checked && isWrongPick
                                    ? "var(--color-err)"
                                    : "transparent",
                            }}
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
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: "var(--color-on-ink)",
                                }}
                              />
                            )}
                          </span>
                          {ANSWER_LABELS[optNum]}
                          {checked && isSelected && (
                            <span
                              className="font-mono uppercase"
                              style={{
                                fontSize: 10,
                                letterSpacing: ".08em",
                                padding: "2px 6px",
                                borderRadius: 5,
                                background: isCorrect
                                  ? "rgba(26,164,99,0.15)"
                                  : "rgba(220,38,38,0.12)",
                                color: isCorrect
                                  ? "var(--color-ok)"
                                  : "var(--color-err)",
                              }}
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
