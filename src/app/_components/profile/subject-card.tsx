interface SubjectCardProps {
  title: string;
  en: string;
  done: number;
  total: number;
  pct: number;
  avgCorrect: number;
  avgMax: number;
  pillClass: string;
  barClass: string;
}

export function SubjectCard({
  title,
  en,
  done,
  total,
  pct,
  avgCorrect,
  avgMax,
  pillClass,
  barClass,
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
          className={`rounded-pill inline-flex h-8 min-w-[52px] items-center justify-center px-3 font-mono text-[12px] font-medium tracking-[0.02em] whitespace-nowrap ${pillClass}`}
        >
          {pct}%
        </div>
      </div>

      <div className="flex-1" />

      <div>
        <div className="bg-surface-2 rounded-pill h-1.5 overflow-hidden">
          <div
            className={`rounded-pill h-full ${barClass}`}
            style={{ width: `${pct}%` }}
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
