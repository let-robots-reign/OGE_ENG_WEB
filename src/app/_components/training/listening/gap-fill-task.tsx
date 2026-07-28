"use client";

interface GapFillTaskProps {
  questions: string[];
  answers: (string | null)[];
  setAnswer: (questionIdx: number, val: string | null) => void;
  checked: boolean;
  correctAnswers: (string | string[] | number)[];
}

export function GapFillTask({
  questions,
  answers,
  setAnswer,
  checked,
  correctAnswers,
}: GapFillTaskProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface border-line rounded-lg border p-5 sm:p-6">
        <div className="text-ink-3 mb-4 text-[12px] font-medium tracking-[0.1em] uppercase">
          Занесите данные в таблицу (не более одного слова или числа буквами)
        </div>

        <div className="flex flex-col gap-4">
          {questions.map((qTemplate, idx) => {
            const taskNum = 6 + idx;
            const parts = qTemplate.split(/_{2,}/);
            const prefix = parts[0] ?? "";
            const suffix = parts.slice(1).join("") ?? "";

            const userVal = answers[idx] ?? "";
            const rawCorrect = correctAnswers[idx];
            const candidates = Array.isArray(rawCorrect)
              ? rawCorrect.map((c) => c.toString().trim().toUpperCase())
              : [(rawCorrect ?? "").toString().trim().toUpperCase()];

            const displayCorrect = Array.isArray(rawCorrect)
              ? rawCorrect.join(" / ")
              : (rawCorrect ?? "").toString();

            const normUser = userVal.trim().toUpperCase();

            const isCorrect =
              checked && normUser !== "" && candidates.includes(normUser);
            const isWrong =
              checked && (!normUser || !candidates.includes(normUser));

            return (
              <div
                key={idx}
                className="bg-surface-2 border-line-2 flex flex-col gap-2 rounded-md border p-3.5 sm:p-4"
              >
                <div className="flex flex-wrap items-center gap-2.5 text-[15px] font-medium sm:text-[16px]">
                  <span className="bg-ink text-on-ink font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] font-medium">
                    {taskNum}
                  </span>

                  {prefix && <span className="text-ink-1">{prefix}</span>}

                  <input
                    type="text"
                    disabled={checked}
                    value={userVal}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setAnswer(idx, val.trim() ? val : null);
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim().toUpperCase();
                      setAnswer(idx, val ? val : null);
                    }}
                    placeholder="..."
                    className={`bg-surface-1 border-line-2 focus:border-accent font-mono text-ink-1 h-10 w-44 rounded-md border px-3 text-center text-[15px] font-bold uppercase outline-none transition-all disabled:cursor-not-allowed disabled:opacity-90 sm:w-52 ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isWrong
                          ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : ""
                    }`}
                  />

                  {suffix && <span className="text-ink-1">{suffix}</span>}
                </div>

                {isWrong && (
                  <div className="pl-8 text-[12.5px] font-medium text-rose-500">
                    Правильно:{" "}
                    <span className="font-mono font-bold uppercase">
                      {displayCorrect}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
