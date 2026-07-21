"use client";

interface TextCardProps {
  letter: string;
  body: string;
  assignedN: number | null;
  assignedHeadingQ?: string;
  armed: boolean;
  activeHeading: number | null;
  onAssign: () => void;
  onClear: () => void;
  checked: boolean;
  isCorrect: boolean;
  correctN?: number;
  correctHeadingQ?: string;
}

export function TextCard({
  letter,
  body,
  assignedN,
  assignedHeadingQ,
  armed,
  activeHeading,
  onAssign,
  onClear,
  checked,
  isCorrect,
  correctN,
  correctHeadingQ,
}: TextCardProps) {
  let borderTone = "var(--color-line)";
  let bgTint = "var(--color-surface)";
  let numBg = "var(--color-ink)";

  if (checked) {
    borderTone = isCorrect ? "var(--color-ok)" : "var(--color-err)";
    numBg = isCorrect ? "var(--color-ok)" : "var(--color-err)";
    bgTint = isCorrect
      ? "linear-gradient(180deg, var(--color-surface) 0%, rgba(26,164,99,0.04) 100%)"
      : "linear-gradient(180deg, var(--color-surface) 0%, rgba(220,38,38,0.03) 100%)";
  } else if (assignedN) {
    borderTone = "var(--color-accent)";
  } else if (armed) {
    borderTone = "var(--color-ink)";
  }

  return (
    <div
      onClick={() => armed && onAssign()}
      className="border transition-[border-color,box-shadow]"
      style={{
        padding: 28,
        borderRadius: "var(--radius-lg)",
        cursor: armed ? "pointer" : "default",
        borderColor: borderTone,
        background: bgTint,
        boxShadow: armed ? "0 0 0 4px var(--color-accent-soft)" : "none",
      }}
    >
      <div className="flex items-start gap-[18px]">
        <div
          className="font-display grid shrink-0 place-items-center italic"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: numBg,
            color: checked ? "#fff" : "var(--color-on-ink)",
            fontSize: 19,
          }}
        >
          {letter}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-ink-3 font-mono text-[11px] tracking-[0.1em] uppercase">
                текст {letter}
              </div>
              <div className="text-ink-2 mt-1 text-[13.5px] leading-snug">
                {assignedN ? (
                  <>
                    заголовок:{" "}
                    <strong className="text-ink">№{assignedN}</strong>
                    {assignedHeadingQ ? <> · «{assignedHeadingQ}»</> : null}
                  </>
                ) : armed ? (
                  "Кликните, чтобы прикрепить выбранный вопрос"
                ) : (
                  "Заголовок не выбран"
                )}
              </div>
            </div>

            {checked ? (
              <div
                className="mt-0.5 inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap"
                style={{
                  color: isCorrect ? "var(--color-ok)" : "var(--color-err)",
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
                    ошибка
                  </>
                )}
              </div>
            ) : assignedN ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="inline-flex items-center gap-2 text-[12.5px] font-medium text-white"
                style={{
                  padding: "4px 12px 4px 4px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--color-accent)",
                  background: "var(--color-accent)",
                }}
              >
                <span
                  className="grid place-items-center font-mono"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#fff",
                    color: "var(--color-accent)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {assignedN}
                </span>
                открепить
              </button>
            ) : (
              <div
                className="grid place-items-center font-mono"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: armed
                    ? "var(--color-accent-soft)"
                    : "var(--color-surface-2)",
                  border:
                    "1px dashed " +
                    (armed ? "var(--color-accent)" : "var(--color-line-2)"),
                  color: armed ? "var(--color-accent)" : "var(--color-ink-4)",
                  fontSize: 14,
                }}
              >
                {armed ? activeHeading : "?"}
              </div>
            )}
          </div>

          <div
            className="text-ink-2 mt-4 text-[15px]"
            style={{ lineHeight: 1.65 }}
          >
            <span className="text-ink font-semibold">{letter}.</span> {body}
          </div>

          {checked && !isCorrect && (
            <div
              className="mt-4 flex items-center gap-3"
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-ok-soft)",
                border: "1px solid rgba(26,164,99,0.25)",
              }}
            >
              <span
                className="grid shrink-0 place-items-center font-mono text-white"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "var(--color-ok)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {correctN}
              </span>
              <div className="text-ink-2 text-[13.5px] leading-snug">
                <span className="text-ok mr-2 font-mono text-[10.5px] tracking-[0.08em] uppercase">
                  верный ответ
                </span>
                «{correctHeadingQ}»
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
