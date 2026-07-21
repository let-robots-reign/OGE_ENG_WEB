import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrow } from "./icons";

const TONES = {
  indigo: {
    bg: "var(--color-tone-indigo)",
    ink: "var(--color-tone-indigo-ink)",
  },
  warm: { bg: "var(--color-tone-warm)", ink: "var(--color-tone-warm-ink)" },
  mint: { bg: "var(--color-tone-mint)", ink: "var(--color-tone-mint-ink)" },
  sand: { bg: "var(--color-tone-sand)", ink: "var(--color-tone-sand-ink)" },
} as const;

type Tone = keyof typeof TONES;

interface TrainingCardProps {
  title: string;
  en: string;
  icon: ReactNode;
  tone: Tone;
  href: string;
}

export function TrainingCard({
  title,
  en,
  icon,
  tone,
  href,
}: TrainingCardProps) {
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className="group bg-surface border-line relative flex min-h-[160px] flex-col gap-4 rounded-lg border p-[18px] no-underline transition-shadow hover:shadow-md sm:min-h-[190px] sm:p-[22px]"
    >
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] sm:h-14 sm:w-14"
        style={{ background: t.bg, color: t.ink }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-display text-[22px] leading-[1.05] tracking-[-0.02em] sm:text-[28px]">
          {title}
        </div>
        <div className="text-ink-3 font-display mt-1 text-[13px]">{en}</div>
      </div>
      <div className="bg-ink text-on-ink absolute top-[18px] right-[18px] grid h-9 w-9 place-items-center rounded-full transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-[-12deg] sm:top-[22px] sm:right-[22px]">
        <IconArrow />
      </div>
    </Link>
  );
}
