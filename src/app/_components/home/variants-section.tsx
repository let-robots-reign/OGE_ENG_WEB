"use client";

import { api } from "@/trpc/react";
import { VariantCard } from "./variant-card";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" })
    .format(date)
    .replace(".", "");

export function VariantsSection() {
  const { data, isLoading, error } = api.mockExams.list.useQuery();

  return (
    <section id="variants" className="mb-[72px]">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            02 — целиком
          </div>
          <h2 className="font-display m-0 mt-2 text-[30px] leading-none font-normal tracking-[-0.025em] sm:text-[38px]">
            Варианты
          </h2>
        </div>
        <div className="text-ink-3 hidden text-[14px] sm:block">
          Полный экзамен с таймером · 2 часа
        </div>
      </div>

      {isLoading ? (
        <div className="text-ink-3 border-line rounded-lg border p-8 text-center text-[14px]">
          Загружаем варианты...
        </div>
      ) : error ? (
        <div className="text-err border-line rounded-lg border p-8 text-center text-[14px]">
          Не удалось загрузить варианты.
        </div>
      ) : !data?.length ? (
        <div className="text-ink-3 border-line bg-surface rounded-lg border p-8 text-center text-[14px]">
          Варианты скоро появятся.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {data.map((exam) => (
            <VariantCard
              key={exam.id}
              num={String(exam.order).padStart(2, "0")}
              title={exam.title}
              state={exam.latestResult ? "Сдан" : "Не начат"}
              scoreValue={exam.latestResult?.correct ?? null}
              scoreMax={exam.latestResult?.total ?? null}
              grade={exam.latestResult?.grade}
              date={
                exam.latestResult ? formatDate(exam.latestResult.createdAt) : ""
              }
              href={`/mock-exams/${exam.id}`}
              accent={exam.latestResult ? "ok" : "neutral"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
