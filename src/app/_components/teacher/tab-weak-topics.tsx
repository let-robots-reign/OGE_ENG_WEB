"use client";

import { api } from "@/trpc/react";
import { TabEmpty, TabLoading } from "./tab-primitives";
import { pluralize } from "@/app/_utils/pluralize";

const SECTION_PILL: Record<string, string> = {
  audio: "bg-tone-indigo text-tone-indigo-ink",
  reading: "bg-tone-warm text-tone-warm-ink",
  "use-of-english": "bg-tone-mint text-tone-mint-ink",
  writing: "bg-tone-sand text-tone-sand-ink",
};

// Bar/number colour by severity: red ≥50%, amber ≥30%, otherwise ok-green.
function severity(errorPercent: number): { bar: string; text: string } {
  if (errorPercent >= 50) return { bar: "bg-err", text: "text-err" };
  if (errorPercent >= 30) return { bar: "bg-warn", text: "text-warn" };
  return { bar: "bg-ok", text: "text-ok" };
}

export function TabWeakTopics({ classroomId }: { classroomId: string }) {
  const { data, isLoading } = api.teacher.classWeakTopics.useQuery({
    classroomId,
  });

  if (isLoading || !data) return <TabLoading />;
  if (data.topics.length === 0) {
    return (
      <TabEmpty>
        Недостаточно данных за последние 30 дней — слабые темы появятся, когда
        ученики начнут ошибаться в заданиях.
      </TabEmpty>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="font-display m-0 text-[22px] tracking-[-0.02em]">
          Где класс ошибается чаще всего
        </h2>
        <span className="text-ink-3 text-[13.5px]">
          по темам за последние 30 дней
        </span>
      </div>

      <div className="border-line bg-surface overflow-hidden rounded-lg border">
        <div className="text-ink-4 bg-surface-2 grid grid-cols-[18px_1fr_auto] gap-3 px-4 py-3 font-mono text-[11px] tracking-[0.1em] uppercase sm:grid-cols-[22px_1fr_200px_130px] sm:gap-4 sm:px-6">
          <span>#</span>
          <span>Тема</span>
          {/* Dedicated bar column only exists on sm+; on mobile the bar sits
              under the topic title, so this header label is hidden there. */}
          <span className="hidden sm:block">Доля ошибок</span>
          <span className="text-right">Попыток</span>
        </div>

        {data.topics.map((t, i) => {
          const sev = severity(t.errorPercent);
          const bar = (
            <div className="bg-surface-2 rounded-pill h-2 overflow-hidden">
              <div
                className={`rounded-pill h-full ${sev.bar}`}
                style={{ width: `${t.errorPercent}%` }}
              />
            </div>
          );
          return (
            <div
              key={t.topicId}
              className="border-line grid grid-cols-[18px_1fr_auto] items-center gap-3 border-b px-4 py-4 last:border-b-0 sm:grid-cols-[22px_1fr_200px_130px] sm:gap-4 sm:px-6"
            >
              <span className="font-display text-ink-4 text-[16px]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="text-ink font-medium">{t.title}</div>
                <span
                  className={`rounded-pill mt-1.5 inline-block px-2.5 py-1 text-[12px] font-medium ${SECTION_PILL[t.section] ?? "bg-surface-2 text-ink-3"}`}
                >
                  {t.sectionLabel}
                </span>
                {/* Mobile: the bar lives under the title. Hidden as its own
                    display:none element removes it from the grid on mobile. */}
                <div className="mt-2.5 sm:hidden">{bar}</div>
              </div>
              <div className="hidden sm:block">{bar}</div>
              <div className="text-right">
                <span className={`font-display text-[20px] ${sev.text}`}>
                  {t.errorPercent}%
                </span>
                <div className="text-ink-4 mt-0.5 font-mono text-[12px]">
                  {t.attempts}{" "}
                  {pluralize(t.attempts, "попытка", "попытки", "попыток")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
