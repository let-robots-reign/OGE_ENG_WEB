"use client";

import { SectionEyebrow } from "./section-eyebrow";

type Tone = "ok" | "warn" | "neutral";

interface ActivityRow {
  id: number;
  createdAt: Date;
  kind: string;
  tone: Tone;
  title: string;
  timeSpent: number | null;
  correct: number | null;
  max: number | null;
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  ok: { bg: "var(--color-ok-soft)", fg: "var(--color-ok)" },
  warn: { bg: "var(--color-warn-soft)", fg: "var(--color-warn)" },
  neutral: { bg: "var(--color-surface-2)", fg: "var(--color-ink-3)" },
};

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
              <th className={`${thClass} w-[150px]`}>Раздел</th>
              <th className={thClass}>Задание</th>
              <th className={`${thClass} w-[130px]`}>Длительность</th>
              <th className={`${thClass} w-[120px]`}>Результат</th>
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
                const tone = TONES[r.tone];
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
                        className="rounded-pill px-2.5 py-1 text-[12px] font-medium"
                        style={{ background: tone.bg, color: tone.fg }}
                      >
                        {r.kind}
                      </span>
                    </td>
                    <td className={`${tdClass} text-ink`}>{r.title}</td>
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
