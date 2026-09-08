"use client";

import Link from "next/link";
import { api } from "@/trpc/react";

export function MockExamsListView() {
  const { data, isLoading, error } = api.admin.getMockExams.useQuery();

  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-ink-3 text-[12px] font-medium tracking-[0.12em] uppercase">
              Конструктор
            </div>
            <h1 className="font-display mt-2 text-[38px] leading-none tracking-[-0.03em]">
              Варианты
            </h1>
          </div>
          <Link
            href="/admin/mock-exams/create"
            className="bg-ink text-on-ink rounded-pill inline-flex h-11 items-center px-5 text-[14px] font-medium"
          >
            Создать вариант →
          </Link>
        </div>

        <div className="border-line bg-surface overflow-hidden rounded-lg border">
          {isLoading ? (
            <div className="text-ink-3 p-10 text-center">Загрузка...</div>
          ) : error ? (
            <div className="text-err p-10 text-center">
              Не удалось загрузить варианты.
            </div>
          ) : !data?.length ? (
            <div className="p-12 text-center">
              <div className="font-display text-[26px]">Вариантов пока нет</div>
              <p className="text-ink-3 mt-2 text-[14px]">
                Создайте первый вариант из семи существующих заданий.
              </p>
            </div>
          ) : (
            <div className="divide-line divide-y">
              {data.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="bg-surface-2 font-display grid size-12 shrink-0 place-items-center rounded-md text-[20px]">
                    {String(exam.order).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[22px] leading-tight">
                      {exam.title}
                    </div>
                    <div className="text-ink-3 mt-1 text-[13px]">
                      обновлён{" "}
                      {new Intl.DateTimeFormat("ru-RU").format(exam.updatedAt)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exam.parts.map((part) => (
                        <span
                          key={part.slot}
                          className="bg-surface-2 text-ink-3 rounded-md px-2 py-1 font-mono text-[10.5px]"
                        >
                          {part.slot}: #
                          {part.audioTaskId ??
                            part.readingTaskId ??
                            part.uoeTaskChainId}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={`/admin/mock-exams/${exam.id}`}
                    className="rounded-pill border-line-2 inline-flex h-10 items-center justify-center border px-4 text-[14px] font-medium"
                  >
                    Редактировать
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
