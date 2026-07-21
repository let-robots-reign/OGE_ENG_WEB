import Link from "next/link";
import { formatClock } from "@/app/_utils/formatClock";

function SubHeaderLeft({
  backHref,
  ariaLabel,
  section,
  title,
}: {
  backHref: string;
  ariaLabel: string;
  section: string;
  title: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3.5">
      <Link
        href={backHref}
        aria-label={ariaLabel}
        className="bg-surface border-line text-ink-2 grid shrink-0 place-items-center rounded-full border"
        style={{ width: 38, height: 38 }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </Link>
      <div className="min-w-0">
        <div className="text-ink-3 font-mono text-[11px] tracking-[0.1em] uppercase">
          {section}
        </div>
        <div className="truncate text-[15px] font-medium">{title}</div>
      </div>
    </div>
  );
}

interface SectionSubHeaderProps {
  section: string;
  title: string;
  backHref?: string;
}

export function SectionSubHeader({
  section,
  title,
  backHref = "/",
}: SectionSubHeaderProps) {
  return (
    <div className="border-line bg-bg sticky top-0 z-20 border-b">
      <div className="flex items-center px-5 py-[18px] sm:px-8 lg:px-14">
        <SubHeaderLeft
          backHref={backHref}
          ariaLabel="Назад"
          section={section}
          title={title}
        />
      </div>
    </div>
  );
}

interface TrainingSubHeaderProps {
  backHref: string;
  section: string;
  taskTitle: string;
  answeredCount: number;
  total: number;
  elapsedSec: number;
  onShowInstruction: () => void;
}

export function TrainingSubHeader({
  backHref,
  section,
  taskTitle,
  answeredCount,
  total,
  elapsedSec,
  onShowInstruction,
}: TrainingSubHeaderProps) {
  return (
    <div className="border-line bg-bg sticky top-0 z-20 border-b">
      <div className="mx-auto flex items-center justify-between gap-3 px-5 py-3.5 sm:px-8 lg:px-14">
        <SubHeaderLeft
          backHref={backHref}
          ariaLabel="К списку заданий"
          section={section}
          title={taskTitle}
        />

        <div
          className="rounded-pill border-line bg-surface inline-flex items-center gap-2.5 border"
          style={{ padding: "8px 14px" }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 50,
              background: "var(--color-accent-2)",
              boxShadow: "0 0 0 4px var(--color-accent-2-soft)",
            }}
          />
          <span
            className="font-mono text-[15px]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatClock(elapsedSec)}
          </span>
          <span className="text-ink-3 hidden text-[12px] sm:inline">
            прошло
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="text-ink-3 hidden items-center gap-2.5 text-[13.5px] sm:flex">
            <span className="font-mono">
              {answeredCount} / {total}
            </span>
            <span>отвечено</span>
          </div>
          <button
            type="button"
            onClick={onShowInstruction}
            className="rounded-pill border-line-2 hidden h-9 items-center justify-center border px-4 text-[14px] font-medium sm:inline-flex"
          >
            Инструкция
          </button>
        </div>
      </div>
    </div>
  );
}
