"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { api } from "@/trpc/react";
import { InstructionStrip } from "./instruction-strip";
import { QuestionCard } from "./question-card";
import { ResultModal } from "../shared/result-modal";
import { TrainingSubHeader } from "../shared/training-sub-header";
import { useElapsedTimer } from "@/app/_composables/use-elapsed-timer";
import { useSubmitAnswersMutation } from "@/app/_composables/use-submit-answers-mutation";
import { formatClock } from "@/app/_utils/formatClock";

const BACK_HREF = "/training/use-of-english/topics";

export function UoERunner() {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topic"));
  const { data: session } = useSession();

  const { data, error, isLoading, refetch } =
    api.training.getUoeTraining.useQuery(
      { topicId },
      {
        enabled: !!topicId,
        gcTime: 0,
        retry: (failureCount, queryError) =>
          queryError.data?.code !== "NOT_FOUND" && failureCount < 3,
      },
    );

  const checkMutation = api.training.checkUoeTraining.useMutation();
  const submitAnswersMutation = useSubmitAnswersMutation();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof checkMutation.mutateAsync>
  > | null>(null);
  const [showResult, setShowResult] = useState(false);

  const tasks = data?.tasks ?? [];
  const total = tasks.length;
  const batchKey = `${data?.chainId ?? "topic"}:${tasks.map((t) => t.id).join(",")}`;

  const { seconds: elapsedSec, reset: resetTimer } = useElapsedTimer(
    !!data && !checked,
  );

  // Reset per-batch state whenever a new batch of tasks loads.
  useEffect(() => {
    setAnswers({});
    setChecked(false);
    setResult(null);
    setShowResult(false);
    resetTimer();
  }, [batchKey, resetTimer]);

  const answeredCount = tasks.filter((t) =>
    (answers[t.id] ?? "").trim(),
  ).length;
  const isChecking = checkMutation.isPending;
  const resById = new Map((result?.results ?? []).map((r) => [r.id, r]));

  const setAnswer = (id: number, v: string) =>
    setAnswers((prev) => ({ ...prev, [id]: v }));

  const handleCheck = async () => {
    if (!data || isChecking) return;
    const payload = tasks.map((t) => ({
      id: t.id,
      answer: answers[t.id] ?? "",
    }));
    const res = await checkMutation.mutateAsync({
      answers: payload,
      ...(data.chainId ? { chainId: data.chainId } : {}),
    });
    setResult(res);
    setChecked(true);
    setShowResult(true);

    const resultRatio = `${res.correctCount}/${res.total}`;
    posthog.capture("training_completed", {
      training_type: "use_of_english",
      topic: data.topicTitle,
      topic_id: topicId,
      ...(data.chainId ? { chain_id: data.chainId } : {}),
      correct_count: res.correctCount,
      total: res.total,
      result: resultRatio,
    });

    if (session?.user) {
      submitAnswersMutation.mutate({
        activityId: topicId,
        activityType: "training",
        result: resultRatio,
        timeSpent: elapsedSec,
      });
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setChecked(false);
    setResult(null);
    setShowResult(false);
    resetTimer();
    void refetch();
  };

  if (isLoading) {
    return (
      <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
        Загрузка задания...
      </div>
    );
  }

  if (!data) {
    const hasNoChains =
      error?.data?.code === "NOT_FOUND" && error.message.includes("цепочек");
    return (
      <div className="mx-auto max-w-[920px] px-6 py-24 text-center">
        <div className="font-display text-[32px] tracking-[-0.02em]">
          {hasNoChains
            ? "Пока нет доступных цепочек заданий"
            : "Не удалось загрузить задание"}
        </div>
        <p className="text-ink-3 mt-3">
          {hasNoChains
            ? "Администратор ещё не подготовил связные задания для этой темы."
            : "Попробуйте ещё раз или выберите другую тему."}
        </p>
        <Link
          href={BACK_HREF}
          className="bg-ink text-on-ink rounded-pill mt-6 inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium"
        >
          К списку тем →
        </Link>
      </div>
    );
  }

  return (
    <>
      <TrainingSubHeader
        backHref={BACK_HREF}
        section="Раздел 3 · use of english"
        taskTitle={data.topicTitle}
        answeredCount={answeredCount}
        total={total}
        elapsedSec={elapsedSec}
      />

      <div className="mx-auto w-full max-w-[920px] px-6 pt-8 pb-32">
        <InstructionStrip />

        {checked && (
          <div className="bg-ink-panel mb-6 flex flex-col gap-4 rounded-lg p-5 text-white sm:flex-row sm:items-center sm:gap-[22px]">
            <div className="font-display text-[36px] leading-none tracking-[-0.025em] sm:text-[44px]">
              {result?.correctCount ?? 0}
              <span className="text-white/50">/{total}</span>
            </div>
            <div className="sm:flex-1">
              <div className="text-[14px] font-medium">Разбор ответов</div>
              <div className="mt-0.5 text-[13px] text-white/55">
                Зелёные карточки — верные ответы, красные — ошибки с правильным
                вариантом.
              </div>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-pill inline-flex h-9 items-center justify-center self-start border border-white/20 bg-white/10 px-4 text-[14px] font-medium text-white sm:self-auto"
            >
              Пройти ещё раз
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3.5">
          {tasks.map((t, i) => {
            const r = resById.get(t.id);
            return (
              <QuestionCard
                key={t.id}
                n={i + 1}
                task={t.task}
                origin={t.origin}
                value={answers[t.id] ?? ""}
                onChange={(v) => setAnswer(t.id, v)}
                checked={checked}
                isCorrect={r?.isCorrect}
                correctAnswer={r?.correctAnswer}
              />
            );
          })}
        </div>

        <div className="bg-surface border-line sticky bottom-5 mt-7 flex flex-col gap-3 rounded-lg border p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-[18px]">
          <div className="text-ink-3 text-[14px]">
            Заполнено:{" "}
            <strong className="text-ink font-mono">
              {answeredCount} / {total}
            </strong>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {checked ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowResult(true)}
                  className="rounded-pill border-line-2 inline-flex h-11 items-center justify-center border px-[22px] text-[15px] font-medium"
                >
                  Посмотреть результат
                </button>
                <Link
                  href={BACK_HREF}
                  className="bg-ink text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium"
                >
                  К списку тем →
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCheck}
                disabled={isChecking || answeredCount === 0}
                className="bg-ink text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium disabled:opacity-60"
              >
                {isChecking ? "Проверяем..." : "Проверить →"}
              </button>
            )}
          </div>
        </div>
      </div>

      {checked && showResult && result && (
        <ResultModal
          correct={result.correctCount}
          total={result.total}
          timeText={formatClock(elapsedSec)}
          onClose={() => setShowResult(false)}
          onReview={() => setShowResult(false)}
        />
      )}
    </>
  );
}
