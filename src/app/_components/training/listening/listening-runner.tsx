"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { api } from "@/trpc/react";
import type {
  AudioTaskContent,
  AudioTaskQuestion,
  AudioTaskType,
} from "@/server/db/schema";
import {
  formatGapFillAnswer,
  normalizeGapFillAnswer,
} from "@/app/_utils/gapFill";
import { AudioPlayer } from "./audio-player";
import { MultipleChoiceTask } from "./multiple-choice-task";
import { MatchingTask, speakersFor } from "./matching-task";
import { GapFillTask } from "./gap-fill-task";
import { ResultModal } from "../shared/result-modal";
import { ReviewModal, type ReviewItem } from "../shared/review-modal";
import { ProgressDots } from "../shared/progress-dots";
import { TrainingSubHeader } from "../shared/training-sub-header";
import { useElapsedTimer } from "@/app/_composables/use-elapsed-timer";
import { useSubmitAnswersMutation } from "@/app/_composables/use-submit-answers-mutation";
import { formatClock } from "@/app/_utils/formatClock";
import { LISTENING_INSTRUCTIONS } from "../shared/task-instructions";

const BACK_HREF = "/training/audio/topics";

// A single jsonb column cannot correlate `taskType` with the shape of
// `questions`, so pair them once here and let every consumer below narrow on
// the discriminant instead of casting at each use site.
const asContent = (
  taskType: AudioTaskType,
  questions: AudioTaskQuestion[] | string[],
): AudioTaskContent => ({ taskType, questions }) as AudioTaskContent;

export function ListeningRunner() {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topic"));
  const router = useRouter();
  const { data: session } = useSession();

  const { data, isLoading } = api.training.getListeningTraining.useQuery(
    { topicId },
    { enabled: !!topicId, gcTime: 0 },
  );

  const checkMutation = api.training.checkListeningTraining.useMutation();
  const submitAnswersMutation = useSubmitAnswersMutation();

  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof checkMutation.mutateAsync>
  > | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const taskId = data?.task.id;
  const content = asContent(
    data?.task.taskType ?? "multiple_choice",
    data?.task.questions ?? [],
  );
  const instructions = LISTENING_INSTRUCTIONS[content.taskType];
  // The number of answers the task expects, which is not always the number of
  // questions shown — task 5 lists 6 rubrics but is answered by 5 speakers.
  const total = data?.task.total ?? 0;

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

  const setAnswer = (index: number, val: number | string | null) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = val;
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
      submitAnswersMutation.mutate({
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
          className="bg-ink text-on-ink rounded-pill mt-6 inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium"
        >
          К списку заданий →
        </Link>
      </div>
    );
  }

  const correctAnswers = result?.correctAnswers ?? [];
  // Rubric and option numbers may come back from jsonb as strings. The server
  // compares them numerically, so coerce here too rather than letting the
  // highlighted "correct" option disagree with the score.
  const numericCorrect = correctAnswers.map((v) => Number(v));
  // The server already graded every answer — reuse its verdict so the badges,
  // the score and the review modal can never disagree with each other.
  const results = result?.results ?? [];
  const correctIndices = checked
    ? results.map((isCorrect, i) => (isCorrect ? i + 1 : 0)).filter(Boolean)
    : [];

  let reviewItems: ReviewItem[];
  if (content.taskType === "matching") {
    const rubrics = content.questions;
    reviewItems = speakersFor(total).map((sp, i) => {
      const userN = answers[i] as number | null;
      const correctN = numericCorrect[i];
      return {
        badge: sp,
        title: `Высказывание говорящего ${sp}`,
        userLabel: userN
          ? `${userN}. ${rubrics[userN - 1] ?? "—"}`
          : "Нет ответа",
        correctLabel: correctN
          ? `${correctN}. ${rubrics[correctN - 1] ?? "—"}`
          : undefined,
        isCorrect: results[i] ?? false,
        explanation: result?.explanation[i],
      };
    });
  } else if (content.taskType === "gap_fill") {
    reviewItems = content.questions.map((qTemplate, i) => ({
      badge: String(6 + i),
      title: qTemplate.replace(/_{2,}/g, "[...]"),
      userLabel: normalizeGapFillAnswer(answers[i]) || "Нет ответа",
      correctLabel: formatGapFillAnswer(correctAnswers[i]),
      isCorrect: results[i] ?? false,
      explanation: result?.explanation[i],
    }));
  } else {
    reviewItems = content.questions.map((q, i) => {
      const userN = answers[i] as number | null;
      const correctN = numericCorrect[i];
      return {
        badge: String(i + 1),
        title: q.questionText,
        userLabel: userN ? (q.options[userN - 1] ?? "—") : "Нет ответа",
        correctLabel: correctN ? (q.options[correctN - 1] ?? "—") : undefined,
        isCorrect: results[i] ?? false,
        explanation: result?.explanation[i],
      };
    });
  }

  return (
    <>
      <TrainingSubHeader
        backHref={BACK_HREF}
        section="Раздел 1 · аудирование"
        taskTitle={data.topicTitle}
        answeredCount={answeredCount}
        total={total}
        elapsedSec={elapsedSec}
      />

      <div className="mx-auto w-full max-w-[880px] px-6 pt-8 pb-20">
        {!checked ? (
          <div className="mb-7">
            <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" />
              инструкция
            </div>
            <h1 className="font-display mt-2.5 text-[28px] leading-[1.05] tracking-[-0.025em] sm:text-[44px]">
              {instructions.heading}
            </h1>
            <p className="text-ink-3 mt-3.5 text-[15px] leading-relaxed">
              {instructions.hint}
            </p>
          </div>
        ) : (
          <div className="bg-ink-panel mb-7 flex flex-col gap-4 rounded-lg p-6 text-white sm:flex-row sm:items-center sm:gap-7">
            <div className="font-display text-[44px] leading-none tracking-[-0.025em] sm:text-[56px]">
              {result?.correctCount ?? 0}
              <span className="text-white/50">/{total}</span>
            </div>
            <div className="font-display text-[26px] leading-[1.05] tracking-[-0.02em] sm:flex-1 sm:text-[32px]">
              Ваш результат
            </div>
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="rounded-pill inline-flex h-9 items-center justify-center self-start border border-white/20 bg-white/10 px-4 text-[14px] font-medium text-white sm:self-auto"
            >
              Посмотреть пояснения
            </button>
          </div>
        )}

        <AudioPlayer src={data.task.audioUrl} />

        <div className="h-7" />

        {content.taskType === "matching" ? (
          <MatchingTask
            rubrics={content.questions}
            answers={answers as (number | null)[]}
            setAnswer={(idx, val) => setAnswer(idx, val)}
            checked={checked}
            correctAnswers={numericCorrect}
            results={results}
            speakerCount={total}
          />
        ) : content.taskType === "gap_fill" ? (
          <GapFillTask
            questions={content.questions}
            answers={answers as (string | null)[]}
            setAnswer={(idx, val) => setAnswer(idx, val)}
            checked={checked}
            correctAnswers={correctAnswers}
          />
        ) : (
          <MultipleChoiceTask
            questions={content.questions}
            answers={answers as (number | null)[]}
            setAnswer={(idx, optNum) => setAnswer(idx, optNum)}
            checked={checked}
            correctAnswers={numericCorrect}
            results={results}
          />
        )}

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
                  className="bg-ink text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium"
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
                  className="bg-ink text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium disabled:opacity-60"
                >
                  {isChecking ? "Проверяем..." : "Проверить ответы →"}
                </button>
              </>
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
