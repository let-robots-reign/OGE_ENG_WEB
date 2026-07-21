import Link from "next/link";
import { SampleChip } from "./sample-chip";
import { IconArrow } from "@/app/_components/home/icons";
import type { UoeMeta } from "./data";

interface TopicRowProps {
  topic: { id: number; title: string };
  meta: UoeMeta;
  href: string;
}

export function TopicRow({ topic, meta, href }: TopicRowProps) {
  const { en, desc, sample, score, mistakes, items } = meta;

  const barColor =
    score !== null
      ? score / items > 0.75
        ? "var(--color-ok)"
        : score / items > 0.5
          ? "var(--color-accent)"
          : "var(--color-accent-2)"
      : "var(--color-accent)";

  return (
    <Link
      href={href}
      className="group bg-surface border-line grid grid-cols-1 items-center gap-4 rounded-lg border px-5 py-5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md sm:px-7 sm:py-6 lg:grid-cols-[1.4fr_1.2fr_200px_80px] lg:gap-7"
    >
      {/* Col 1: en subtitle + title + desc */}
      <div>
        <div className="text-ink-3 mb-1.5 font-mono text-[11px] tracking-[0.1em] uppercase">
          {en}
        </div>
        <div className="font-display text-[30px] leading-[1.05] tracking-[-0.025em]">
          {topic.title}
        </div>
        <p className="text-ink-3 mt-2 max-w-[380px] text-[13.5px] leading-[1.45]">
          {desc}
        </p>
      </div>

      {/* Col 2: sample chip */}
      <div className="flex flex-col items-start gap-3">
        <SampleChip sample={sample} />
      </div>

      {/* Col 3: score / progress */}
      <div className="flex flex-col gap-3">
        {score !== null ? (
          <div>
            <div className="text-ink-3 mb-1 flex justify-between text-[12px]">
              <span>средний</span>
              <span className="text-ink font-mono font-medium">
                {score}/{items}
              </span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-sm"
              style={{ background: "var(--color-surface-2)" }}
            >
              <div
                className="h-full rounded-sm"
                style={{
                  width: `${(score / items) * 100}%`,
                  background: barColor,
                }}
              />
            </div>
            {mistakes !== undefined && mistakes > 0 && (
              <div className="text-accent-2 mt-1.5 font-mono text-[11.5px]">
                · {mistakes} ошибок к разбору
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-pill inline-flex items-center self-start px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{
              background: "var(--color-accent-2-soft)",
              color: "var(--color-accent-2)",
            }}
          >
            не пройдено
          </div>
        )}
      </div>

      {/* Col 4: arrow bubble */}
      <div className="hidden place-items-end lg:grid">
        <div className="bg-ink text-on-ink grid h-9 w-9 place-items-center rounded-full transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-[-12deg]">
          <IconArrow />
        </div>
      </div>
    </Link>
  );
}
