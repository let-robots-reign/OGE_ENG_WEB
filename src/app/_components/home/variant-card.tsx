import { IconArrow } from "./icons";

type Accent = "ok" | "warn" | "neutral";

interface VariantCardProps {
  num: string;
  state: string;
  scoreValue: number | null;
  scoreMax?: number;
  date?: string;
  accent: Accent;
}

const TONES: Record<Accent, { tag: string; text: string }> = {
  ok: { tag: "var(--color-ok-soft)", text: "var(--color-ok)" },
  warn: { tag: "var(--color-warn-soft)", text: "var(--color-warn)" },
  neutral: { tag: "var(--color-surface-2)", text: "var(--color-ink-3)" },
};

export function VariantCard({
  num,
  state,
  scoreValue,
  scoreMax = 35,
  date,
  accent,
}: VariantCardProps) {
  const t = TONES[accent];
  const inProgress = accent === "warn";
  const hasScore = typeof scoreValue === "number";

  return (
    <div className="bg-surface border-line relative flex min-h-[180px] flex-col gap-[18px] rounded-lg border p-[22px]">
      <div className="flex items-center justify-between">
        <span
          className="rounded-pill px-3 py-[5px] text-[12.5px] font-medium"
          style={{ background: t.tag, color: t.text }}
        >
          {state}
        </span>
        <div className="bg-surface-2 text-ink-2 grid h-9 w-9 place-items-center rounded-full">
          <IconArrow />
        </div>
      </div>
      <div className="font-display flex-1 text-[26px] leading-[1.1] tracking-[-0.02em]">
        Тренировочный вариант {num}
      </div>
      <div className="flex items-end justify-between gap-3">
        {hasScore ? (
          <div className="flex items-baseline gap-1">
            <span className="font-display text-ink text-[44px] leading-[0.9] tracking-[-0.03em]">
              {scoreValue}
            </span>
            <span className="text-ink-3 font-display text-[18px] tracking-[-0.02em]">
              / {scoreMax}
            </span>
          </div>
        ) : inProgress ? (
          <span className="text-ink-3 text-[13px]">продолжить →</span>
        ) : (
          <span className="text-ink-3 text-[13px]">начать экзамен</span>
        )}
        {date && (
          <span className="text-ink-3 font-mono text-[12.5px]">{date}</span>
        )}
      </div>
    </div>
  );
}
