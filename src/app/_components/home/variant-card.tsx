import { IconArrow } from "./icons";
import Link from "next/link";
import { getMockExamGradeTextClass } from "@/app/_utils/mockExamGrade";

type Accent = "ok" | "warn" | "neutral";

interface VariantCardProps {
  num: string;
  title?: string;
  state: string;
  scoreValue: number | null;
  scoreMax: number | null;
  date?: string;
  grade?: number | null;
  href: string;
  accent: Accent;
}

const TONES: Record<Accent, string> = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  neutral: "bg-surface-2 text-ink-3",
};

export function VariantCard({
  num,
  title,
  state,
  scoreValue,
  scoreMax,
  date,
  grade,
  href,
  accent,
}: VariantCardProps) {
  const hasScore =
    typeof scoreValue === "number" && typeof scoreMax === "number";

  return (
    <Link
      href={href}
      className="bg-surface border-line relative flex min-h-[180px] flex-col gap-[18px] rounded-lg border p-[22px] transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-pill px-3 py-[5px] text-[12.5px] font-medium ${TONES[accent]}`}
        >
          {state}
        </span>
        <div className="bg-surface-2 text-ink-2 grid h-9 w-9 place-items-center rounded-full">
          <IconArrow />
        </div>
      </div>
      <div className="font-display flex-1 text-[26px] leading-[1.1] tracking-[-0.02em]">
        {title ?? `Тренировочный вариант ${num}`}
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
        ) : (
          <span className="text-ink-3 text-[13px]">начать экзамен</span>
        )}
        <div className="text-right">
          {grade != null && (
            <div
              className={`${getMockExamGradeTextClass(grade)} text-[13px] font-medium`}
            >
              оценка {grade}
            </div>
          )}
          {date && (
            <span className="text-ink-3 font-mono text-[12.5px]">{date}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
