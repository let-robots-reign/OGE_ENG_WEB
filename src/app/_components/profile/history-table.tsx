"use client";

import Link from "next/link";
import { SectionEyebrow } from "./section-eyebrow";
import { getMockExamGradeTextClass } from "@/app/_utils/mockExamGrade";

interface ActivityRow {
  id: number;
  createdAt: Date;
  kind: string;
  title: string;
  timeSpent: number | null;
  correct: number | null;
  max: number | null;
  grade?: number | null;
  href?: string | null;
}

// Colour the section badge by training type (matching the home training
// cards), not by result. Falls back to a neutral pill for unmapped kinds.
const KIND_TONES: Record<string, string> = {
  Аудирование: "bg-tone-indigo text-tone-indigo-ink",
  Чтение: "bg-tone-warm text-tone-warm-ink",
  "Языковой материал": "bg-tone-mint text-tone-mint-ink",
  Письмо: "bg-tone-sand text-tone-sand-ink",
  Вариант: "bg-ink text-on-ink",
};

// Диагностика and any unmapped kind (Тренировка) fall back to a neutral pill —
// the tone palette has no distinct hue left, and these aren't core sections.
const NEUTRAL_TONE = "bg-surface-2 text-ink-3";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  })
    .format(d)
    .replace(".", "");
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return "—";
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} м`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h} ч ${m} м` : `${h} ч`;
}

const thClass =
  "bg-surface-2 px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-4";
const tdClass =
  "border-b border-line px-5 py-[18px] align-middle text-[14.5px]";

export function HistoryTable({ rows }: { rows: ActivityRow[] }) {
  return (
    <section className="mb-[72px]">
      <div className="mb-5 flex items-end justify-between">
        <SectionEyebrow>04 — история действий</SectionEyebrow>
      </div>
      <div className="border-line bg-surface overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className={`${thClass} w-[130px]`}>Когда</th>
              <th className={`${thClass} w-[200px]`}>Раздел</th>
              <th className={thClass}>Задание</th>
              <th className={`${thClass} w-[130px]`}>Длительность</th>
              <th className={`${thClass} w-[130px]`}>Результат</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-ink-3 px-5 py-10 text-center text-[14px]"
                >
                  Пока нет действий. Начните тренировку, и здесь появится ваша
                  история.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                return (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-[rgba(79,70,255,0.025)] last:[&>td]:border-b-0"
                  >
                    <td className={tdClass}>
                      <div className="text-ink font-medium">
                        {formatDate(r.createdAt)}
                      </div>
                      <div className="text-ink-3 mt-0.5 font-mono text-[12.5px]">
                        {formatTime(r.createdAt)}
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`rounded-pill inline-block px-2.5 py-1 text-[12px] font-medium whitespace-nowrap ${KIND_TONES[r.kind] ?? NEUTRAL_TONE}`}
                      >
                        {r.kind}
                      </span>
                    </td>
                    <td className={`${tdClass} text-ink`}>
                      {r.href ? (
                        <Link
                          href={r.href}
                          className="text-accent font-medium hover:underline"
                        >
                          {r.title} →
                        </Link>
                      ) : (
                        r.title
                      )}
                    </td>
                    <td
                      className={`${tdClass} text-ink-2 font-mono text-[13px]`}
                    >
                      {formatDuration(r.timeSpent)}
                    </td>
                    <td className={tdClass}>
                      {r.correct != null && r.max != null ? (
                        <span className="font-display text-[19px] leading-none tracking-[-0.02em]">
                          {r.correct}
                          <span className="text-ink-3 text-[13px] not-italic">
                            {" "}
                            / {r.max}
                          </span>
                          <br />
                          {r.grade != null && (
                            <span
                              className={`${getMockExamGradeTextClass(r.grade)} text-[12px] not-italic`}
                            >
                              оценка {r.grade}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-ink-3 text-[13px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
