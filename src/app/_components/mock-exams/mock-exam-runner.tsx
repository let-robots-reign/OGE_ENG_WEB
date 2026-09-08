"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";
import type { RouterOutputs } from "@/trpc/react";
import { api } from "@/trpc/react";
import type { MockExamAnswer, MockExamSlot } from "@/server/db/schema";
import { useCountdownTimer } from "@/app/_composables/use-countdown-timer";
import { formatClock } from "@/app/_utils/formatClock";
import { Modal } from "@/app/_components/Modal";
import { MockExamPart } from "./mock-exam-part";
import { MockExamResultView } from "./mock-exam-result-view";

type Attempt = RouterOutputs["mockExams"]["start"];

const AUTO_SUBMIT_ATTEMPTS = 3;
const AUTO_SUBMIT_RETRY_DELAY_MS = 5000;

const waitBeforeRetry = () =>
  new Promise<void>((resolve) =>
    window.setTimeout(resolve, AUTO_SUBMIT_RETRY_DELAY_MS),
  );

const switcherLabel = (label: string) => label.split("·")[1]?.trim() ?? label;

export function MockExamRunner({ attempt }: { attempt: Attempt }) {
  const utils = api.useUtils();
  const initialSeconds = Math.max(
    0,
    Math.min(
      7200,
      Math.ceil((attempt.expiresAt.getTime() - Date.now()) / 1000),
    ),
  );
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<
    Record<MockExamSlot, MockExamAnswer[]>
  >(
    () =>
      Object.fromEntries(
        attempt.parts.map((part) => [
          part.slot,
          Array<MockExamAnswer>(part.total).fill(null),
        ]),
      ) as Record<MockExamSlot, MockExamAnswer[]>,
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<
    RouterOutputs["mockExams"]["complete"] | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyAudioSlots, setBusyAudioSlots] = useState<Set<MockExamSlot>>(
    () => new Set(),
  );
  const submittedRef = useRef(false);
  const timeoutSubmissionStartedRef = useRef(false);
  const retryTimedOutRef = useRef(false);
  const completeMutation = api.mockExams.complete.useMutation();
  const { secondsLeft, isExpired, isWarning } = useCountdownTimer(
    initialSeconds,
    !completed,
  );

  const answeredByPart = useMemo(
    () =>
      attempt.parts.map(
        (part) =>
          (answers[part.slot] ?? []).filter(
            (answer) => answer !== null && answer !== "",
          ).length,
      ),
    [answers, attempt.parts],
  );
  const totalAnswered = answeredByPart.reduce((sum, value) => sum + value, 0);
  const totalItems = attempt.parts.reduce((sum, part) => sum + part.total, 0);

  const submit = useCallback(
    async (timedOut: boolean, retryAutomatically = false) => {
      if (submittedRef.current || completed) return;
      submittedRef.current = true;
      retryTimedOutRef.current = timedOut;
      setIsSubmitting(true);
      setShowConfirm(false);
      setSubmitError(null);
      const payload = {
        attemptKey: attempt.attemptKey,
        timedOut,
        answers: attempt.parts.map((part) => ({
          slot: part.slot,
          values: answers[part.slot] ?? [],
        })),
      };
      const attempts = retryAutomatically ? AUTO_SUBMIT_ATTEMPTS : 1;
      let lastError: unknown;

      for (let attemptNumber = 0; attemptNumber < attempts; attemptNumber++) {
        try {
          const response = await completeMutation.mutateAsync(payload);
          setCompleted(response);
          setIsSubmitting(false);
          posthog.capture("mock_exam_completed", {
            mock_exam_id: attempt.mockExam.id,
            timed_out: response.details.timedOut,
            correct_count: response.details.correctCount,
            total: response.details.total,
          });
          await Promise.all([
            utils.mockExams.list.invalidate(),
            utils.user.getRecentActivity.invalidate(),
            utils.user.getActivity.invalidate(),
            utils.user.getStreak.invalidate(),
          ]);
          return;
        } catch (cause) {
          lastError = cause;
          if (attemptNumber < attempts - 1) await waitBeforeRetry();
        }
      }

      submittedRef.current = false;
      setIsSubmitting(false);
      posthog.capture("mock_exam_completion_failed", {
        mock_exam_id: attempt.mockExam.id,
        timed_out: timedOut,
        attempts,
      });
      setSubmitError(
        lastError instanceof Error
          ? lastError.message
          : "Не удалось завершить вариант. Попробуйте ещё раз.",
      );
    },
    [answers, attempt, completeMutation, completed, utils],
  );

  useEffect(() => {
    if (
      isExpired &&
      !completed &&
      !isSubmitting &&
      !timeoutSubmissionStartedRef.current
    ) {
      timeoutSubmissionStartedRef.current = true;
      void submit(true, true);
    }
  }, [completed, isExpired, isSubmitting, submit]);

  const isAudioPlaybackActive = busyAudioSlots.size > 0;
  const setAudioPlaybackState = useCallback(
    (slot: MockExamSlot, isBusy: boolean) => {
      setBusyAudioSlots((previous) => {
        if (isBusy === previous.has(slot)) return previous;
        const next = new Set(previous);
        if (isBusy) next.add(slot);
        else next.delete(slot);
        return next;
      });
    },
    [],
  );

  if (completed) {
    return <MockExamResultView details={completed.details} />;
  }

  const activePart = attempt.parts[current];
  if (!activePart) return null;

  const setAnswer = (
    slot: MockExamSlot,
    index: number,
    value: MockExamAnswer,
  ) => {
    if (isSubmitting || isExpired) return;
    setAnswers((previous) => ({
      ...previous,
      [slot]: previous[slot].map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    }));
  };

  const navigate = (index: number) => {
    if (isAudioPlaybackActive && index !== current) return;
    setCurrent(index);
    posthog.capture("mock_exam_part_opened", {
      mock_exam_id: attempt.mockExam.id,
      slot: attempt.parts[index]?.slot,
    });
  };

  return (
    <>
      <header className="border-line bg-bg sticky top-0 z-30 border-b">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="text-ink-3 text-[11px] tracking-[0.1em] uppercase">
            {attempt.mockExam.title}
          </div>
          <div
            className={`rounded-pill border px-4 py-2 font-mono text-[16px] tabular-nums ${isWarning ? "border-err bg-err-soft text-err" : "border-line bg-surface"}`}
          >
            {formatClock(secondsLeft)}
          </div>
          <div className="text-ink-3 hidden text-[13px] sm:block">
            {totalAnswered} / {totalItems} отвечено
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 pt-7 pb-20 sm:px-8">
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2">
            {attempt.parts.map((part, index) => {
              const answered = answeredByPart[index] ?? 0;
              const complete = answered === part.total;
              return (
                <button
                  key={part.slot}
                  type="button"
                  disabled={isAudioPlaybackActive && index !== current}
                  onClick={() => navigate(index)}
                  title={
                    isAudioPlaybackActive && index !== current
                      ? "Дождитесь завершения аудиозаписи"
                      : undefined
                  }
                  className={`rounded-pill border px-4 py-2 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-50 ${index === current ? "border-ink bg-ink text-on-ink" : complete ? "border-ok bg-ok-soft text-ok" : answered ? "border-warn bg-warn-soft text-warn" : "border-line bg-surface text-ink-3"}`}
                >
                  {index + 1}. {switcherLabel(part.label)}
                </button>
              );
            })}
          </div>
        </div>

        {isAudioPlaybackActive && (
          <div role="status" className="text-warn mb-5 text-[13px]">
            Дождитесь завершения аудиозаписи, чтобы перейти к другой части.
          </div>
        )}

        <div className="mb-4">
          <h1 className="font-display mt-2 text-[34px] tracking-[-0.025em]">
            {activePart.label}
          </h1>
        </div>

        {attempt.parts.map((part, index) => (
          <div
            key={part.slot}
            className={index === current ? "block" : "hidden"}
          >
            <MockExamPart
              part={part}
              answers={answers[part.slot]}
              onAnswer={(answerIndex, value) =>
                setAnswer(part.slot, answerIndex, value)
              }
              onAudioPlaybackStateChange={setAudioPlaybackState}
            />
          </div>
        ))}

        {submitError && (
          <div
            role="alert"
            className="bg-err-soft text-err mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3 text-[14px]"
          >
            <span>{submitError}</span>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void submit(retryTimedOutRef.current, false)}
              className="rounded-pill border-err h-9 border px-4 font-medium disabled:opacity-50"
            >
              Повторить отправку
            </button>
          </div>
        )}

        <div className="border-line bg-surface sticky bottom-4 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 shadow-lg">
          <button
            type="button"
            disabled={current === 0 || isAudioPlaybackActive}
            onClick={() => navigate(Math.max(0, current - 1))}
            className="rounded-pill border-line-2 h-10 border px-4 text-[14px] disabled:opacity-35"
          >
            ← Предыдущее
          </button>
          <div className="flex gap-2">
            {current < attempt.parts.length - 1 && (
              <button
                type="button"
                disabled={isAudioPlaybackActive}
                onClick={() => navigate(current + 1)}
                className="rounded-pill border-line-2 h-10 border px-4 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Следующее →
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className="bg-ink text-on-ink rounded-pill h-10 px-5 text-[14px] font-medium disabled:opacity-60"
            >
              {isSubmitting ? "Проверяем..." : "Завершить"}
            </button>
          </div>
        </div>
      </main>

      {showConfirm && (
        <Modal size={500} onClose={() => setShowConfirm(false)}>
          <div className="p-7 sm:p-9">
            <h2 className="font-display text-[29px]">Завершить вариант?</h2>
            <p className="text-ink-3 mt-3 text-[14px] leading-relaxed">
              Без ответа осталось {totalItems - totalAnswered}. После завершения
              изменить ответы нельзя.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-pill border-line-2 h-11 flex-1 border"
              >
                Продолжить
              </button>
              <button
                type="button"
                onClick={() => void submit(false)}
                className="bg-ink text-on-ink rounded-pill h-11 flex-1 font-medium"
              >
                Завершить
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
