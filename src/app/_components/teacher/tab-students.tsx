"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  avatarTone,
  displayName,
  formatTime,
  getInitials,
  relativeDay,
} from "./utils";
import { ClassEmptyState, StatCard, TabLoading } from "./tab-primitives";

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  );
}

const thClass =
  "bg-surface-2 px-5 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-4";
const tdClass =
  "border-b border-line px-5 py-[15px] align-middle text-[14.5px]";

function RemoveMember({
  classroomId,
  studentId,
  onRemoved,
}: {
  classroomId: string;
  studentId: string;
  onRemoved: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const remove = api.teacher.removeMember.useMutation({
    onSuccess: () => {
      setConfirming(false);
      onRemoved();
    },
  });

  if (confirming) {
    return (
      <span className="text-[12.5px] whitespace-nowrap">
        <button
          type="button"
          onClick={() => remove.mutate({ classroomId, studentId })}
          disabled={remove.isPending}
          className="text-err font-medium hover:underline disabled:opacity-60"
        >
          {remove.isPending ? "…" : "Убрать"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-ink-3 hover:text-ink ml-2"
        >
          Отмена
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      title="Убрать из класса"
      aria-label="Убрать из класса"
      onClick={() => setConfirming(true)}
      className="border-line text-ink-3 hover:bg-surface-2 hover:text-err grid h-8 w-8 place-items-center rounded-full border transition-colors"
    >
      <TrashIcon />
    </button>
  );
}

export function TabStudents({
  classroomId,
  inviteToken,
}: {
  classroomId: string;
  inviteToken: string;
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const { data, isLoading } = api.teacher.classActivity.useQuery({
    classroomId,
  });

  if (isLoading || !data) return <TabLoading />;
  if (data.summary.studentCount === 0)
    return <ClassEmptyState inviteToken={inviteToken} />;

  const { summary, students } = data;
  // Refetch every member-dependent tab and revalidate the server-rendered page
  // (its header shows the member count from getClassroom).
  const refresh = () => {
    void Promise.all([
      utils.teacher.classActivity.invalidate({ classroomId }),
      utils.teacher.classSections.invalidate({ classroomId }),
      utils.teacher.classMockExams.invalidate({ classroomId }),
      utils.teacher.classWeakTopics.invalidate({ classroomId }),
    ]);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Активны за неделю"
          value={summary.activeThisWeek}
          suffix={` / ${summary.studentCount}`}
        />
        <StatCard
          label="Средний балл"
          value={summary.avgPercent ?? "—"}
          suffix={summary.avgPercent != null ? "%" : undefined}
        />
        <StatCard label="Пробников пройдено" value={summary.mockCount} />
        <StatCard
          label="Средняя оценка"
          value={
            summary.avgGrade != null
              ? summary.avgGrade.toLocaleString("ru-RU")
              : "—"
          }
        />
      </div>

      <div className="border-line bg-surface overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className={thClass}>Ученик</th>
              <th className={`${thClass} w-[150px]`}>Последняя активность</th>
              <th className={`${thClass} w-[96px]`}>Стрик</th>
              <th className={`${thClass} w-[120px]`}>Активных дней</th>
              <th className={`${thClass} w-[110px]`}>Ср. балл</th>
              <th className={`${thClass} w-[150px]`} />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const inactive = !s.lastActivity;
              return (
                <tr key={s.userId} className="last:[&>td]:border-b-0">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${avatarTone(s.email || s.userId)}`}
                      >
                        {getInitials(s.name, s.email)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-ink font-medium">
                          {displayName(s.name, s.email)}
                        </div>
                        <div className="text-ink-3 truncate text-[12.5px]">
                          {s.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    {inactive ? (
                      <span className="text-ink-4">ещё не заходил</span>
                    ) : (
                      <>
                        <div className="text-ink font-medium">
                          {relativeDay(s.lastActivity)}
                        </div>
                        <div className="text-ink-3 mt-0.5 font-mono text-[12.5px]">
                          {formatTime(s.lastActivity!)}
                        </div>
                      </>
                    )}
                  </td>
                  <td className={tdClass}>
                    {s.currentStreak > 0 ? (
                      <span className="font-mono font-medium">
                        {s.currentStreak} дн
                      </span>
                    ) : (
                      <span className="text-ink-4 font-mono">—</span>
                    )}
                  </td>
                  <td className={`${tdClass} text-ink-2 font-mono`}>
                    {s.activeDays}
                  </td>
                  <td className={tdClass}>
                    {s.avgPercent != null ? (
                      <span
                        className={`font-display text-[19px] tracking-[-0.02em] ${s.avgPercent < 60 ? "text-warn" : ""}`}
                      >
                        {s.avgPercent}
                        <span className="text-ink-3 text-[13px]">%</span>
                      </span>
                    ) : (
                      <span className="text-ink-4 text-[13px]">—</span>
                    )}
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/teacher/classrooms/${classroomId}/students/${s.userId}`}
                        className="text-accent text-[14px] font-medium hover:underline"
                      >
                        Прогресс →
                      </Link>
                      <RemoveMember
                        classroomId={classroomId}
                        studentId={s.userId}
                        onRemoved={refresh}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
