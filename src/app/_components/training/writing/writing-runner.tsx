"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { api } from "@/trpc/react";
import { TrainingSubHeader } from "../shared/training-sub-header";
import { ResultModal, type ResultSegment } from "../shared/result-modal";
import { useElapsedTimer } from "@/app/_composables/use-elapsed-timer";
import { InstructionStrip } from "./instruction-strip";
import { ResultBanner } from "./result-banner";
import { StructureSection } from "./structure-section";
import { PhrasesSection, type PhraseItem } from "./phrases-section";
import { LinkersSection } from "./linkers-section";
import { ClozeSection } from "./cloze-section";
import { FullAnswersSection } from "./full-answers-section";

const BACK_HREF = "/";

function segment(label: string, arr: boolean[]): ResultSegment {
  const t = arr.filter(Boolean).length;
  return {
    label,
    value: `${t}/${arr.length}`,
    tone: arr.length > 0 && t === arr.length ? "ok" : t === 0 ? "err" : "warn",
  };
}

export function WritingRunner() {
  const { data: session } = useSession();

  const { data, isLoading, refetch } = api.training.getWritingTraining.useQuery(
    undefined,
    { gcTime: 0 },
  );
  const { data: topicData } =
    api.training.getTopicByTopicTitle.useQuery("Письмо Упражнения");
  const topicId = topicData?.id;

  const utils = api.useUtils();
  const checkMutation = api.training.checkWritingTraining.useMutation();
  const logMutation = api.training.logResult.useMutation({
    onSuccess: () => void utils.user.getStreak.invalidate(),
  });

  const [initialized, setInitialized] = useState(false);
  const [structureOrder, setStructureOrder] = useState<number[]>([]);
  const [phraseRows, setPhraseRows] = useState<
    { id: number; items: PhraseItem[] }[]
  >([]);
  const [linkerAssign, setLinkerAssign] = useState<Record<number, number>>({});
  const [clozeSel, setClozeSel] = useState<string[][]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof checkMutation.mutateAsync>
  > | null>(null);
  const [showInstruction, setShowInstruction] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const { seconds: elapsedSec, reset: resetTimer } = useElapsedTimer(
    !!data && !checked,
  );

  // Derived data from the composite task.
  const structure = data?.task.structure[0];
  const structureSentences = structure ? structure.task.split("\n") : [];
  const cliches = data?.task.cliches ?? [];
  const linkers = data?.task.linkers ?? [];
  const matching = linkers[0];
  const enLabels = matching ? matching.task.split("\n") : [];
  const ruBank = matching?.options ?? [];
  const clozeTasks = linkers.slice(1).map((l) => ({
    id: l.id,
    segments: l.task.split("\n"),
    options: l.options,
  }));
  const fullAnswers = data?.task.fullAnswers ?? [];

  // Initialize / reset all section state whenever a (new) task batch arrives.
  useEffect(() => {
    if (!data) return;
    const s = data.task.structure[0];
    setStructureOrder((s ? s.task.split("\n") : []).map((_, i) => i));
    setPhraseRows(
      data.task.cliches.map((c) => ({
        id: c.id,
        items: c.options.map((word, j) => ({
          key: `${c.id}-${j}-${word}`,
          word,
        })),
      })),
    );
    setLinkerAssign({});
    setClozeSel(
      data.task.linkers.slice(1).map((l) => l.task.split("\n").map(() => "")),
    );
    setPicks(data.task.fullAnswers.map(() => ""));
    setChecked(false);
    setResult(null);
    setShowResult(false);
    resetTimer();
    setInitialized(true);
  }, [data, resetTimer]);

  const clozeGaps = clozeSel.reduce((n, a) => n + a.length, 0);
  const filledCount =
    Object.keys(linkerAssign).length +
    clozeSel.flat().filter((v) => v).length +
    picks.filter((v) => v).length;
  const totalFillable = enLabels.length + clozeGaps + fullAnswers.length;

  const isChecking = checkMutation.isPending;

  const handleCheck = async () => {
    if (!data || !structure || isChecking) return;
    const answers = {
      structure: {
        id: structure.id,
        answer: structureOrder.map((idx) => idx + 1),
      },
      cliches: cliches.map((c, i) => ({
        id: c.id,
        answer: (phraseRows[i]?.items ?? []).map((it) => it.word),
      })),
      linkers: [
        {
          id: matching!.id,
          answer: enLabels.map((_, i) => {
            const ci = linkerAssign[i];
            return ci != null ? (ruBank[ci] ?? "") : "";
          }),
        },
        ...clozeTasks.map((t, k) => ({ id: t.id, answer: clozeSel[k] ?? [] })),
      ],
      fullAnswers: fullAnswers.map((fa, i) => ({
        id: fa.id,
        answer: picks[i] ?? "",
      })),
    };

    const res = await checkMutation.mutateAsync({ answers });
    setResult(res);
    setChecked(true);
    setShowInstruction(false);
    setShowResult(true);

    const resultRatio = `${res.correctCount}/${res.total}`;
    posthog.capture("training_completed", {
      training_type: "writing",
      topic: data.topicTitle,
      correct_count: res.correctCount,
      total: res.total,
      result: resultRatio,
    });

    if (session?.user && topicId) {
      logMutation.mutate({
        activityId: topicId,
        activityType: "training",
        result: resultRatio,
        timeSpent: elapsedSec,
      });
    }
  };

  const handleRetry = () => {
    setChecked(false);
    setShowResult(false);
    void refetch();
  };

  if (isLoading || (data && !initialized)) {
    return (
      <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
        Загрузка задания...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[980px] px-6 py-24 text-center">
        <div className="font-display text-[32px] tracking-[-0.02em]">
          Не удалось загрузить задание
        </div>
        <p className="text-ink-3 mt-3">Попробуйте ещё раз.</p>
        <Link
          href={BACK_HREF}
          className="rounded-pill text-on-ink mt-6 inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium"
          style={{ background: "var(--color-ink)" }}
        >
          К списку тренировок →
        </Link>
      </div>
    );
  }

  const segments: ResultSegment[] | undefined = result
    ? [
        segment("Структура", result.structureCorrectness),
        segment("Клише", result.clichesCorrectness.flat()),
        segment("Связки", result.linkersCorrectness[0] ?? []),
        segment("Cloze", result.linkersCorrectness.slice(1).flat()),
        segment("Ответы", result.fullAnswersCorrectness),
      ]
    : undefined;

  return (
    <>
      <TrainingSubHeader
        backHref={BACK_HREF}
        section="Раздел 4 · письмо"
        taskTitle={data.topicTitle}
        answeredCount={filledCount}
        total={totalFillable}
        elapsedSec={elapsedSec}
        onShowInstruction={() => setShowInstruction(true)}
      />

      <div className="mx-auto w-full max-w-[980px] px-6 pt-8 pb-32">
        {!checked && !showInstruction && (
          <button
            type="button"
            onClick={() => setShowInstruction(true)}
            className="rounded-pill border-line-2 mb-4 inline-flex h-9 items-center gap-2 border px-4 text-[14px] font-medium"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            Показать инструкцию
          </button>
        )}
        {showInstruction && (
          <InstructionStrip onCloseAction={() => setShowInstruction(false)} />
        )}

        {checked && result && segments && (
          <ResultBanner
            correct={result.correctCount}
            total={result.total}
            segments={segments}
            onRetry={handleRetry}
          />
        )}

        <StructureSection
          sentences={structureSentences}
          order={structureOrder}
          onReorder={setStructureOrder}
          checked={checked}
          correctness={result?.structureCorrectness ?? []}
        />

        <PhrasesSection
          rows={phraseRows}
          onReorder={(rowIdx, items) =>
            setPhraseRows((prev) =>
              prev.map((r, i) => (i === rowIdx ? { ...r, items } : r)),
            )
          }
          checked={checked}
          correctness={result?.clichesCorrectness ?? []}
        />

        <LinkersSection
          enLabels={enLabels}
          ruBank={ruBank}
          assign={linkerAssign}
          onAssign={(enIndex, chipIndex) =>
            setLinkerAssign((prev) => {
              const next = { ...prev };
              for (const k of Object.keys(next)) {
                if (next[Number(k)] === chipIndex) delete next[Number(k)];
              }
              next[enIndex] = chipIndex;
              return next;
            })
          }
          onClear={(enIndex) =>
            setLinkerAssign((prev) => {
              const next = { ...prev };
              delete next[enIndex];
              return next;
            })
          }
          checked={checked}
          correctness={result?.linkersCorrectness[0] ?? []}
        />

        <ClozeSection
          tasks={clozeTasks}
          values={clozeSel}
          onChange={(ti, gi, value) =>
            setClozeSel((prev) => {
              const next = prev.map((a) => a.slice());
              const row = next[ti];
              if (row) row[gi] = value;
              return next;
            })
          }
          checked={checked}
          correctness={result?.linkersCorrectness.slice(1) ?? []}
        />

        <FullAnswersSection
          questions={fullAnswers}
          picks={picks}
          onPick={(qi, text) =>
            setPicks((prev) => {
              const next = [...prev];
              next[qi] = text;
              return next;
            })
          }
          checked={checked}
          correctness={result?.fullAnswersCorrectness ?? []}
        />

        <div className="bg-surface border-line sticky bottom-5 mt-7 flex flex-col gap-3 rounded-lg border p-4 shadow-lg sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2.5 sm:p-[18px]">
          {checked && (
            <div className="text-ink-3 mr-auto text-[13.5px]">
              После разбора похожие задания попадут в{" "}
              <strong className="text-ink">повтор</strong>.
            </div>
          )}
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
                className="rounded-pill text-on-ink inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium"
                style={{ background: "var(--color-ink)" }}
              >
                К списку тренировок →
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCheck}
              disabled={isChecking}
              className="rounded-pill text-on-ink inline-flex h-11 items-center justify-center px-[22px] text-[15px] font-medium disabled:opacity-60"
              style={{ background: "var(--color-ink)" }}
            >
              {isChecking ? "Проверяем..." : "Проверить →"}
            </button>
          )}
        </div>
      </div>

      {checked && showResult && result && (
        <ResultModal
          correct={result.correctCount}
          total={result.total}
          segments={segments}
          onClose={() => setShowResult(false)}
          onReview={() => setShowResult(false)}
        />
      )}
    </>
  );
}
