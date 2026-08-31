"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import posthog from "posthog-js";

import { api } from "@/trpc/react";
import { DIAGNOSTICS_VERSION } from "@/shared/diagnostics-questions";
import { part1Questions, part2Questions } from "@/app/diagnostics/grammar/data";
import { SectionSubHeader } from "@/app/_components/training/shared/training-sub-header";
import { Modal } from "@/app/_components/Modal";
import { FillCard } from "./fill-card";
import { TranslateCard } from "./translate-card";
import { DiagnosticResultView } from "./diagnostic-result-view";

interface Answers {
  part1: Record<number, string[]>;
  part2: Record<number, string>;
}

const BLANK_RE = /_____________/g;

const PARTS = [
  {
    n: 1,
    label: "Формы слов",
    instruction:
      "Complete the sentences with the correct form of the word in brackets.",
  },
  {
    n: 2,
    label: "Перевод",
    instruction:
      "Translate the following sentences into English. Pay attention to the grammar topics in bold.",
  },
] as const;

// Pre-seed every Part 1 question with an empty string per blank so the answer
// arrays are never sparse (checkResults indexes by blank position).
const buildInitialPart1 = (): Record<number, string[]> =>
  Object.fromEntries(
    part1Questions.map((q) => [
      q.id,
      Array((q.text.match(BLANK_RE) ?? []).length).fill(""),
    ]),
  );

const PRIMARY_BTN =
  "rounded-pill inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium text-on-ink transition-transform hover:-translate-y-px disabled:translate-y-0 disabled:opacity-60";
const SECONDARY_BTN =
  "rounded-pill border-line-2 inline-flex h-11 items-center justify-center border px-[22px] text-[15px] font-medium transition-colors hover:bg-surface-2";

export function GrammarRunner() {
  const router = useRouter();
  const { status } = useSession();

  const [currentPart, setCurrentPart] = useState(1);
  const [answers, setAnswers] = useState<Answers>(() => ({
    part1: buildInitialPart1(),
    part2: {},
  }));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [partial, setPartial] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { data: hasCompleted, isLoading: isLoadingCompletionStatus } =
    api.diagnostics.hasCompletedDiagnostics.useQuery(undefined, {
      enabled: status === "authenticated",
    });

  const apiUtils = api.useUtils();
  const {
    data: pendingReport,
    isLoading: isLoadingProgress,
    isFetching: isFetchingProgress,
  } = api.diagnostics.getPendingDiagnostics.useQuery(undefined, {
    enabled: status === "authenticated" && !hasCompleted && !isSubmitted,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  useEffect(() => {
    // A cached partial report may be older than the run on the server. Wait
    // for the refetch before restoring it and disabling this query.
    if (!pendingReport || isSubmitted || isFetchingProgress) return;
    setAnswers({
      part1: Object.fromEntries(
        pendingReport.submission.part1.map((task) => [
          task.id,
          task.userAnswers,
        ]),
      ),
      part2: Object.fromEntries(
        pendingReport.submission.part2.map((task) => [
          task.id,
          task.userTranslation,
        ]),
      ),
    });
    setFeedback(pendingReport.feedback);
    setPartial(true);
    setIsSubmitted(true);
  }, [pendingReport, isSubmitted, isFetchingProgress]);

  useEffect(() => {
    if (status === "unauthenticated") setShowAuthModal(true);
    if (hasCompleted) router.push("/");
  }, [status, hasCompleted, router]);

  const checkGrammarMutation = api.diagnostics.checkGrammar.useMutation({
    onSuccess: async (data) => {
      setFeedback(data.feedback);
      setPartial(true); // Do not claim completion before reading persisted status.
      setIsSubmitted(true);
      setProgressError(null);
      window.scrollTo(0, 0);
      try {
        // The pre-submit query may have cached null. Always read the status
        // persisted by this mutation, not that earlier completion snapshot.
        await apiUtils.diagnostics.getPendingDiagnostics.cancel();
        const pending = await apiUtils.diagnostics.getPendingDiagnostics.fetch(
          undefined,
          { staleTime: 0 },
        );
        setPartial(!!pending);
        posthog.capture(
          pending ? "diagnostics_partial" : "diagnostics_completed",
          {
            diagnostics_type: "grammar",
          },
        );
        if (!pending) {
          void apiUtils.user.getStreak.invalidate();
          void apiUtils.user.getActivity.invalidate();
        }
      } catch {
        setProgressError(
          "Не удалось уточнить статус проверки. Разбор доступен ниже; попробуй повторить запрос позднее.",
        );
      }
    },
  });

  const handlePart1Change = (id: number, index: number, value: string) =>
    setAnswers((prev) => {
      const next = [...(prev.part1[id] ?? [])];
      next[index] = value;
      return { ...prev, part1: { ...prev.part1, [id]: next } };
    });

  const handlePart2Change = (id: number, value: string) =>
    setAnswers((prev) => ({
      ...prev,
      part2: { ...prev.part2, [id]: value },
    }));

  const goToPart = (part: number) => {
    setCurrentPart(part);
    window.scrollTo(0, 0);
  };

  const part1Answered = part1Questions.filter((q) =>
    (answers.part1[q.id] ?? []).some((a) => a.trim()),
  ).length;
  const part2Answered = part2Questions.filter((q) =>
    (answers.part2[q.id] ?? "").trim(),
  ).length;

  const handleSubmit = () => {
    const payload = {
      version: DIAGNOSTICS_VERSION as typeof DIAGNOSTICS_VERSION,
      part1: part1Questions.map((q) => ({
        id: q.id,
        userAnswers: answers.part1[q.id] ?? [],
      })),
      part2: part2Questions.map((q) => ({
        id: q.id,
        userTranslation: answers.part2[q.id] ?? "",
      })),
    };
    posthog.capture("diagnostics_submitted", {
      diagnostics_type: "grammar",
      part1_answers_count: part1Answered,
      part2_answers_count: part2Answered,
    });
    setProgressError(null);
    checkGrammarMutation.mutate(payload);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (
    status === "loading" ||
    isLoadingCompletionStatus ||
    (status === "authenticated" &&
      (isLoadingProgress || isFetchingProgress) &&
      !isSubmitted)
  ) {
    return (
      <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
        Загрузка...
      </div>
    );
  }

  // ── Auth required ────────────────────────────────────────────────────────
  if (showAuthModal) {
    return (
      <Modal size={440} onClose={() => router.push("/")}>
        <div className="p-7 sm:p-9">
          <div className="font-display text-ink text-[22px] tracking-[-0.02em] sm:text-[26px]">
            Только для участников
          </div>
          <p className="text-ink-3 mt-2.5 text-[15px] leading-relaxed">
            Диагностика доступна авторизованным пользователям. Войдите, чтобы
            пройти тест и получить персональный разбор.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/auth/signin")}
              className={`${PRIMARY_BTN} flex-1`}
              style={{ background: "var(--color-ink)" }}
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className={`${SECONDARY_BTN} flex-1`}
            >
              На главную
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Results / feedback ─────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <DiagnosticResultView
        feedback={feedback}
        partial={partial}
        onRetry={handleSubmit}
        isRetrying={checkGrammarMutation.isPending}
        retryError={checkGrammarMutation.error?.message ?? progressError}
      />
    );
  }

  // ── Test (Part 1 / Part 2) ─────────────────────────────────────────────────
  const part = PARTS[currentPart - 1]!;
  const answeredNow = currentPart === 1 ? part1Answered : part2Answered;
  const totalNow =
    currentPart === 1 ? part1Questions.length : part2Questions.length;
  const isChecking = checkGrammarMutation.isPending;

  return (
    <>
      <SectionSubHeader
        section="Диагностика · грамматика"
        title="Первоначальный тест"
        backHref="/"
      />

      <div className="mx-auto w-full max-w-[820px] px-5 pt-6 pb-32 sm:px-8 sm:pt-8">
        {/* Part stepper */}
        <div className="flex items-center gap-2">
          {PARTS.map((p) => {
            const active = currentPart === p.n;
            const answered = p.n === 1 ? part1Answered : part2Answered;
            const total =
              p.n === 1 ? part1Questions.length : part2Questions.length;
            return (
              <button
                key={p.n}
                type="button"
                onClick={() => goToPart(p.n)}
                className={`flex flex-1 items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors sm:px-4 sm:py-3 ${
                  active
                    ? "border-ink bg-ink text-on-ink"
                    : "border-line bg-surface text-ink-3 hover:bg-surface-2"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] ${
                    active
                      ? "bg-on-ink-soft text-on-ink"
                      : "bg-surface-2 text-ink-3"
                  }`}
                >
                  {p.n}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium sm:text-[14px]">
                    Часть {p.n}
                  </span>
                  <span
                    className={`block truncate font-mono text-[10.5px] ${
                      active ? "text-on-ink-muted" : "text-ink-4"
                    }`}
                  >
                    {answered}/{total}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Part intro */}
        <div className="mt-6">
          <div className="text-ink-3 font-mono text-[11px] tracking-[0.1em] uppercase">
            Часть {currentPart} из 2
          </div>
          <h1 className="font-display mt-2 text-[26px] leading-tight tracking-[-0.02em] sm:text-[34px]">
            {part.label}
          </h1>
          <p className="text-ink-3 mt-2 text-[15px] leading-relaxed italic sm:text-[16px]">
            {part.instruction}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-7 flex flex-col gap-3.5">
          {currentPart === 1
            ? part1Questions.map((q, i) => (
                <FillCard
                  key={q.id}
                  n={i + 1}
                  text={q.text}
                  values={answers.part1[q.id] ?? []}
                  onChange={(index, value) =>
                    handlePart1Change(q.id, index, value)
                  }
                />
              ))
            : part2Questions.map((q, i) => (
                <TranslateCard
                  key={q.id}
                  n={i + 1}
                  text={q.text}
                  topics={q.topics}
                  value={answers.part2[q.id] ?? ""}
                  onChange={(value) => handlePart2Change(q.id, value)}
                />
              ))}
        </div>

        {checkGrammarMutation.error && (
          <div className="border-err/30 bg-err-soft text-err mt-5 rounded-md border px-4 py-3 text-[14px]">
            {checkGrammarMutation.error.message}
          </div>
        )}

        {/* Sticky action bar */}
        <div className="bg-surface border-line sticky bottom-4 mt-7 flex flex-col gap-3 rounded-lg border p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="text-ink-3 text-[14px]">
            Заполнено:{" "}
            <strong className="text-ink font-mono">
              {answeredNow} / {totalNow}
            </strong>
          </div>
          <div className="flex gap-2.5">
            {currentPart === 1 ? (
              <>
                <Link
                  href="/"
                  className={`${SECONDARY_BTN} flex-1 sm:flex-none`}
                >
                  Выйти
                </Link>
                <button
                  type="button"
                  onClick={() => goToPart(2)}
                  className={`${PRIMARY_BTN} flex-1 sm:flex-none`}
                  style={{ background: "var(--color-ink)" }}
                >
                  Далее →
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => goToPart(1)}
                  className={`${SECONDARY_BTN} flex-1 sm:flex-none`}
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isChecking}
                  className={`${PRIMARY_BTN} flex-1 sm:flex-none`}
                  style={{ background: "var(--color-ink)" }}
                >
                  {isChecking ? "Анализируем..." : "Отправить на проверку →"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Analyzing overlay */}
      {isChecking && (
        <Modal size={380} onClose={() => undefined}>
          <div className="flex flex-col items-center gap-4 px-8 py-10 text-center">
            <div className="border-line border-t-accent h-10 w-10 animate-spin rounded-full border-[3px]" />
            <div className="font-display text-ink text-[20px]">
              Анализируем твои ответы
            </div>
            <p className="text-ink-3 text-[14px] leading-relaxed">
              Это займёт несколько секунд. ИИ готовит персональный разбор по
              каждому заданию.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
