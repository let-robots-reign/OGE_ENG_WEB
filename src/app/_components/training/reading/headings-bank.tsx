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
        <div className="font-display mt-2 text-[28px] leading-[1.05] tracking-[-0.02em]">
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

          return (
            <li key={h.n}>
              <button
                type="button"
                onClick={() => !checked && onPickHeading(h.n)}
                disabled={checked}
                className={`text-ink grid w-full grid-cols-[36px_1fr_auto] items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-[background,border-color] ${
                  checked ? "cursor-default" : "cursor-pointer"
                } ${
                  checked
                    ? assignedLetter
                      ? correctLetter === assignedLetter
                        ? "bg-ok-soft border-transparent"
                        : "bg-err-soft border-transparent"
                      : "border-transparent bg-transparent"
                    : isActive
                      ? "border-ink bg-surface-2"
                      : assignedLetter
                        ? "bg-accent-soft border-transparent"
                        : "border-transparent bg-transparent"
                }`}
              >
                <span
                  className={`mt-px grid h-[30px] w-[30px] place-items-center rounded-[9px] font-mono text-[13px] font-medium ${
                    checked
                      ? assignedLetter
                        ? correctLetter === assignedLetter
                          ? "bg-ok text-white"
                          : "bg-err text-white"
                        : !hasCorrectText
                          ? "bg-ink-2 text-on-ink"
                          : "bg-surface-2 text-ink-3"
                      : isActive
                        ? "bg-ink text-on-ink"
                        : assignedLetter
                          ? "bg-accent text-white"
                          : "bg-surface-2 text-ink-3"
                  }`}
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
                    <span className="font-display bg-surface-2 text-ink-3 grid size-7 place-items-center rounded-xs text-[16px] italic">
                      {correctLetter}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span
                        className={`font-display grid size-7 place-items-center rounded-xs text-[16px] text-white italic ${
                          correctLetter === assignedLetter ? "bg-ok" : "bg-err"
                        }`}
                      >
                        {assignedLetter}
                      </span>
                      {correctLetter !== assignedLetter && (
                        <>
                          <span className="text-ink-4 text-[11px]">→</span>
                          <span className="font-display border-ok bg-ok-soft text-ok grid size-7 place-items-center rounded-xs border text-[16px] italic">
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
                    className="text-on-ink bg-ink font-display grid size-7 shrink-0 cursor-pointer place-items-center rounded-xs text-[16px] italic"
                  >
                    {assignedLetter}
                  </span>
                ) : (
                  <span
                    className={`mt-2 font-mono text-[10.5px] tracking-[0.06em] whitespace-nowrap ${
                      isActive ? "text-ink" : "text-ink-4"
                    }`}
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
            className="text-ink-3 border-0 bg-transparent p-0 text-[12.5px]"
          >
            отмена
          </button>
        </div>
      )}
    </div>
  );
}
