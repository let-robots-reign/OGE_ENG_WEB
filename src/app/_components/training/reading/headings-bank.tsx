"use client";

const letterOf = (i: number) => String.fromCharCode(65 + i);

interface Heading {
  n: number;
  q: string;
}

interface HeadingsBankProps {
  headings: Heading[];
  assigned: (number | null)[];
  correctAnswers: number[];
  activeHeading: number | null;
  onPickHeading: (n: number) => void;
  onDetachText: (textIndex: number) => void;
  checked: boolean;
}

export function HeadingsBank({
  headings,
  assigned,
  correctAnswers,
  activeHeading,
  onPickHeading,
  onDetachText,
  checked,
}: HeadingsBankProps) {
  return (
    <div className="bg-surface border-line self-start overflow-hidden rounded-lg border lg:sticky lg:top-[88px]">
      <div className="border-line border-b px-6 py-5">
        <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
          <span className="bg-accent h-1.5 w-1.5 rounded-full" />
          заголовки · 1–{headings.length}
        </div>
        <div
          className="font-display mt-2"
          style={{ fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.02em" }}
        >
          Один заголовок <span className="text-ink-3 italic">лишний</span>
        </div>
        <div className="text-ink-3 mt-2.5 text-[13.5px] leading-relaxed">
          {checked
            ? "Цветом отмечены правильные и ошибочные сопоставления."
            : "Кликните вопрос, затем кликните на текст справа, чтобы прикрепить."}
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-1 p-3">
        {headings.map((h) => {
          const assignedTextIdx = assigned.findIndex((a) => a === h.n);
          const assignedLetter =
            assignedTextIdx >= 0 ? letterOf(assignedTextIdx) : null;
          const correctTextIdx = correctAnswers.findIndex((c) => c === h.n);
          const hasCorrectText = correctTextIdx >= 0;
          const correctLetter = hasCorrectText
            ? letterOf(correctTextIdx)
            : null;
          const isActive = !checked && activeHeading === h.n;

          let badgeBg = "var(--color-surface-2)";
          let badgeColor = "var(--color-ink-3)";
          let rowBg = "transparent";
          let rowBorder = "transparent";

          if (checked) {
            if (assignedLetter) {
              const isRight = correctLetter === assignedLetter;
              badgeBg = isRight ? "var(--color-ok)" : "var(--color-err)";
              badgeColor = "#fff";
              rowBg = isRight
                ? "var(--color-ok-soft)"
                : "var(--color-err-soft)";
            } else if (!hasCorrectText) {
              badgeBg = "var(--color-ink-2)";
              badgeColor = "var(--color-on-ink)";
            }
          } else if (isActive) {
            badgeBg = "var(--color-ink)";
            badgeColor = "var(--color-on-ink)";
            rowBg = "var(--color-surface-2)";
            rowBorder = "var(--color-ink)";
          } else if (assignedLetter) {
            badgeBg = "var(--color-accent)";
            badgeColor = "#fff";
            rowBg = "var(--color-accent-soft)";
          }

          return (
            <li key={h.n}>
              <button
                type="button"
                onClick={() => !checked && onPickHeading(h.n)}
                disabled={checked}
                className="grid w-full items-start gap-3 text-left transition-[background,border-color]"
                style={{
                  gridTemplateColumns: "36px 1fr auto",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid " + rowBorder,
                  background: rowBg,
                  color: "var(--color-ink)",
                  cursor: checked ? "default" : "pointer",
                }}
              >
                <span
                  className="grid place-items-center font-mono"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: badgeBg,
                    color: badgeColor,
                    fontSize: 13,
                    fontWeight: 500,
                    marginTop: 1,
                  }}
                >
                  {h.n}
                </span>
                <span className="text-ink-2 text-[13.5px] leading-snug">
                  {h.q}
                </span>

                {checked ? (
                  !hasCorrectText ? (
                    <span className="text-ink-3 mt-2 font-mono text-[10.5px] tracking-[0.06em] whitespace-nowrap">
                      лишний
                    </span>
                  ) : !assignedLetter ? (
                    <span
                      className="font-display grid place-items-center italic"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "var(--color-surface-2)",
                        color: "var(--color-ink-3)",
                        fontSize: 16,
                      }}
                    >
                      {correctLetter}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span
                        className="font-display grid place-items-center text-white italic"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background:
                            correctLetter === assignedLetter
                              ? "var(--color-ok)"
                              : "var(--color-err)",
                          fontSize: 16,
                        }}
                      >
                        {assignedLetter}
                      </span>
                      {correctLetter !== assignedLetter && (
                        <>
                          <span className="text-ink-4 text-[11px]">→</span>
                          <span
                            className="font-display grid place-items-center italic"
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background: "var(--color-ok-soft)",
                              color: "var(--color-ok)",
                              border: "1px solid var(--color-ok)",
                              fontSize: 16,
                            }}
                          >
                            {correctLetter}
                          </span>
                        </>
                      )}
                    </span>
                  )
                ) : assignedLetter ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetachText(assignedTextIdx);
                    }}
                    title={`Прикреплено к тексту ${assignedLetter} — нажмите, чтобы открепить`}
                    className="text-on-ink font-display grid shrink-0 cursor-pointer place-items-center italic"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "var(--color-ink)",
                      fontSize: 16,
                    }}
                  >
                    {assignedLetter}
                  </span>
                ) : (
                  <span
                    className="mt-2 font-mono text-[10.5px] tracking-[0.06em] whitespace-nowrap"
                    style={{
                      color: isActive
                        ? "var(--color-ink)"
                        : "var(--color-ink-4)",
                    }}
                  >
                    {isActive ? "выбран →" : "—"}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {!checked && activeHeading && (
        <div className="border-line bg-surface-2 text-ink-2 flex items-center justify-between border-t px-[18px] py-3 text-[13px]">
          <span>
            Выбран вопрос{" "}
            <strong className="font-mono">№{activeHeading}</strong>. Кликните на
            текст →
          </span>
          <button
            type="button"
            onClick={() => onPickHeading(activeHeading)}
            className="text-ink-3 cursor-pointer border-0 bg-transparent p-0 text-[12.5px]"
          >
            отмена
          </button>
        </div>
      )}
    </div>
  );
}
