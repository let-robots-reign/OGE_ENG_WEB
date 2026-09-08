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
  return (
    <div
      onClick={() => armed && onAssign()}
      className={`rounded-lg border p-7 transition-[border-color,box-shadow] ${
        armed ? "ring-accent-soft cursor-pointer ring-4" : "cursor-default"
      } ${
        checked
          ? isCorrect
            ? "border-ok bg-[linear-gradient(180deg,var(--color-surface)_0%,rgba(26,164,99,0.04)_100%)]"
            : "border-err bg-[linear-gradient(180deg,var(--color-surface)_0%,rgba(220,38,38,0.03)_100%)]"
          : assignedN
            ? "border-accent bg-surface"
            : armed
              ? "border-ink bg-surface"
              : "border-line bg-surface"
      }`}
    >
      <div className="flex items-start gap-[18px]">
        <div
          className={`font-display grid size-9 shrink-0 place-items-center rounded-[10px] text-[19px] italic ${
            checked
              ? isCorrect
                ? "bg-ok text-white"
                : "bg-err text-white"
              : "bg-ink text-on-ink"
          }`}
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
                className={`mt-0.5 inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${
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
                className="rounded-pill bg-accent border-accent inline-flex items-center gap-2 border py-1 pr-3 pl-1 text-[12.5px] font-medium text-white"
              >
                <span className="text-accent grid size-6 place-items-center rounded-full bg-white font-mono text-[12px] font-semibold">
                  {assignedN}
                </span>
                открепить
              </button>
            ) : (
              <div
                className={`grid size-9 place-items-center rounded-full border border-dashed font-mono text-[14px] ${
                  armed
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line-2 bg-surface-2 text-ink-4"
                }`}
              >
                {armed ? activeHeading : "?"}
              </div>
            )}
          </div>

          <div className="text-ink-2 mt-4 text-[15px] leading-[1.65]">
            <span className="text-ink font-semibold">{letter}.</span> {body}
          </div>

          {checked && !isCorrect && (
            <div className="bg-ok-soft border-ok/25 mt-4 flex items-center gap-3 rounded-md border px-4 py-3">
              <span className="bg-ok grid size-7 shrink-0 place-items-center rounded-xs font-mono text-[13px] font-medium text-white">
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
