import Link from "next/link";

function pluralItems(n: number) {
  if (n === 1) return `${n} вопрос`;
  if (n < 5) return `${n} вопроса`;
  return `${n} вопросов`;
}

interface TaskCardProps {
  kicker: string;
  range: string;
  title: string;
  desc: string;
  type: string;
  items: number;
  time: string;
  progress?: number | null;
  href?: string;
  disabled?: boolean;
  exam?: boolean;
}

export function TaskCard({
  kicker,
  range,
  title,
  desc,
  type,
  items,
  time,
  progress,
  href,
  disabled = false,
  exam = false,
}: TaskCardProps) {
  const isExam = exam;

  const inner = (
    <div
      className="grid grid-cols-1 gap-6 rounded-lg border p-6 sm:p-7 lg:grid-cols-[250px_1fr_200px] lg:items-center lg:gap-8"
      style={{
        background: isExam ? "var(--color-ink-panel)" : "var(--color-surface)",
        color: isExam ? "#fff" : "var(--color-ink)",
        borderColor: isExam ? "var(--color-ink-panel)" : "var(--color-line)",
      }}
    >
      {/* Left: kicker + range */}
      <div>
        <div
          className="mb-2 font-mono text-[11.5px] tracking-[0.1em] uppercase"
          style={{
            color: isExam ? "rgba(255,255,255,0.55)" : "var(--color-ink-3)",
          }}
        >
          {kicker}
        </div>
        <div className="font-display text-[32px] leading-none tracking-[-0.025em]">
          {range}
        </div>
      </div>

      {/* Middle: title + desc + meta */}
      <div>
        <div className="mb-2 text-[18px] font-medium">{title}</div>
        <p
          className="max-w-[520px] text-[14px] leading-relaxed"
          style={{
            color: isExam ? "rgba(255,255,255,0.65)" : "var(--color-ink-3)",
          }}
        >
          {desc}
        </p>
        <div
          className="mt-3.5 flex gap-[18px] text-[13px]"
          style={{
            color: isExam ? "rgba(255,255,255,0.55)" : "var(--color-ink-3)",
          }}
        >
          <span>{type}</span>
          <span>·</span>
          <span>{pluralItems(items)}</span>
          <span>·</span>
          <span>{time}</span>
        </div>
      </div>

      {/* Right: progress / badge / button */}
      <div className="flex flex-col items-start gap-3.5 lg:items-end">
        {disabled ? (
          <div
            className="rounded-pill inline-flex items-center px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-ink-3)",
            }}
          >
            в разработке
          </div>
        ) : (
          <>
            {!isExam && progress != null && (
              <div className="w-[120px]">
                <div
                  className="mb-1 flex justify-between text-[11.5px]"
                  style={{
                    color: isExam
                      ? "rgba(255,255,255,0.5)"
                      : "var(--color-ink-3)",
                  }}
                >
                  <span>пройдено</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div
                  className="h-1 overflow-hidden rounded-sm"
                  style={{
                    background: isExam
                      ? "rgba(255,255,255,0.15)"
                      : "var(--color-surface-2)",
                  }}
                >
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${progress * 100}%`,
                      background: isExam ? "#fff" : "var(--color-accent)",
                    }}
                  />
                </div>
              </div>
            )}
            <div
              className="rounded-pill inline-flex h-9 items-center justify-center px-4 text-[13.5px] font-medium"
              style={{
                background: isExam ? "#fff" : "var(--color-ink)",
                color: isExam ? "#0a1733" : "var(--color-on-ink)",
              }}
            >
              Начать →
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (disabled || isExam) {
    return <div>{inner}</div>;
  }

  return (
    <Link
      href={href ?? "#"}
      className="block transition-transform hover:-translate-y-0.5"
    >
      {inner}
    </Link>
  );
}
