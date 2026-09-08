"use client";

interface QuestionCardProps {
  n: number;
  task: string;
  origin: string;
  value: string;
  onChange: (v: string) => void;
  checked: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
}

export function QuestionCard({
  n,
  task,
  origin,
  value,
  onChange,
  checked,
  isCorrect,
  correctAnswer,
}: QuestionCardProps) {
  const parts = task.split(/_{2,}/);
  const before = parts[0] ?? "";
  const after = parts.length > 1 ? parts.slice(1).join(" ") : "";

  const correct = !!isCorrect;
  const empty = checked && !value.trim();
  const width = Math.max(
    140,
    Math.min(360, (value.length || origin.length) * 13 + 40),
  );

  return (
    <div
      className={`rounded-lg border px-8 pt-[26px] pb-7 ${
        checked
          ? correct
            ? "border-ok bg-[linear-gradient(180deg,var(--color-surface)_0%,rgba(26,164,99,0.04)_100%)]"
            : "border-err bg-[linear-gradient(180deg,var(--color-surface)_0%,rgba(220,38,38,0.03)_100%)]"
          : "border-line bg-surface"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`grid size-[34px] place-items-center rounded-[10px] font-mono text-[13px] font-medium ${
            checked
              ? correct
                ? "bg-ok text-white"
                : "bg-err text-white"
              : "bg-ink text-on-ink"
          }`}
        >
          {n}
        </div>
        {checked && (
          <div
            className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
              correct ? "text-ok" : "text-err"
            }`}
          >
            {correct ? (
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

      <div className="text-ink flex flex-wrap items-center gap-x-1 text-[19px] leading-[1.7]">
        <span>{before}</span>
        <input
          type="text"
          value={value}
          onChange={(e) =>
            onChange(e.target.value.toUpperCase().replace(/\s+/g, ""))
          }
          readOnly={checked}
          placeholder={origin}
          className={`rounded-[10px] border-[1.5px] px-3.5 py-2.5 align-middle font-mono text-[17px] font-medium tracking-[0.02em] transition-[border-color,background-color] outline-none ${
            checked
              ? correct
                ? "border-ok bg-ok-soft text-ok"
                : "border-err bg-err-soft text-err"
              : "border-line-2 bg-surface text-ink focus:border-accent"
          }`}
          style={{ width }}
        />
        <span>{after}</span>
      </div>

      <div className="border-line mt-[18px] flex flex-wrap items-center gap-3.5 border-t border-dashed pt-4 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="text-ink-3">исходное слово</span>
          <span className="text-on-ink bg-ink rounded-[6px] px-2.5 py-1 font-mono text-[13px] font-medium tracking-[0.08em]">
            {origin}
          </span>
        </div>
        {checked && !correct && correctAnswer && (
          <>
            <span className="text-line-2">·</span>
            <div className="flex items-center gap-2">
              <span className="text-ink-3">правильный ответ</span>
              <span className="bg-ok-soft text-ok rounded-[6px] px-2.5 py-1 font-mono text-[13px] font-medium">
                {correctAnswer.replace(/\//g, " / ")}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
