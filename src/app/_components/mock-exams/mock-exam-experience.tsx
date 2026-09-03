"use client";

import { useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { api, type RouterOutputs } from "@/trpc/react";
import { MockExamRunner } from "./mock-exam-runner";
import { MockExamResultView } from "./mock-exam-result-view";

export function MockExamExperience({ id }: { id: number }) {
  const { data, isLoading, error } = api.mockExams.getSummary.useQuery({ id });
  const [attempt, setAttempt] = useState<
    RouterOutputs["mockExams"]["start"] | null
  >(null);
  const startMutation = api.mockExams.start.useMutation({
    onSuccess: (started) => {
      posthog.capture("mock_exam_started", { mock_exam_id: id });
      setAttempt(started);
    },
  });

  if (attempt) return <MockExamRunner attempt={attempt} />;
  if (isLoading) {
    return (
      <div className="text-ink-3 p-16 text-center">Загрузка варианта...</div>
    );
  }
  if (!data || error) {
    return (
      <div className="p-16 text-center">
        <h1 className="font-display text-[32px]">Вариант не найден</h1>
        <Link href="/#variants" className="text-accent mt-4 inline-block">
          К вариантам →
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[920px] px-5 py-12 sm:px-8">
      <Link href="/#variants" className="text-ink-3 text-[14px]">
        ← К вариантам
      </Link>
      <div className="border-line bg-surface mt-6 rounded-lg border p-7 sm:p-10">
        <div className="text-ink-3 text-[12px] tracking-[0.12em] uppercase">
          Пробный экзамен · 2 часа
        </div>
        <h1 className="font-display mt-3 text-[42px] leading-none tracking-[-0.03em]">
          {data.title}
        </h1>
        <p className="text-ink-3 mt-5 max-w-[700px] text-[15px] leading-relaxed">
          Письменная часть пробного экзамена включает <b>Аудирование</b>,{" "}
          <b>Чтение</b> и <b>Языковой материал</b>. На выполнение дается 120
          минут. В заданиях Аудирования каждая аудиозапись прозвучит два раза;
          повтор начнётся автоматически через 5 секунд.
        </p>
        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          {data.parts.map((part, index) => (
            <div
              key={part.slot}
              className="bg-surface-2 rounded-md px-4 py-3 text-[14px]"
            >
              <span className="text-ink-3 mr-2 font-mono">{index + 1}.</span>
              {part.label}
            </div>
          ))}
        </div>
        <div className="bg-warn-soft text-warn mt-7 rounded-md px-4 py-3 text-[13.5px] leading-relaxed">
          После обновления или закрытия страницы прогресс не восстанавливается —
          вариант начнётся заново.
        </div>
        {startMutation.error && (
          <div className="bg-err-soft text-err mt-4 rounded-md px-4 py-3 text-[14px]">
            {startMutation.error.message}
          </div>
        )}
        <button
          type="button"
          disabled={!data.isReady || startMutation.isPending}
          onClick={() => startMutation.mutate({ id })}
          className="bg-ink text-on-ink rounded-pill mt-7 h-12 px-7 text-[15px] font-medium disabled:opacity-50"
        >
          {startMutation.isPending
            ? "Формируем вариант..."
            : "Начать экзамен →"}
        </button>
      </div>
    </main>
  );
}

export function SavedMockExamResult({ id }: { id: number }) {
  const { data, isLoading } = api.mockExams.getResult.useQuery({ id });
  if (isLoading)
    return (
      <div className="text-ink-3 p-16 text-center">Загрузка результата...</div>
    );
  if (!data)
    return (
      <div className="text-err p-16 text-center">Результат не найден.</div>
    );
  return <MockExamResultView details={data.details} />;
}
