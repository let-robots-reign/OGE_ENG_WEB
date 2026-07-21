"use client";

import type { ReactNode } from "react";

interface TranslateCardProps {
  n: number;
  text: string;
  topics: string[];
  value: string;
  onChange: (value: string) => void;
}

const formatText = (text: string): ReactNode[] => {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <b key={i}>{part.slice(2, -2)}</b>;
    }
    return part;
  });
};

export function TranslateCard({
  n,
  text,
  topics,
  value,
  onChange,
}: TranslateCardProps) {
  return (
    <div className="border-line bg-surface rounded-lg border p-5 sm:p-7">
      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="bg-ink text-on-ink grid h-8 w-8 place-items-center rounded-[10px] font-mono text-[13px] font-medium">
          {n}
        </div>
        <span className="text-ink-3 font-mono text-[11px] tracking-[0.1em] uppercase">
          Перевод {n}
        </span>
      </div>

      <div className="text-ink [&_b]:text-accent text-[16px] leading-relaxed sm:text-[18px] [&_b]:font-semibold [&_p]:m-0">
        {formatText(text)}
      </div>

      {topics.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {topics.map((t, i) => (
            <span
              key={i}
              className="bg-accent-soft text-accent rounded-pill px-2.5 py-1 font-mono text-[11px]"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Введите ваш перевод..."
        rows={2}
        className="border-line-2 bg-surface text-ink placeholder:text-ink-4 focus:border-accent mt-4 w-full resize-y rounded-[10px] border-[1.5px] px-3.5 py-3 text-[15px] transition-colors outline-none sm:text-[16px]"
      />
    </div>
  );
}
