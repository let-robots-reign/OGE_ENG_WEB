"use client";

interface MCQuestionProps {
  idx: number;
  question: string | undefined;
  options: string[];
  value: number | null;
  onChange: (optNum: number) => void;
  checked: boolean;
  correct?: number;
}

export function MCQuestion({
  idx,
  question,
  options,
  value,
  onChange,
  checked,
  correct,
}: MCQuestionProps) {
  const isCorrect = checked && value === correct;
  const empty = checked && value == null;

  const borderTone = checked
    ? isCorrect
      ? "var(--color-ok)"
      : "var(--color-err)"
    : "var(--color-line)";
  const numBg = checked
    ? isCorrect
      ? "var(--color-ok)"
      : "var(--color-err)"
    : "var(--color-ink)";

  const cardBg = checked
    ? isCorrect
      ? "linear-gradient(180deg, var(--color-surface) 0%, rgba(26,164,99,0.04) 100%)"
      : "linear-gradient(180deg, var(--color-surface) 0%, rgba(220,38,38,0.03) 100%)"
    : "var(--color-surface)";

  return (
    <div
      className="rounded-lg border"
      style={{ padding: 28, borderColor: borderTone, background: cardBg }}
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
          {idx}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div
              className="font-display flex-1"
              style={{
                fontSize: 24,
                letterSpacing: "-0.015em",
                lineHeight: 1.25,
              }}
            >
              {question}
            </div>
            {checked && (
              <div
                className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap"
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

              let border = "var(--color-line-2)";
              let bg = "var(--color-surface)";
              let color = "var(--color-ink)";
              let codeColor = "var(--color-ink-3)";

              if (checked) {
                if (isCorrectOpt) {
                  border = "var(--color-ok)";
                  bg = "var(--color-ok-soft)";
                  color = "var(--color-ok)";
                  codeColor = "var(--color-ok)";
                } else if (isWrongPick) {
                  border = "var(--color-err)";
                  bg = "var(--color-err-soft)";
                  color = "var(--color-err)";
                  codeColor = "var(--color-err)";
                } else {
                  color = "var(--color-ink-3)";
                }
              } else if (selected) {
                border = "var(--color-ink)";
                bg = "var(--color-ink)";
                color = "var(--color-on-ink)";
                codeColor =
                  "color-mix(in srgb, var(--color-on-ink) 60%, transparent)";
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !checked && onChange(optNum)}
                  disabled={checked}
                  className="flex items-center gap-3.5 rounded-md text-left text-[15px] transition-all"
                  style={{
                    padding: "16px 20px",
                    border: `1px solid ${border}`,
                    background: bg,
                    color,
                    cursor: checked ? "default" : "pointer",
                  }}
                >
                  <span
                    className="grid shrink-0 place-items-center"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: `1.5px solid ${
                        checked
                          ? isCorrectOpt
                            ? "var(--color-ok)"
                            : isWrongPick
                              ? "var(--color-err)"
                              : "var(--color-line-2)"
                          : selected
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
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "var(--color-on-ink)",
                        }}
                      />
                    )}
                  </span>
                  <span
                    className="mr-1 font-mono text-[12px]"
                    style={{ color: codeColor }}
                  >
                    {optNum})
                  </span>
                  <span className="flex-1">{opt}</span>
                  {checked && selected && (
                    <span
                      className="font-mono uppercase"
                      style={{
                        fontSize: 10.5,
                        letterSpacing: ".08em",
                        padding: "3px 8px",
                        borderRadius: 6,
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
}
