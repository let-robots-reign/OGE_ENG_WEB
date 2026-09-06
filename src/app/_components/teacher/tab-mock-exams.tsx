"use client";

import Link from "next/link";
import { api } from "@/trpc/react";
import { getMockExamGradeBadgeClass } from "@/app/_utils/mockExamGrade";
import { displayName, formatShortDate, formatTime } from "./utils";
import { StatCard, TabEmpty, TabLoading } from "./tab-primitives";
import { pluralize } from "@/app/_utils/pluralize";

const GRADES = [2, 3, 4, 5] as const;

const thClass =
  "bg-surface-2 px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-4";
const tdClass = "border-b border-line px-5 py-[15px] align-middle text-[14.5px]";

export function TabMockExams({ classroomId }: { classroomId: string }) {
  const { data, isLoading } = api.teacher.classMockExams.useQuery({
    classroomId,
  });

  if (isLoading || !data) return <TabLoading />;
  if (data.total === 0) {
    return (
      <TabEmpty>
        В классе ещё нет пройденных пробников. Результаты появятся, как только
        ученики сдадут вариант.
      </TabEmpty>
    );
  }

  const maxCount = Math.max(...GRADES.map((g) => data.distribution[g]), 1);

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="border-line bg-surface rounded-lg border p-6">
          <div className="text-ink-4 mb-5 font-mono text-[10.5px] tracking-[0.1em] uppercase">
            Распределение оценок · {data.total}{" "}
            {pluralize(data.total, "попытка", "попытки", "попыток")}
          </div>
          <div className="grid h-[150px] grid-cols-4 items-end gap-4">
            {GRADES.map((g) => {
              const count = data.distribution[g];
              const h = Math.round((count / maxCount) * 118) + 4;
              return (
                <div
                  key={g}
                  className="flex h-full flex-col items-center justify-end gap-2.5"
                >
                  <span className="font-display text-[22px]">{count}</span>
                  <div
                    className={`w-full rounded-t-[10px] ${getMockExamGradeBadgeClass(g)}`}
                    style={{ height: h }}
                  />
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-[14px] font-semibold ${getMockExamGradeBadgeClass(g)}`}
                  >
                    {g}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-rows-2 gap-4">
          <StatCard
            label="Средняя оценка"
            value={data.avgGrade != null ? data.avgGrade.toLocaleString("ru-RU") : "—"}
          />
          <StatCard
            label="Средний процент"
            value={data.avgPercent ?? "—"}
            suffix={data.avgPercent != null ? "%" : undefined}
          />
        </div>
      </div>

      <div className="border-line bg-surface overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className={`${thClass} w-[120px]`}>Когда</th>
              <th className={thClass}>Ученик</th>
              <th className={thClass}>Вариант</th>
              <th className={`${thClass} w-[110px]`}>Результат</th>
              <th className={`${thClass} w-[90px]`}>Процент</th>
              <th className={`${thClass} w-[90px]`}>Оценка</th>
            </tr>
          </thead>
          <tbody>
            {data.attempts.map((a) => (
              <tr key={a.id} className="last:[&>td]:border-b-0">
                <td className={tdClass}>
                  <div className="text-ink font-medium">
                    {formatShortDate(a.createdAt)}
                  </div>
                  <div className="text-ink-3 mt-0.5 font-mono text-[12.5px]">
                    {formatTime(a.createdAt)}
                  </div>
                </td>
                <td className={tdClass}>
                  <Link
                    href={`/teacher/classrooms/${classroomId}/students/${a.studentId}`}
                    className="hover:text-accent font-medium transition-colors"
                  >
                    {displayName(a.studentName, a.studentEmail)}
                  </Link>
                  <div className="text-ink-3 truncate text-[12.5px]">
                    {a.studentEmail}
                  </div>
                </td>
                <td className={`${tdClass} text-ink font-medium`}>{a.title}</td>
                <td className={tdClass}>
                  {a.correct != null && a.max != null ? (
                    <span className="font-display text-[19px] tracking-[-0.02em]">
                      {a.correct}
                      <span className="text-ink-3 text-[13px]"> / {a.max}</span>
                    </span>
                  ) : (
                    <span className="text-ink-4">—</span>
                  )}
                </td>
                <td className={`${tdClass} text-ink-2 font-mono`}>
                  {a.percentage}%
                </td>
                <td className={tdClass}>
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-[14px] font-semibold ${getMockExamGradeBadgeClass(a.grade)}`}
                  >
                    {a.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.total > data.attempts.length && (
        <div className="text-ink-4 mt-3.5 text-center text-[13px]">
          показаны последние {data.attempts.length} из {data.total} попыток
        </div>
      )}
    </div>
  );
}
