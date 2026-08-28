"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { api, type RouterOutputs } from "@/trpc/react";
import type { AudioTaskContent, AudioTaskQuestion } from "@/server/db/schema";
import { useCountdownTimer } from "@/app/_composables/use-countdown-timer";
import { useSubmitAnswersMutation } from "@/app/_composables/use-submit-answers-mutation";
import { formatClock } from "@/app/_utils/formatClock";
import {
  formatGapFillAnswer,
  normalizeGapFillAnswer,
} from "@/app/_utils/gapFill";
import { AudioPlayer } from "../listening/audio-player";
import { MultipleChoiceTask } from "../listening/multiple-choice-task";
import { MatchingTask, speakersFor } from "../listening/matching-task";
import { GapFillTask } from "../listening/gap-fill-task";
import { TrueFalseTask } from "../reading/true-false-task";
import { HeadingsBank } from "../reading/headings-bank";
import { TextCard } from "../reading/text-card";
import { ExamSubHeader } from "../shared/training-sub-header";
import { ResultModal, type ResultSegment } from "../shared/result-modal";
import type { ReviewItem } from "../shared/review-modal";
import { ExamReviewModal } from "./exam-review-modal";
import {
  LISTENING_INSTRUCTIONS,
  READING_INSTRUCTIONS,
} from "../shared/task-instructions";
import { Modal } from "@/app/_components/Modal";

const EXAM_SECONDS = 30 * 60;
const ANSWER_LABELS = ["", "True", "False", "Not stated"] as const;
const letterOf = (index: number) => String.fromCharCode(65 + index);

type Category = "audio" | "reading";
type ExamAnswer = number | string | null;
type ExamData = RouterOutputs["training"]["getExamSection"];
type ExamResult = RouterOutputs["training"]["checkExamSection"];
type ExamStep = ExamData["steps"][number];

const isAudioStep = (
  step: ExamStep,
): step is ExamStep & {
  task: ExamStep["task"] & {
    audioUrl: string;
    questions: AudioTaskQuestion[] | string[];
  };
} => "audioUrl" in step.task;

const asAudioContent = (step: ExamStep): AudioTaskContent => {
  if (!isAudioStep(step)) {
    return { taskType: "multiple_choice", questions: [] };
  }
  return {
    taskType: step.task.taskType,
    questions: step.task.questions,
  } as AudioTaskContent;
};

export function ExamRunner({ category }: { category: Category }) {
  const { data: session } = useSession();
  const backHref = `/training/${category}/topics`;
  const { data, isLoading, error } = api.training.getExamSection.useQuery(
    { category },
    {
      gcTime: 0,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const checkMutation = api.training.checkExamSection.useMutation();
  const submitAnswersMutation = useSubmitAnswersMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Map<number, ExamAnswer[]>>(
    () => new Map(),
  );
  const [activeHeadings, setActiveHeadings] = useState<
    Map<number, number | null>
  >(() => new Map());
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { secondsLeft, isExpired, isWarning, reset } = useCountdownTimer(
    EXAM_SECONDS,
    !!data && !checked,
  );
  const answersLocked = timedOut || checkMutation.isPending;

  useEffect(() => {
    if (!data) return;

    setAllAnswers(
      new Map(
        data.steps.map((step, index) => [
          index,
          Array<ExamAnswer>(step.task.total).fill(null),
        ]),
      ),
    );
    setActiveHeadings(new Map(data.steps.map((_, index) => [index, null])));
    setCurrentStep(0);
    setChecked(false);
    setResult(null);
    setTimedOut(false);
    setShowResult(false);
    setShowReview(false);
    setShowConfirm(false);
    setSubmitError(null);
    reset();
  }, [data, reset]);

  const handleSubmit = useCallback(
    async (becauseTimedOut = false) => {
      if (!data || checked || checkMutation.isPending) return;

      const didTimeOut = becauseTimedOut || secondsLeft === 0;
      const timeSpent = didTimeOut ? EXAM_SECONDS : EXAM_SECONDS - secondsLeft;
      if (didTimeOut) setTimedOut(true);
      setShowConfirm(false);
      setSubmitError(null);

      try {
        const response = await checkMutation.mutateAsync({
          category,
          steps: data.steps.map((step, index) => ({
            taskId: step.task.id,
            answers: allAnswers.get(index) ?? [],
          })),
          timeSpent,
        });

        setResult(response);
        setChecked(true);
        setActiveHeadings(new Map(data.steps.map((_, index) => [index, null])));
        setShowResult(true);

        const resultRatio = `${response.correctCount}/${response.total}`;
        posthog.capture("exam_completed", {
          category,
          correct_count: response.correctCount,
          total: response.total,
          result: resultRatio,
          timed_out: didTimeOut,
        });

        if (session?.user) {
          const firstTask = data.steps[0]?.task;
          submitAnswersMutation.mutate({
            activityId: firstTask?.topicId ?? firstTask?.id ?? 0,
            activityType: "mock_exam",
            result: resultRatio,
            timeSpent,
            details: {
              category,
              timedOut: didTimeOut,
              tasks: response.steps.map((step) => ({
                taskId: step.taskId,
                correctCount: step.correctCount,
                total: step.total,
              })),
            },
          });
        }
      } catch {
        setSubmitError("Не удалось проверить экзамен. Попробуйте ещё раз.");
      }
    },
    [
      allAnswers,
      category,
      checkMutation,
      checked,
      data,
      submitAnswersMutation,
      secondsLeft,
      session?.user,
    ],
  );

  useEffect(() => {
    if (
      isExpired &&
      data &&
      !checked &&
      !timedOut &&
      !checkMutation.isPending
    ) {
      void handleSubmit(true);
    }
  }, [
    checked,
    checkMutation.isPending,
    data,
    handleSubmit,
    isExpired,
    timedOut,
  ]);

  const setAnswer = (index: number, value: ExamAnswer) => {
    if (checked || answersLocked) return;

    setAllAnswers((previous) => {
      const next = new Map(previous);
      const answers = [...(next.get(currentStep) ?? [])];
      answers[index] = value;
      next.set(currentStep, answers);
      return next;
    });
  };

  const setActiveHeading = (value: number | null) => {
    if (checked || answersLocked) return;

    setActiveHeadings((previous) => {
      const next = new Map(previous);
      next.set(currentStep, value);
      return next;
    });
  };

  const reviewSteps = useMemo(
    () => (data && result ? buildReviewSteps(data, result, allAnswers) : []),
    [allAnswers, data, result],
  );

  if (isLoading) {
    return (
      <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
        Формируем набор заданий...
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="mx-auto px-6 py-24 text-center">
        <div className="font-display text-[32px] tracking-[-0.02em]">
          Не удалось сформировать набор заданий
        </div>
        <p className="text-ink-3 mt-3">
          Попробуйте ещё раз или вернитесь к списку тренировок.
        </p>
        <Link
          href={backHref}
          className="text-on-ink rounded-pill mt-6 inline-flex h-11 items-center px-[22px] text-[15px] font-medium"
          style={{ background: "var(--color-ink)" }}
        >
          К списку заданий →
        </Link>
      </div>
    );
  }

  const step = data.steps[currentStep];
  if (!step) return null;

  const answers = allAnswers.get(currentStep) ?? [];
  const stepResult = result?.steps.find((item) => item.taskId === step.task.id);
  const correctAnswers = stepResult?.correctAnswers ?? [];
  const numericCorrect = correctAnswers.map(Number);
  const results = stepResult?.results ?? [];
  const activeHeading = activeHeadings.get(currentStep) ?? null;
  const instruction = isAudioStep(step)
    ? LISTENING_INSTRUCTIONS[asAudioContent(step).taskType]
    : READING_INSTRUCTIONS[step.task.taskType];

  const headings = !isAudioStep(step)
    ? step.task.headings.map((heading, index) => ({ n: index + 1, q: heading }))
    : [];
  const headingLabel = (number: number | null | undefined) =>
    number ? headings.find((heading) => heading.n === number)?.q : undefined;

  const pickHeading = (number: number) =>
    setActiveHeading(activeHeading === number ? null : number);
  const detachText = (textIndex: number) => setAnswer(textIndex, null);
  const assignToText = (textIndex: number) => {
    if (checked || answersLocked || activeHeading === null) return;
    setAllAnswers((previous) => {
      const next = new Map(previous);
      const nextAnswers = [...(next.get(currentStep) ?? [])];
      for (let index = 0; index < nextAnswers.length; index++) {
        if (nextAnswers[index] === activeHeading) nextAnswers[index] = null;
      }
      nextAnswers[textIndex] = activeHeading;
      next.set(currentStep, nextAnswers);
      return next;
    });
    setActiveHeading(null);
  };

  const answeredPerStep = data.steps.map(
    (_, index) =>
      (allAnswers.get(index) ?? []).filter(
        (answer) => answer !== null && answer !== "",
      ).length,
  );
  const segments: ResultSegment[] = data.steps.map((examStep) => {
    const segment = result?.steps.find(
      (item) => item.taskId === examStep.task.id,
    );
    const percentage = segment?.total
      ? (segment.correctCount / segment.total) * 100
      : 0;

    return {
      label: examStep.topicTitle,
      value: `${segment?.correctCount ?? 0}/${segment?.total ?? 0}`,
      tone: percentage >= 70 ? "ok" : percentage >= 40 ? "warn" : "err",
    };
  });

  return (
    <>
      <ExamSubHeader
        backHref={backHref}
        section={
          category === "audio" ? "Раздел 1 · аудирование" : "Раздел 2 · чтение"
        }
        taskTitle={step.topicTitle}
        secondsLeft={secondsLeft}
        isWarning={isWarning}
        timedOut={timedOut}
      />

      <main
        className={`mx-auto w-full px-6 pt-8 pb-20 ${category === "reading" ? "max-w-[1240px] lg:px-8" : "max-w-[880px]"}`}
      >
        {checked ? (
          <div
            className="mb-7 flex flex-col gap-4 rounded-lg p-6 text-white sm:flex-row sm:items-center sm:gap-7"
            style={{ background: "var(--color-ink-panel)" }}
          >
            <div className="font-display text-[44px] leading-none tracking-[-0.025em] sm:text-[56px]">
              {result?.correctCount ?? 0}
              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                /{result?.total ?? 0}
              </span>
            </div>
            <div className="font-display text-[26px] leading-[1.05] tracking-[-0.02em] sm:flex-1 sm:text-[32px]">
              Результат {category === "audio" ? "аудирования" : "чтения"}
            </div>
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="rounded-pill inline-flex h-9 items-center justify-center self-start border border-white/20 bg-white/10 px-4 text-[14px] font-medium sm:self-auto"
            >
              Посмотреть пояснения
            </button>
          </div>
        ) : (
          <div className="mb-7">
            <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" />
              exam mode
            </div>
            <h1 className="font-display mt-2.5 text-[32px] leading-[1.05] tracking-[-0.025em] sm:text-[44px]">
              {instruction.heading}
            </h1>
            <p className="text-ink-3 mt-3.5 max-w-[760px] text-[15px] leading-relaxed">
              {instruction.hint}
            </p>
          </div>
        )}

        <fieldset disabled={answersLocked} className="m-0 min-w-0 border-0 p-0">
          {isAudioStep(step) ? (
            <AudioExamTask
              step={step}
              answers={answers}
              setAnswer={setAnswer}
              checked={checked}
              correctAnswers={correctAnswers}
              numericCorrect={numericCorrect}
              results={results}
            />
          ) : step.task.taskType === "true_false" ? (
            <TrueFalseTask
              text={step.task.texts[0] ?? ""}
              statements={step.task.headings}
              answers={answers as (number | null)[]}
              onAnswer={(index, value) =>
                setAnswer(index, answers[index] === value ? null : value)
              }
              checked={checked}
              correctAnswers={numericCorrect}
              results={results}
            />
          ) : (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(360px,400px)_1fr]">
              <HeadingsBank
                headings={headings}
                assigned={answers as (number | null)[]}
                correctAnswers={numericCorrect}
                activeHeading={activeHeading}
                onPickHeading={pickHeading}
                onDetachText={detachText}
                checked={checked}
              />
              <div className="flex flex-col gap-3.5">
                {step.task.texts.map((body, index) => (
                  <TextCard
                    key={index}
                    letter={letterOf(index)}
                    body={body}
                    assignedN={(answers[index] as number | null) ?? null}
                    assignedHeadingQ={headingLabel(
                      answers[index] as number | null,
                    )}
                    armed={
                      !checked &&
                      !answersLocked &&
                      activeHeading !== null &&
                      answers[index] == null
                    }
                    activeHeading={activeHeading}
                    onAssign={() => assignToText(index)}
                    onClear={() => detachText(index)}
                    checked={checked}
                    isCorrect={results[index] ?? false}
                    correctN={numericCorrect[index]}
                    correctHeadingQ={headingLabel(numericCorrect[index])}
                  />
                ))}
              </div>
            </div>
          )}
        </fieldset>

        {submitError && (
          <div className="bg-err-soft text-err mt-6 rounded-md px-4 py-3 text-[14px]">
            {submitError}
          </div>
        )}

        <div className="bg-surface border-line mt-8 flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {data.steps.map((examStep, index) => (
              <button
                key={examStep.task.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                aria-label={`Перейти к заданию ${index + 1}`}
                className="grid h-8 min-w-8 place-items-center rounded-full px-2 font-mono text-[12px]"
                style={{
                  background:
                    index === currentStep
                      ? "var(--color-ink)"
                      : answeredPerStep[index]
                        ? "var(--color-accent-soft)"
                        : "var(--color-surface-2)",
                  color:
                    index === currentStep
                      ? "var(--color-on-ink)"
                      : answeredPerStep[index]
                        ? "var(--color-accent)"
                        : "var(--color-ink-3)",
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() =>
                setCurrentStep((stepIndex) => Math.max(0, stepIndex - 1))
              }
              disabled={currentStep === 0}
              className="rounded-pill border-line-2 inline-flex h-11 items-center justify-center border px-[18px] text-[14px] font-medium disabled:opacity-40"
            >
              ← Предыдущее
            </button>
            {currentStep < data.steps.length - 1 && (
              <button
                type="button"
                onClick={() =>
                  setCurrentStep((stepIndex) =>
                    Math.min(data.steps.length - 1, stepIndex + 1),
                  )
                }
                className="rounded-pill border-line-2 inline-flex h-11 items-center justify-center border px-[18px] text-[14px] font-medium"
              >
                Следующее →
              </button>
            )}
            {checked ? (
              <Link
                href={backHref}
                className="text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[20px] text-[14px] font-medium"
                style={{ background: "var(--color-ink)" }}
              >
                К списку заданий →
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={checkMutation.isPending}
                className="text-on-ink rounded-pill inline-flex h-11 items-center justify-center px-[20px] text-[14px] font-medium disabled:opacity-60"
                style={{ background: "var(--color-ink)" }}
              >
                {checkMutation.isPending ? "Проверяем..." : "Завершить"}
              </button>
            )}
          </div>
        </div>
      </main>

      {!checked && showConfirm && (
        <Modal size={500} onClose={() => setShowConfirm(false)}>
          <div className="px-7 pt-8 sm:px-9" style={{ paddingBottom: 28 }}>
            <div className="font-display text-[30px] leading-tight tracking-[-0.02em]">
              Завершить тренировку?
            </div>
            <p className="text-ink-2 mt-3 text-[15px] leading-relaxed">
              После завершения ответы нельзя будет изменить. Мы проверим все
              задания и покажем результат.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-pill border-line-2 inline-flex h-11 flex-1 items-center justify-center border px-5 text-[15px] font-medium"
              >
                Продолжить
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit(false)}
                disabled={checkMutation.isPending}
                className="text-on-ink rounded-pill inline-flex h-11 flex-1 items-center justify-center px-5 text-[15px] font-medium disabled:opacity-60"
                style={{ background: "var(--color-ink)" }}
              >
                {checkMutation.isPending ? "Проверяем..." : "Завершить"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {checked && showResult && result && (
        <ResultModal
          correct={result.correctCount}
          total={result.total}
          timeText={formatClock(result.timeSpent)}
          segments={segments}
          size={720}
          onClose={() => setShowResult(false)}
          onReview={() => {
            setShowResult(false);
            setShowReview(true);
          }}
        />
      )}

      {checked && showReview && result && (
        <ExamReviewModal
          steps={reviewSteps}
          onClose={() => setShowReview(false)}
        />
      )}
    </>
  );
}

function AudioExamTask({
  step,
  answers,
  setAnswer,
  checked,
  correctAnswers,
  numericCorrect,
  results,
}: {
  step: ExamStep & {
    task: ExamStep["task"] & {
      audioUrl: string;
      questions: AudioTaskQuestion[] | string[];
    };
  };
  answers: ExamAnswer[];
  setAnswer: (index: number, value: ExamAnswer) => void;
  checked: boolean;
  correctAnswers: (number | string | string[])[];
  numericCorrect: number[];
  results: boolean[];
}) {
  const content = asAudioContent(step);
  return (
    <>
      <AudioPlayer src={step.task.audioUrl} />
      <div className="h-7" />
      {content.taskType === "matching" ? (
        <MatchingTask
          rubrics={content.questions}
          answers={answers as (number | null)[]}
          setAnswer={setAnswer}
          checked={checked}
          correctAnswers={numericCorrect}
          results={results}
          speakerCount={step.task.total}
        />
      ) : content.taskType === "gap_fill" ? (
        <GapFillTask
          questions={content.questions}
          answers={answers as (string | null)[]}
          setAnswer={setAnswer}
          checked={checked}
          correctAnswers={correctAnswers}
        />
      ) : (
        <MultipleChoiceTask
          questions={content.questions}
          answers={answers as (number | null)[]}
          setAnswer={setAnswer}
          checked={checked}
          correctAnswers={numericCorrect}
          results={results}
        />
      )}
    </>
  );
}

function buildReviewSteps(
  data: ExamData,
  result: ExamResult,
  allAnswers: Map<number, ExamAnswer[]>,
) {
  return data.steps.map((step, stepIndex) => {
    const answers = allAnswers.get(stepIndex) ?? [];
    const grade = result.steps.find((item) => item.taskId === step.task.id);
    const correctAnswers = grade?.correctAnswers ?? [];
    const numericCorrect = correctAnswers.map(Number);
    const results = grade?.results ?? [];
    let items: ReviewItem[] = [];

    if (isAudioStep(step)) {
      const content = asAudioContent(step);
      if (content.taskType === "matching") {
        items = speakersFor(step.task.total).map((speaker, index) => {
          const userNumber = answers[index] as number | null;
          const correctNumber = numericCorrect[index];
          return {
            badge: speaker,
            title: `Высказывание говорящего ${speaker}`,
            userLabel: userNumber
              ? `${userNumber}. ${content.questions[userNumber - 1] ?? "—"}`
              : "Нет ответа",
            correctLabel: correctNumber
              ? `${correctNumber}. ${content.questions[correctNumber - 1] ?? "—"}`
              : undefined,
            isCorrect: results[index] ?? false,
            explanation: grade?.explanation[index],
          };
        });
      } else if (content.taskType === "gap_fill") {
        items = content.questions.map((question, index) => ({
          badge: String(6 + index),
          title: question.replace(/_{2,}/g, "[...]"),
          userLabel: normalizeGapFillAnswer(answers[index]) || "Нет ответа",
          correctLabel: formatGapFillAnswer(correctAnswers[index]),
          isCorrect: results[index] ?? false,
          explanation: grade?.explanation[index],
        }));
      } else {
        items = content.questions.map((question, index) => {
          const userNumber = answers[index] as number | null;
          const correctNumber = numericCorrect[index];
          return {
            badge: String(index + 1),
            title: question.questionText,
            userLabel: userNumber
              ? (question.options[userNumber - 1] ?? "—")
              : "Нет ответа",
            correctLabel: correctNumber
              ? (question.options[correctNumber - 1] ?? "—")
              : undefined,
            isCorrect: results[index] ?? false,
            explanation: grade?.explanation[index],
          };
        });
      }
    } else if (step.task.taskType === "true_false") {
      items = step.task.headings.map((statement, index) => ({
        badge: String(13 + index),
        title: statement,
        userLabel:
          typeof answers[index] === "number"
            ? (ANSWER_LABELS[answers[index]] ?? "—")
            : "Нет ответа",
        correctLabel: numericCorrect[index]
          ? (ANSWER_LABELS[numericCorrect[index]] ?? "—")
          : undefined,
        isCorrect: results[index] ?? false,
        explanation: grade?.explanation[index],
      }));
    } else {
      const headingLabel = (number: number | undefined) =>
        number ? step.task.headings[number - 1] : undefined;
      items = step.task.texts.map((_, index) => {
        const userNumber = answers[index] as number | null;
        const correctNumber = numericCorrect[index];
        return {
          badge: letterOf(index),
          title: headingLabel(correctNumber) ?? `Текст ${letterOf(index)}`,
          userLabel: userNumber
            ? `№${userNumber} — ${headingLabel(userNumber) ?? ""}`
            : "Нет ответа",
          correctLabel: correctNumber
            ? `№${correctNumber} — ${headingLabel(correctNumber) ?? ""}`
            : undefined,
          isCorrect: results[index] ?? false,
          explanation: grade?.explanation[index],
        };
      });
    }

    return { label: step.topicTitle, items };
  });
}
