interface SubjectCardProps {
  title: string;
  en: string;
  done: number;
  total: number;
  pct: number;
  avgCorrect: number;
  avgMax: number;
  tone: { bg: string; ink: string };
}

export function SubjectCard({
  title,
  en,
  done,
  total,
  pct,
  avgCorrect,
  avgMax,
  tone,
}: SubjectCardProps) {
  return (
    <div className="border-line bg-surface flex min-h-[230px] flex-col gap-[18px] rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-[24px] leading-[1.1] tracking-[-0.02em]">
            {title}
          </div>
          <div className="font-display text-ink-3 mt-1 text-[13px]">{en}</div>
        </div>
        <div
          className="rounded-pill inline-flex h-8 min-w-[52px] items-center justify-center px-3 font-mono text-[12px] font-medium tracking-[0.02em] whitespace-nowrap"
          style={{ background: tone.bg, color: tone.ink }}
        >
          {pct}%
        </div>
      </div>

      <div className="flex-1" />

      <div>
        <div
          className="rounded-pill h-1.5 overflow-hidden"
          style={{ background: "var(--color-surface-2)" }}
        >
          <div
            className="rounded-pill h-full"
            style={{ width: `${pct}%`, background: tone.ink }}
          />
        </div>
        <div className="text-ink-3 mt-2.5 flex justify-between text-[12.5px]">
          <span>
            <span className="text-ink font-medium">{done}</span> / {total}{" "}
            заданий
          </span>
          <span className="font-mono">
            {done > 0 ? `средн. ${avgCorrect}/${avgMax}` : "средн. —"}
          </span>
        </div>
      </div>
    </div>
  );
}
