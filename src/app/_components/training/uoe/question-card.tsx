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

  const inputBg = checked
    ? correct
      ? "var(--color-ok-soft)"
      : "var(--color-err-soft)"
    : "var(--color-surface)";
  const inputBorder = checked
    ? correct
      ? "var(--color-ok)"
      : "var(--color-err)"
    : "var(--color-line-2)";
  const inputColor = checked
    ? correct
      ? "var(--color-ok)"
      : "var(--color-err)"
    : "var(--color-ink)";

  return (
    <div
      className="rounded-lg border"
      style={{
        padding: "26px 32px 28px",
        borderColor: checked
          ? correct
            ? "var(--color-ok)"
            : "var(--color-err)"
          : "var(--color-line)",
        background: checked
          ? correct
            ? "linear-gradient(180deg, var(--color-surface) 0%, rgba(26,164,99,0.04) 100%)"
            : "linear-gradient(180deg, var(--color-surface) 0%, rgba(220,38,38,0.03) 100%)"
          : "var(--color-surface)",
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="grid place-items-center font-mono"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            color: checked ? "#fff" : "var(--color-on-ink)",
            background: checked
              ? correct
                ? "var(--color-ok)"
                : "var(--color-err)"
              : "var(--color-ink)",
          }}
        >
          {n}
        </div>
        {checked && (
          <div
            className="inline-flex items-center gap-1.5 text-[12px] font-medium"
            style={{ color: correct ? "var(--color-ok)" : "var(--color-err)" }}
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

      <div
        className="text-ink"
        style={{
          fontSize: 19,
          lineHeight: 1.7,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0 4px",
        }}
      >
        <span>{before}</span>
        <input
          type="text"
          value={value}
          onChange={(e) =>
            onChange(e.target.value.toUpperCase().replace(/\s+/g, ""))
          }
          readOnly={checked}
          placeholder={origin}
          className="align-middle font-mono outline-none"
          style={{
            width,
            padding: "10px 14px",
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "0.02em",
            border: `1.5px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: inputColor,
            transition: "border-color .15s, background .15s",
          }}
          onFocus={(e) => {
            if (!checked)
              e.currentTarget.style.borderColor = "var(--color-accent)";
          }}
          onBlur={(e) => {
            if (!checked)
              e.currentTarget.style.borderColor = "var(--color-line-2)";
          }}
        />
        <span>{after}</span>
      </div>

      <div
        className="mt-[18px] flex items-center gap-3.5 pt-4 text-[13px]"
        style={{ borderTop: "1px dashed var(--color-line)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-ink-3">исходное слово</span>
          <span
            className="text-on-ink font-mono font-medium"
            style={{
              fontSize: 13,
              letterSpacing: ".08em",
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--color-ink)",
            }}
          >
            {origin}
          </span>
        </div>
        {checked && !correct && correctAnswer && (
          <>
            <span style={{ color: "var(--color-line-2)" }}>·</span>
            <div className="flex items-center gap-2">
              <span className="text-ink-3">правильный ответ</span>
              <span
                className="font-mono font-medium"
                style={{
                  fontSize: 13,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "var(--color-ok-soft)",
                  color: "var(--color-ok)",
                }}
              >
                {correctAnswer.replace(/\//g, " / ")}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
