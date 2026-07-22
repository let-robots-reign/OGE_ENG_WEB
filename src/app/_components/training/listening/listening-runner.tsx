"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { api } from "@/trpc/react";
import { AudioPlayer } from "./audio-player";
import { MCQuestion } from "./mc-question";
import { Modal } from "@/app/_components/Modal";
import { ResultModal } from "../shared/result-modal";
import { ReviewModal, type ReviewItem } from "../shared/review-modal";
import { ProgressDots } from "../shared/progress-dots";
import { TrainingSubHeader } from "../shared/training-sub-header";
import { useElapsedTimer } from "@/app/_composables/use-elapsed-timer";
import { formatClock } from "@/app/_utils/formatClock";
const BACK_HREF = "/training/audio/topics";

export function ListeningRunner() {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topic"));
  const router = useRouter();
  const { data: session } = useSession();

  const { data, isLoading } = api.training.getListeningTraining.useQuery(
    { topicId },
    { enabled: !!topicId, gcTime: 0 },
  );

  const utils = api.useUtils();
  const checkMutation = api.training.checkListeningTraining.useMutation();
  const logMutation = api.training.logResult.useMutation({
    onSuccess: () => void utils.user.getStreak.invalidate(),
  });

  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof checkMutation.mutateAsync>
  > | null>(null);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const taskId = data?.task.id;
  const questions = data?.task.questions ?? [];
  const total = questions.length;

  const { seconds: elapsedSec, reset: resetTimer } = useElapsedTimer(
    !!data && !checked,
  );

  // Reset per-task state whenever a new task loads.
  useEffect(() => {
    if (!taskId) return;
    setAnswers(Array(total).fill(null) as null[]);
    setChecked(false);
    setResult(null);
    setShowResult(false);
    setShowReview(false);
    resetTimer();
  }, [taskId, total, resetTimer]);

  const answeredCount = answers.filter((v) => v !== null).length;
  const isChecking = checkMutation.isPending;

  const setAnswer = (qIndex: number, optNum: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optNum;
      return next;
    });
  };

  const handleCheck = async () => {
    if (!data?.task || isChecking) return;
    const res = await checkMutation.mutateAsync({ id: data.task.id, answers });
    setResult(res);
    setChecked(true);
    setShowResult(true);

    const resultRatio = `${res.correctCount}/${res.total}`;
    posthog.capture("training_completed", {
      training_type: "listening",
      topic: data.topicTitle,
      topic_id: topicId,
      correct_count: res.correctCount,
      total: res.total,
      result: resultRatio,
    });

    if (session?.user) {
      logMutation.mutate({
        activityId: topicId,
        activityType: "training",
        result: resultRatio,
        taskId: data.task.id,
        timeSpent: elapsedSec,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
        Загрузка задания...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto px-6 py-24 text-center">
        <div className="font-display text-[32px] tracking-[-0.02em]">
          Не удалось загрузить задание
        </div>
        <p className="text-ink-3 mt-3">
          Попробуйте ещё раз или выберите другое задание.
        </p>
        <Link
          href={BACK_HREF}
          className="text-on-ink rounded-pill mt-6 inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium"
          style={{ background: "var(--color-ink)" }}
        >
          К списку заданий →
        </Link>
      </div>
    );
  }

  const correctAnswers = result?.correctAnswers ?? [];
  const correctIndices = checked
    ? questions
        .map((_, i) => (answers[i] === correctAnswers[i] ? i + 1 : 0))
        .filter(Boolean)
    : [];

  const reviewItems: ReviewItem[] = questions.map((q, i) => {
    const userN = answers[i];
    const correctN = correctAnswers[i];
    return {
      badge: String(i + 1),
      title: q.questionText,
      userLabel: userN ? (q.options[userN - 1] ?? "—") : "Нет ответа",
      correctLabel: correctN ? (q.options[correctN - 1] ?? "—") : undefined,
      isCorrect: userN === correctN,
      explanation: result?.explanation[i],
    };
  });

  return (
    <>
      <TrainingSubHeader
        backHref={BACK_HREF}
        section="Раздел 1 · аудирование"
        taskTitle={data.topicTitle}
        answeredCount={answeredCount}
        total={total}
        elapsedSec={elapsedSec}
        onShowInstruction={() => setShowInstruction(true)}
      />

      <div className="mx-auto w-full max-w-[880px] px-6 pt-8 pb-20">
        {!checked ? (
          <div className="mb-7">
            <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" />
              инструкция
            </div>
            <h1 className="font-display mt-2.5 text-[28px] leading-[1.05] tracking-[-0.025em] sm:text-[44px]">
              Вы услышите четыре коротких текста, обозначенных буквами А, B, C,
              D.
            </h1>
            <p className="text-ink-3 mt-3.5 text-[15px] leading-relaxed">
              В заданиях 1–4 запишите цифру 1, 2 или 3, соответствующую
              выбранному варианту ответа.
            </p>
          </div>
        ) : (
          <div
            className="mb-7 flex flex-col gap-4 rounded-lg p-6 text-white sm:flex-row sm:items-center sm:gap-7"
            style={{ background: "var(--color-ink-panel)" }}
          >
            <div className="font-display text-[44px] leading-none tracking-[-0.025em] sm:text-[56px]">
              {result?.correctCount ?? 0}
              <span style={{ color: "rgba(255,255,255,0.5)" }}>/{total}</span>
            </div>
            <div className="font-display text-[26px] leading-[1.05] tracking-[-0.02em] sm:flex-1 sm:text-[32px]">
              Ваш результат
            </div>
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="rounded-pill inline-flex h-9 cursor-pointer items-center justify-center self-start px-4 text-[14px] font-medium text-white sm:self-auto"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Посмотреть пояснения
            </button>
          </div>
        )}

        <AudioPlayer src={"/audio/topic1/" + data.task.audioUrl} />

        <div className="h-7" />

        <div className="flex flex-col gap-3.5">
          {questions.map((q, i) => (
            <MCQuestion
              key={i}
              idx={i + 1}
              question={q.questionText}
              options={q.options}
              value={answers[i] ?? null}
              onChange={(optNum) => setAnswer(i, optNum)}
              checked={checked}
              correct={correctAnswers[i]}
            />
          ))}
        </div>

        <div className="bg-surface border-line mt-8 flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between">
          <ProgressDots
            total={total}
            answered={
              checked
                ? correctIndices
                : answers
                    .map((v, i) => (v !== null ? i + 1 : 0))
                    .filter(Boolean)
            }
          />
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
                  className="text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium"
                  style={{ background: "var(--color-ink)" }}
                >
                  К списку заданий →
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-pill border-line-2 inline-flex h-11 items-center justify-center border px-[22px] text-[15px] font-medium"
                >
                  ← Назад
                </button>
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={isChecking || answeredCount === 0}
                  className="text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium disabled:opacity-60"
                  style={{ background: "var(--color-ink)" }}
                >
                  {isChecking ? "Проверяем..." : "Проверить ответы →"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showInstruction && (
        <Modal size={520} onClose={() => setShowInstruction(false)}>
          <div style={{ padding: "32px 36px 28px" }}>
            <div className="font-display mb-3 text-[28px] tracking-[-0.02em]">
              Инструкция
            </div>
            <p className="text-ink-2 text-[15px] leading-relaxed">
              Вы услышите четыре коротких текста, обозначенных буквами А, B, C,
              D. В заданиях 1–4 запишите в поле ответа цифру 1, 2 или 3,
              соответствующую выбранному Вами варианту ответа.
            </p>
            <button
              type="button"
              onClick={() => setShowInstruction(false)}
              className="text-on-ink rounded-pill mt-6 inline-flex h-11 w-full items-center justify-center px-[22px] text-[15px] font-medium"
              style={{ background: "var(--color-ink)" }}
            >
              ОК
            </button>
          </div>
        </Modal>
      )}

      {checked && showResult && result && (
        <ResultModal
          correct={result.correctCount}
          total={result.total}
          timeText={formatClock(elapsedSec)}
          onClose={() => setShowResult(false)}
          onReview={() => {
            setShowResult(false);
            setShowReview(true);
          }}
        />
      )}

      {checked && showReview && result && (
        <ReviewModal items={reviewItems} onClose={() => setShowReview(false)} />
      )}
    </>
  );
}
