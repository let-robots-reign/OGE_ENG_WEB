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
  color,
  mono,
}: {
  label: string;
  value: string | number;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div
        className={mono ? "font-mono" : "font-display"}
        style={{
          fontSize: mono ? 22 : 28,
          letterSpacing: "-0.02em",
          color: color ?? "var(--color-ink)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        className="text-ink-3 mt-1.5 uppercase"
        style={{ fontSize: 12, letterSpacing: ".08em" }}
      >
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
    <Modal size={520} onClose={onClose}>
      <div
        className="grid grid-cols-1 items-center justify-items-center gap-5 px-7 pt-8 pb-6 text-center sm:grid-cols-[auto_1fr] sm:justify-items-start sm:gap-7 sm:px-10 sm:pt-9 sm:text-left"
        style={{
          background:
            "linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%)",
        }}
      >
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
            className="mt-2.5 inline-block font-mono uppercase"
            style={{
              fontSize: 11,
              letterSpacing: ".1em",
              padding: "5px 12px",
              borderRadius: 999,
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
            gridTemplateColumns: `repeat(${segments.length}, 1fr)`,
          }}
        >
          {segments.map((s) => (
            <div key={s.label}>
              <div
                className="font-mono"
                style={{
                  fontSize: 17,
                  fontWeight: 500,
                  color: SEGMENT_TONE[s.tone],
                  letterSpacing: "-0.01em",
                }}
              >
                {s.value}
              </div>
              <div
                className="text-ink-3 mt-1 uppercase"
                style={{ fontSize: 11, letterSpacing: ".08em" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="border-line grid border-t px-7 py-5 sm:px-10"
          style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
        >
          <Stat label="верно" value={correct} color="var(--color-ok)" />
          <Stat
            label="ошибок"
            value={total - correct}
            color="var(--color-err)"
          />
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
            className="rounded-pill text-on-ink inline-flex h-11 flex-[2] items-center justify-center px-[22px] text-[15px] font-medium transition-transform hover:-translate-y-px"
            style={{ background: "var(--color-ink)" }}
          >
            Посмотреть пояснения →
          </button>
        </div>
      </div>
    </Modal>
  );
}
