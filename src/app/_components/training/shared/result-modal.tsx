"use client";

import { Modal } from "@/app/_components/Modal";

export interface ResultSegment {
  label: string;
  value: string;
  tone: "ok" | "warn" | "err";
}

interface ResultModalProps {
  correct: number;
  total: number;
  timeText?: string;
  segments?: ResultSegment[];
  onClose: () => void;
  onReview: () => void;
  size?: number;
}

const SEGMENT_TONE: Record<ResultSegment["tone"], string> = {
  ok: "var(--color-ok)",
  warn: "var(--color-accent-2)",
  err: "var(--color-err)",
};

function ScoreRing({
  value,
  max,
  tone,
}: {
  value: number;
  max: number;
  tone: string;
}) {
  const pct = max > 0 ? value / max : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth="10"
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text
        x="70"
        y="78"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="34"
        fill="var(--color-ink)"
      >
        {Math.round(pct * 100)}
        <tspan fontSize="18" fill="var(--color-ink-3)">
          %
        </tspan>
      </text>
    </svg>
  );
}

function Stat({
  label,
  value,
  colorClass = "text-ink",
  mono,
}: {
  label: string;
  value: string | number;
  colorClass?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div
        className={`leading-none tracking-[-0.02em] ${colorClass} ${mono ? "font-mono text-[22px]" : "font-display text-[28px]"}`}
      >
        {value}
      </div>
      <div className="text-ink-3 mt-1.5 text-[12px] tracking-[0.08em] uppercase">
        {label}
      </div>
    </div>
  );
}

export function ResultModal({
  correct,
  total,
  timeText,
  segments,
  onClose,
  onReview,
  size = 520,
}: ResultModalProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade =
    pct >= 80
      ? "отлично"
      : pct >= 60
        ? "хорошо"
        : pct >= 40
          ? "удовлетворительно"
          : "нужно повторить";
  const tone =
    pct >= 60
      ? "var(--color-ok)"
      : pct >= 40
        ? "var(--color-warn)"
        : "var(--color-err)";
  const toneSoft =
    pct >= 60
      ? "var(--color-ok-soft)"
      : pct >= 40
        ? "var(--color-warn-soft)"
        : "var(--color-err-soft)";

  return (
    <Modal size={size} onClose={onClose}>
      <div className="from-surface to-surface-2 grid grid-cols-1 items-center justify-items-center gap-5 bg-gradient-to-b px-7 pt-8 pb-6 text-center sm:grid-cols-[auto_1fr] sm:justify-items-start sm:gap-7 sm:px-10 sm:pt-9 sm:text-left">
        <ScoreRing value={correct} max={total} tone={tone} />
        <div>
          <div className="text-ink-3 mb-1.5 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: tone }}
            />
            ваш результат
          </div>
          <div className="font-display text-[52px] leading-none tracking-[-0.03em] sm:text-[72px]">
            {correct}
            <span className="text-ink-3"> / {total}</span>
          </div>
          <div
            className="rounded-pill mt-2.5 inline-block px-3 py-1 font-mono text-[11px] tracking-[0.1em] uppercase"
            style={{
              background: toneSoft,
              color: tone,
            }}
          >
            {grade} · {pct}%
          </div>
        </div>
      </div>

      {segments ? (
        <div
          className="border-line grid gap-1 border-t px-7 py-[18px] sm:px-10"
          style={{
            gridTemplateColumns: `repeat(${segments.length + (timeText ? 1 : 0)}, 1fr)`,
          }}
        >
          {segments.map((s) => (
            <div key={s.label}>
              <div
                className="font-mono text-[17px] font-medium tracking-[-0.01em]"
                style={{
                  color: SEGMENT_TONE[s.tone],
                }}
              >
                {s.value}
              </div>
              <div className="text-ink-3 mt-1 text-[11px] tracking-[0.08em] uppercase">
                {s.label}
              </div>
            </div>
          ))}
          {timeText && <Stat label="время" value={timeText} mono />}
        </div>
      ) : (
        <div className="border-line grid grid-cols-3 border-t px-7 py-5 sm:px-10">
          <Stat label="верно" value={correct} colorClass="text-ok" />
          <Stat label="ошибок" value={total - correct} colorClass="text-err" />
          {timeText && <Stat label="время" value={timeText} mono />}
        </div>
      )}

      <div className="border-line border-t px-7 py-7 sm:px-10 sm:pb-8">
        <div className="text-ink-2 text-[15px] leading-relaxed">
          Разберите ошибки и обратите внимание на ключевые слова.
        </div>
        <div className="mt-[22px] flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-pill border-line-2 inline-flex h-11 flex-1 items-center justify-center border px-[22px] text-[15px] font-medium transition-transform hover:-translate-y-px"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={onReview}
            className="bg-ink rounded-pill text-on-ink inline-flex h-11 flex-[2] items-center justify-center px-[22px] text-[15px] font-medium transition-transform hover:-translate-y-px"
          >
            Посмотреть пояснения →
          </button>
        </div>
      </div>
    </Modal>
  );
}
