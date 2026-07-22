"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { api } from "@/trpc/react";
import { HeadingsBank } from "./headings-bank";
import { TextCard } from "./text-card";
import { Modal } from "@/app/_components/Modal";
import { ResultModal } from "../shared/result-modal";
import { ReviewModal, type ReviewItem } from "../shared/review-modal";
import { ProgressDots } from "../shared/progress-dots";
import { TrainingSubHeader } from "../shared/training-sub-header";
import { useElapsedTimer } from "@/app/_composables/use-elapsed-timer";
import { formatClock } from "@/app/_utils/formatClock";

const BACK_HREF = "/training/reading/topics";
const letterOf = (i: number) => String.fromCharCode(65 + i);
const stripPrefix = (s: string) => s.replace(/^\s*\d+\.\s*/, "").trim();

export function ReadingRunner() {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topic"));
  const router = useRouter();
  const { data: session } = useSession();

  const { data, isLoading, refetch } = api.training.getReadingTraining.useQuery(
    { topicId },
    { enabled: !!topicId, gcTime: 0 },
  );

  const utils = api.useUtils();
  const checkMutation = api.training.checkReadingTraining.useMutation();
  const logMutation = api.training.logResult.useMutation({
    onSuccess: () => void utils.user.getStreak.invalidate(),
  });

  const [assigned, setAssigned] = useState<(number | null)[]>([]);
  const [activeHeading, setActiveHeading] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof checkMutation.mutateAsync>
  > | null>(null);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const taskId = data?.task.id;
  const texts = data?.task.texts ?? [];
  const total = texts.length;
  const headings = (data?.task.headings ?? [])
    .map((raw, i) => ({ n: i + 1, q: raw }));

  const { seconds: elapsedSec, reset: resetTimer } = useElapsedTimer(
    !!data && !checked,
  );

  useEffect(() => {
    if (!taskId) return;
    setAssigned(Array(total).fill(null) as null[]);
    setActiveHeading(null);
    setChecked(false);
    setResult(null);
    setShowResult(false);
    setShowReview(false);
    resetTimer();
  }, [taskId, total, resetTimer]);

  const answeredCount = assigned.filter((v) => v !== null).length;
  const isChecking = checkMutation.isPending;
  const allAssigned = total > 0 && answeredCount === total;

  const headingQ = (n: number | null | undefined) =>
    n ? headings.find((h) => h.n === n)?.q : undefined;

  const pickHeading = (n: number) =>
    setActiveHeading((prev) => (prev === n ? null : n));

  const assignToText = (textIndex: number) => {
    if (activeHeading == null) return;
    setAssigned((prev) => {
      const next = [...prev];
      for (let j = 0; j < next.length; j++) {
        if (next[j] === activeHeading) next[j] = null;
      }
      next[textIndex] = activeHeading;
      return next;
    });
    setActiveHeading(null);
  };

  const detachText = (textIndex: number) =>
    setAssigned((prev) => {
      const next = [...prev];
      next[textIndex] = null;
      return next;
    });

  const handleCheck = async () => {
    if (!data?.task || isChecking || !allAssigned) return;
    const res = await checkMutation.mutateAsync({
      id: data.task.id,
      answers: assigned,
    });
    setResult(res);
    setChecked(true);
    setActiveHeading(null);
    setShowResult(true);

    const resultRatio = `${res.correctCount}/${res.total}`;
    posthog.capture("training_completed", {
      training_type: "reading",
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

  const handleRetry = () => {
    setAssigned(Array(total).fill(null) as null[]);
    setActiveHeading(null);
    setChecked(false);
    setResult(null);
    setShowResult(false);
    setShowReview(false);
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
    ? texts
        .map((_, i) => (assigned[i] === correctAnswers[i] ? i + 1 : 0))
        .filter(Boolean)
    : [];
  const answeredIndices = assigned
    .map((v, i) => (v !== null ? i + 1 : 0))
    .filter(Boolean);

  const explanationParts = result ? result.explanation : [];
  const reviewItems: ReviewItem[] = texts.map((_, i) => {
    const userN = assigned[i];
    const correctN = correctAnswers[i];
    return {
      badge: letterOf(i),
      title: headingQ(correctN) ?? `Текст ${letterOf(i)}`,
      userLabel: userN ? `№${userN} — ${headingQ(userN) ?? ""}` : "Нет ответа",
      correctLabel: correctN
        ? `№${correctN} — ${headingQ(correctN) ?? ""}`
        : undefined,
      isCorrect: userN === correctN,
      explanation: explanationParts[i],
    };
  });

  const lettersRange = `A–${letterOf(total - 1)}`;
  const headingsRange = `1–${headings.length}`;

  return (
    <>
      <TrainingSubHeader
        backHref={BACK_HREF}
        section="Раздел 2 · чтение"
        taskTitle={data.topicTitle}
        answeredCount={answeredCount}
        total={total}
        elapsedSec={elapsedSec}
        onShowInstruction={() => setShowInstruction(true)}
      />

      <div className="mx-auto w-full max-w-[1240px] px-6 pt-8 pb-20 lg:px-8">
        {!checked ? (
          <div className="mb-7">
            <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" />
              инструкция · matching
            </div>
            <h1 className="font-display mt-2.5 text-[28px] leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
              Установите соответствие между{" "}
              <span className="italic">текстами {lettersRange}</span> и{" "}
              <span className="italic">заголовками {headingsRange}</span>.
            </h1>
            <p className="text-ink-3 mt-3.5 max-w-[760px] text-[15px] leading-relaxed">
              Каждому тексту подберите один подходящий вопрос-заголовок. Один
              заголовок останется лишним.
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
              onClick={handleRetry}
              className="rounded-pill inline-flex h-9 items-center justify-center self-start px-4 text-[14px] font-medium text-white sm:self-auto"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Пройти ещё раз
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(360px,400px)_1fr]">
          <HeadingsBank
            headings={headings}
            assigned={assigned}
            correctAnswers={correctAnswers}
            activeHeading={activeHeading}
            onPickHeading={pickHeading}
            onDetachText={detachText}
            checked={checked}
          />

          <div className="flex flex-col gap-3.5">
            {texts.map((body, i) => (
              <TextCard
                key={i}
                letter={letterOf(i)}
                body={body}
                assignedN={assigned[i] ?? null}
                assignedHeadingQ={headingQ(assigned[i])}
                armed={!checked && activeHeading != null && assigned[i] == null}
                activeHeading={activeHeading}
                onAssign={() => assignToText(i)}
                onClear={() => detachText(i)}
                checked={checked}
                isCorrect={assigned[i] === correctAnswers[i]}
                correctN={correctAnswers[i]}
                correctHeadingQ={headingQ(correctAnswers[i])}
              />
            ))}
          </div>
        </div>

        <div className="bg-surface border-line mt-8 flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between">
          <ProgressDots
            total={total}
            answered={checked ? correctIndices : answeredIndices}
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
                  disabled={isChecking || !allAssigned}
                  className="text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="text-ink-2 flex flex-col gap-2 text-[15px] leading-relaxed">
              <p>
                Определите, в каком из текстов <b>A–F</b> содержатся ответы на
                вопросы <b>1–7</b>.
              </p>
              <p>Используйте каждую цифру только один раз.</p>
              <p>В задании есть один лишний вопрос.</p>
            </div>
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
