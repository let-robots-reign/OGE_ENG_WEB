"use client";

import type { ResultSegment } from "../shared/result-modal";

const TONE_CLASS: Record<ResultSegment["tone"], string> = {
  ok: "text-ok",
  warn: "text-accent-2",
  err: "text-err",
};

interface ResultBannerProps {
  correct: number;
  total: number;
  segments: ResultSegment[];
  onRetry: () => void;
}

export function ResultBanner({
  correct,
  total,
  segments,
  onRetry,
}: ResultBannerProps) {
  return (
    <div className="bg-ink-panel mb-8 flex flex-col gap-5 rounded-lg p-6 text-white sm:p-7 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-7">
      <div>
        <div className="font-mono text-[11px] tracking-[0.1em] text-white/50 uppercase">
          проверено · общий балл
        </div>
        <div className="font-display mt-1.5 text-[44px] leading-none tracking-[-0.025em] sm:text-[60px]">
          {correct}
          <span className="text-white/40">/{total}</span>
        </div>
      </div>

      <div className="flex gap-px overflow-hidden rounded-[10px] bg-white/10 p-px">
        {segments.map((s) => (
          <div key={s.label} className="bg-ink-panel flex-1 px-3.5 py-3">
            <div className="mb-1 text-[11px] tracking-[0.08em] text-white/55 uppercase">
              {s.label}
            </div>
            <div
              className={`font-mono text-[17px] font-medium ${TONE_CLASS[s.tone]}`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="rounded-pill inline-flex h-11 items-center justify-center bg-white px-[22px] text-[15px] font-medium text-[#0a1733]"
      >
        Пройти ещё раз
      </button>
    </div>
  );
}
