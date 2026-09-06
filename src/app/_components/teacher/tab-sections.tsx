"use client";

import { api } from "@/trpc/react";
import { TabEmpty, TabLoading } from "./tab-primitives";
import { pluralize } from "@/app/_utils/pluralize";

type SubjectKey = "audio" | "reading" | "use-of-english" | "writing";

const META: Record<
  SubjectKey,
  { title: string; en: string; pill: string; bar: string }
> = {
  audio: {
    title: "Аудирование",
    en: "Listening",
    pill: "bg-tone-indigo text-tone-indigo-ink",
    bar: "bg-tone-indigo-ink",
  },
  reading: {
    title: "Чтение",
    en: "Reading",
    pill: "bg-tone-warm text-tone-warm-ink",
    bar: "bg-tone-warm-ink",
  },
  "use-of-english": {
    title: "Языковой материал",
    en: "Use of English",
    pill: "bg-tone-mint text-tone-mint-ink",
    bar: "bg-tone-mint-ink",
  },
  writing: {
    title: "Письмо",
    en: "Writing",
    pill: "bg-tone-sand text-tone-sand-ink",
    bar: "bg-tone-sand-ink",
  },
};

export function TabSections({ classroomId }: { classroomId: string }) {
  const { data, isLoading } = api.teacher.classSections.useQuery({
    classroomId,
  });

  if (isLoading || !data) return <TabLoading />;

  const hasData = data.sections.some((s) => s.pct !== null);
  if (!hasData) {
    return (
      <TabEmpty>
        Ученики ещё не тренировали разделы — средние баллы появятся, как только
        появятся результаты.
      </TabEmpty>
    );
  }

  const weakLabel = data.weakestKey ? META[data.weakestKey].title : null;

  return (
    <div>
      <div className="bg-ink-panel mb-5 flex flex-col items-start justify-between gap-4 rounded-lg p-6 sm:flex-row sm:items-center">
        <div>
          <div className="font-mono text-[10.5px] tracking-[0.1em] text-[color:var(--color-on-ink-muted)] uppercase">
            Средний балл класса
          </div>
          <div className="font-display mt-2 text-[52px] leading-none tracking-[-0.03em] text-[color:var(--color-on-ink)]">
            {data.avgPercent ?? "—"}
            {data.avgPercent != null && (
              <span className="text-[26px] text-[color:var(--color-on-ink-muted)]">
                %
              </span>
            )}
          </div>
        </div>
        <div className="max-w-[360px] text-[13.5px] leading-[1.5] text-[color:var(--color-on-ink-muted)]">
          Средний балл усреднён по ученикам, которые занимались; объём — число
          тренировок по разделу (не отдельных заданий).
          {weakLabel && (
            <>
              {" "}
              Слабее всего —{" "}
              <span className="font-medium text-[color:var(--color-on-ink)]">
                {weakLabel}
              </span>
              .
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.sections.map((s) => {
          const meta = META[s.key];
          const isWeak = s.key === data.weakestKey;
          const pct = s.pct ?? 0;
          return (
            <div
              key={s.key}
              className={`bg-surface flex min-h-[236px] flex-col gap-[18px] rounded-lg border p-6 ${
                isWeak ? "border-warn" : "border-line"
              }`}
              style={
                isWeak
                  ? { boxShadow: "0 0 0 1px var(--color-warn)" }
                  : undefined
              }
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-[23px] leading-[1.1] tracking-[-0.02em]">
                    {meta.title}
                  </div>
                  <div className="font-display text-ink-3 mt-1 text-[13px]">
                    {meta.en}
                  </div>
                </div>
                <span
                  className={`rounded-pill inline-flex h-8 min-w-[52px] items-center justify-center px-3 font-mono text-[12px] font-medium ${isWeak ? "bg-warn-soft text-warn" : meta.pill}`}
                >
                  {s.pct != null ? `${s.pct}%` : "—"}
                </span>
              </div>

              {isWeak && (
                <span className="rounded-pill bg-warn-soft text-warn self-start px-2.5 py-1 text-[12px] font-medium">
                  слабее всего
                </span>
              )}

              <div className="flex-1" />

              <div>
                <div className="bg-surface-2 rounded-pill h-1.5 overflow-hidden">
                  <div
                    className={`rounded-pill h-full ${isWeak ? "bg-warn" : meta.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-ink-3 mt-2.5 flex justify-between gap-2 text-[12.5px]">
                  <span>
                    <span className="text-ink font-medium">
                      {s.submissions}
                    </span>{" "}
                    {pluralize(
                      s.submissions,
                      "тренировка",
                      "тренировки",
                      "тренировок",
                    )}
                  </span>
                  <span>
                    <span className="text-ink-3 font-medium">
                      {s.studentsStudied}
                    </span>{" "}
                    из {s.totalStudents} занимались
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
