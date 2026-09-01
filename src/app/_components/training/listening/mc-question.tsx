"use client";

interface MCQuestionProps {
  idx: number;
  question: string | undefined;
  options: string[];
  value: number | null;
  onChange: (optNum: number) => void;
  checked: boolean;
  correct?: number;
  // The server's verdict for this question. Grading lives on the server, so the
  // card never re-derives it from `value === correct`.
  isCorrect?: boolean;
}

export function MCQuestion({
  idx,
  question,
  options,
  value,
  onChange,
  checked,
  correct,
  isCorrect: isCorrectAnswer = false,
}: MCQuestionProps) {
  const isCorrect = checked && isCorrectAnswer;
  const empty = checked && value == null;

  return (
    <div
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
          {idx}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="font-display flex-1 text-[24px] leading-[1.25] tracking-[-0.015em]">
              {question}
            </div>
            {checked && (
              <div
                className={`mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${
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
                    {empty ? "не отвечено" : "ошибка"}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-[18px] flex flex-col gap-2">
            {options.map((opt, i) => {
              const optNum = i + 1;
              const selected = value === optNum;
              const isCorrectOpt = checked && optNum === correct;
              const isWrongPick = checked && selected && !isCorrect;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !checked && onChange(optNum)}
                  disabled={checked}
                  className={`flex items-center gap-3.5 rounded-md border px-5 py-4 text-left text-[15px] transition-all ${
                    checked ? "cursor-default" : "cursor-pointer"
                  } ${
                    checked
                      ? isCorrectOpt
                        ? "border-ok bg-ok-soft text-ok"
                        : isWrongPick
                          ? "border-err bg-err-soft text-err"
                          : "border-line-2 bg-surface text-ink-3"
                      : selected
                        ? "border-ink bg-ink text-on-ink"
                        : "border-line-2 bg-surface text-ink"
                  }`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] ${
                      checked
                        ? isCorrectOpt
                          ? "border-ok bg-ok"
                          : isWrongPick
                            ? "border-err bg-err"
                            : "border-line-2 bg-transparent"
                        : selected
                          ? "border-on-ink bg-transparent"
                          : "border-line-2 bg-transparent"
                    }`}
                  >
                    {checked && isCorrectOpt && (
                      <svg
                        width="12"
                        height="12"
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
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                      >
                        <path d="M6 6l12 12M6 18L18 6" />
                      </svg>
                    )}
                    {!checked && selected && (
                      <span className="bg-on-ink size-2.5 rounded-full" />
                    )}
                  </span>
                  <span
                    className={`mr-1 font-mono text-[12px] ${
                      checked
                        ? isCorrectOpt
                          ? "text-ok"
                          : isWrongPick
                            ? "text-err"
                            : "text-ink-3"
                        : selected
                          ? "text-on-ink/60"
                          : "text-ink-3"
                    }`}
                  >
                    {optNum})
                  </span>
                  <span className="flex-1">{opt}</span>
                  {checked && selected && (
                    <span
                      className={`rounded-[6px] px-2 py-[3px] font-mono text-[10.5px] tracking-[0.08em] uppercase ${
                        isCorrect ? "bg-ok/15 text-ok" : "bg-err/12 text-err"
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
}
