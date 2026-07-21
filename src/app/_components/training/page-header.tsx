interface Stat {
  label: string;
  value: string;
  suffix?: string;
}

interface PageHeaderProps {
  title: string;
  desc: string;
  stats: Stat[];
}

export function PageHeader({ title, desc, stats }: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {/*<div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase mb-3">*/}
        {/*  <span className="bg-accent h-1.5 w-1.5 rounded-full" />*/}
        {/*  {eyebrow}*/}
        {/*</div>*/}
        <h1 className="font-display mt-3 text-[44px] leading-none tracking-[-0.025em] sm:text-[64px] lg:text-[88px]">
          {title}
        </h1>
        <p className="text-ink-3 mt-3.5 max-w-[560px] text-[16px] leading-relaxed">
          {desc}
        </p>
      </div>

      {stats.length > 0 && (
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-surface border-line rounded-lg border px-5 py-3.5"
              >
                <div className="text-ink-3 font-mono text-[12px] tracking-[0.05em] uppercase">
                  {s.label}
                </div>
                <div className="font-display mt-1 text-[30px] leading-none tracking-[-0.02em]">
                  {s.value}
                  {s.suffix && (
                    <span className="text-ink-3 text-[18px]"> {s.suffix}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
