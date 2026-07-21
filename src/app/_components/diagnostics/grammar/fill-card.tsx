"use client";

interface FillCardProps {
  n: number;
  text: string;
  values: string[];
  onChange: (index: number, value: string) => void;
}

const BLANK = "_____________";

export function FillCard({ n, text, values, onChange }: FillCardProps) {
  const parts = text.split(BLANK);

  return (
    <div className="border-line bg-surface rounded-lg border p-5 sm:p-7">
      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="bg-ink text-on-ink grid h-8 w-8 place-items-center rounded-[10px] font-mono text-[13px] font-medium">
          {n}
        </div>
        <span className="text-ink-3 font-mono text-[11px] tracking-[0.1em] uppercase">
          Задание {n}
        </span>
      </div>

      <div className="text-ink text-[16px] leading-[2.4] sm:text-[18px]">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                type="text"
                value={values[i] ?? ""}
                onChange={(e) => onChange(i, e.target.value)}
                aria-label={`Пропуск ${i + 1}`}
                className="border-line-2 bg-surface text-ink focus:border-accent mx-1 inline-block w-[120px] rounded-[8px] border-[1.5px] px-2.5 py-1 align-middle font-mono text-[14px] transition-colors outline-none sm:w-[150px] sm:text-[15px]"
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
