"use client";

import type { ResultSegment } from "../shared/result-modal";

const TONE: Record<ResultSegment["tone"], string> = {
  ok: "var(--color-ok)",
  warn: "var(--color-accent-2)",
  err: "var(--color-err)",
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
    <div
      className="mb-8 flex flex-col gap-5 rounded-lg p-6 text-white sm:p-7 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-7"
      style={{ background: "var(--color-ink-panel)" }}
    >
      <div>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 11,
            letterSpacing: ".1em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          проверено · общий балл
        </div>
        <div className="font-display mt-1.5 text-[44px] leading-none tracking-[-0.025em] sm:text-[60px]">
          {correct}
          <span style={{ color: "rgba(255,255,255,0.4)" }}>/{total}</span>
        </div>
      </div>

      <div
        className="flex gap-px overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: 1,
        }}
      >
        {segments.map((s) => (
          <div
            key={s.label}
            className="flex-1"
            style={{
              padding: "12px 14px",
              background: "var(--color-ink-panel)",
            }}
          >
            <div
              className="mb-1 uppercase"
              style={{
                fontSize: 11,
                letterSpacing: ".08em",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {s.label}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 17, fontWeight: 500, color: TONE[s.tone] }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="rounded-pill inline-flex items-center justify-center text-[15px] font-medium"
        style={{
          background: "#fff",
          color: "#0a1733",
          height: 44,
          padding: "0 22px",
        }}
      >
        Пройти ещё раз
      </button>
    </div>
  );
}
