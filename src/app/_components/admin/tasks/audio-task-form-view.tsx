"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { CustomSelect } from "@/app/_components/ui/custom-select";
import { normalizeAudioUrl } from "@/app/_utils/audio";
import type { AudioTaskType } from "@/server/db/schema";

// ─── Multiple-choice state ─────────────────────────────────────────────────

interface QuestionItem {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanationText: string;
  highlightedText: string;
}

const DEFAULT_QUESTION = (): QuestionItem => ({
  questionText: "",
  options: ["", "", ""],
  correctAnswer: 0,
  explanationText: "",
  highlightedText: "",
});

// ─── Matching state ────────────────────────────────────────────────────────

interface MatchingFormState {
  rubrics: string[];
  speakerAnswers: number[];
  explanations: { text: string; highlightedText: string }[];
}

const DEFAULT_MATCHING = (): MatchingFormState => ({
  rubrics: ["", "", "", "", "", ""],
  speakerAnswers: [0, 0, 0, 0, 0],
  explanations: Array.from({ length: 5 }, () => ({
    text: "",
    highlightedText: "",
  })),
});

// ─── Gap-fill state ────────────────────────────────────────────────────────

interface GapFillFormState {
  templates: string[];
  answers: string[][];
  explanations: { text: string; highlightedText: string }[];
}

const DEFAULT_GAP_FILL = (): GapFillFormState => ({
  templates: ["", "", "", "", "", ""],
  answers: [[""], [""], [""], [""], [""], [""]],
  explanations: Array.from({ length: 6 }, () => ({
    text: "",
    highlightedText: "",
  })),
});

// ─── Topic → task type mapping ─────────────────────────────────────────────

const TOPIC_TASK_TYPE_MAP: Record<string, AudioTaskType> = {
  "Задания 1-4": "multiple_choice",
  "Задание 5": "matching",
  "Задания 6-11": "gap_fill",
};

const TASK_TYPE_LABELS: Record<AudioTaskType, string> = {
  multiple_choice: "Выбор ответа (задания 1-4)",
  matching: "Соотнесение (задание 5)",
  gap_fill: "Заполнение пропусков (задания 6-11)",
};

const SPEAKER_LETTERS = ["A", "B", "C", "D", "E"];

export function AudioTaskFormView({ taskId }: { taskId?: number }) {
  const router = useRouter();
  const isEditMode = Boolean(taskId);

  const [topicId, setTopicId] = useState<number | "">("");
  const [audioUrl, setAudioUrl] = useState("");
  const [taskType, setTaskType] = useState<AudioTaskType | null>(null);

  // Multiple-choice state
  const [questions, setQuestions] = useState<QuestionItem[]>([
    DEFAULT_QUESTION(),
    DEFAULT_QUESTION(),
    DEFAULT_QUESTION(),
    DEFAULT_QUESTION(),
  ]);

  // Matching state
  const [matching, setMatching] =
    useState<MatchingFormState>(DEFAULT_MATCHING());

  // Gap-fill state
  const [gapFill, setGapFill] = useState<GapFillFormState>(DEFAULT_GAP_FILL());

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: topics } = api.admin.getAudioTopics.useQuery();

  console.log(topics);

  const { data: existingTask, isLoading: isLoadingTask } =
    api.admin.getAudioTaskById.useQuery(
      { id: taskId! },
      { enabled: isEditMode },
    );

  const createMutation = api.admin.createAudioTask.useMutation();
  const updateMutation = api.admin.updateAudioTask.useMutation();

  // Derive taskType from selected topic
  const selectedTopic = topics?.find((t) => t.id === topicId);
  useEffect(() => {
    if (selectedTopic) {
      const derived =
        TOPIC_TASK_TYPE_MAP[selectedTopic.title] ?? "multiple_choice";
      setTaskType(derived);
    } else if (!isEditMode) {
      setTaskType(null);
    }
  }, [selectedTopic, isEditMode]);

  // Load existing task data
  useEffect(() => {
    if (!existingTask) return;
    setTopicId(existingTask.topicId ?? "");
    setAudioUrl(existingTask.audioUrl);

    const type = existingTask.taskType ?? "multiple_choice";
    setTaskType(type);

    if (type === "multiple_choice") {
      if (existingTask.questions && existingTask.questions.length > 0) {
        const loadedQuestions: QuestionItem[] = existingTask.questions.map(
          (q, idx) => {
            const rawAns = existingTask.answers?.[idx];
            const correctAnswer =
              typeof rawAns === "number" && rawAns >= 1 ? rawAns - 1 : 0;
            const qObj = q as { questionText: string; options: string[] };
            return {
              questionText: qObj.questionText,
              options: qObj.options ? [...qObj.options] : ["", "", ""],
              correctAnswer,
              explanationText: existingTask.explanations?.[idx]?.text ?? "",
              highlightedText:
                existingTask.explanations?.[idx]?.highlightedText ?? "",
            };
          },
        );
        setQuestions(loadedQuestions);
      }
    } else if (type === "matching") {
      setMatching({
        rubrics:
          (existingTask.questions as string[]) ?? DEFAULT_MATCHING().rubrics,
        speakerAnswers:
          (existingTask.answers as number[]) ??
          DEFAULT_MATCHING().speakerAnswers,
        explanations:
          existingTask.explanations?.map((e) => ({
            text: e.text ?? "",
            highlightedText: e.highlightedText ?? "",
          })) ?? DEFAULT_MATCHING().explanations,
      });
    } else if (type === "gap_fill") {
      const rawAnswers = existingTask.answers as (string | string[])[];
      setGapFill({
        templates:
          (existingTask.questions as string[]) ?? DEFAULT_GAP_FILL().templates,
        answers: rawAnswers.map((a) => (Array.isArray(a) ? a : [String(a)])),
        explanations:
          existingTask.explanations?.map((e) => ({
            text: e.text ?? "",
            highlightedText: e.highlightedText ?? "",
          })) ?? DEFAULT_GAP_FILL().explanations,
      });
    }
  }, [existingTask]);

  // ─── Audio upload ──────────────────────────────────────────────────────────

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || data.error) {
        setUploadError(data.error ?? "Ошибка при загрузке аудиофайла");
      } else if (data.url) {
        setAudioUrl(data.url);
      }
    } catch (err) {
      console.error(err);
      setUploadError("Не удалось отправить файл на сервер");
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Multiple-choice helpers ───────────────────────────────────────────────

  const updateQuestion = (
    qIndex: number,
    field: keyof QuestionItem,
    value: unknown,
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, [field]: value } : q)),
    );
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const newOptions = [...q.options];
        newOptions[oIndex] = text;
        return { ...q, options: newOptions };
      }),
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        if (q.options.length <= 2) return q;
        const newOptions = q.options.filter((_, i) => i !== oIndex);
        const newCorrect =
          q.correctAnswer >= newOptions.length ? 0 : q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer: newCorrect };
      }),
    );
  };

  const addQuestionBlock = () => {
    setQuestions((prev) => [...prev, DEFAULT_QUESTION()]);
  };

  const removeQuestionBlock = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  // ─── Matching helpers ──────────────────────────────────────────────────────

  const updateRubric = (idx: number, text: string) => {
    setMatching((prev) => {
      const rubrics = [...prev.rubrics];
      rubrics[idx] = text;
      return { ...prev, rubrics };
    });
  };

  const updateSpeakerAnswer = (speakerIdx: number, rubricNum: number) => {
    setMatching((prev) => {
      const speakerAnswers = [...prev.speakerAnswers];
      speakerAnswers[speakerIdx] = rubricNum;
      return { ...prev, speakerAnswers };
    });
  };

  const updateMatchingExplanation = (
    idx: number,
    field: "text" | "highlightedText",
    value: string,
  ) => {
    setMatching((prev) => {
      const explanations = prev.explanations.map((e, i) =>
        i === idx ? { ...e, [field]: value } : e,
      );
      return { ...prev, explanations };
    });
  };

  // ─── Gap-fill helpers ──────────────────────────────────────────────────────

  const updateTemplate = (idx: number, text: string) => {
    setGapFill((prev) => {
      const templates = [...prev.templates];
      templates[idx] = text;
      return { ...prev, templates };
    });
  };

  const updateGapAnswer = (
    templateIdx: number,
    variantIdx: number,
    text: string,
  ) => {
    setGapFill((prev) => {
      const answers = prev.answers.map((variants, i) => {
        if (i !== templateIdx) return variants;
        const newVariants = [...variants];
        newVariants[variantIdx] = text;
        return newVariants;
      });
      return { ...prev, answers };
    });
  };

  const addGapAnswerVariant = (templateIdx: number) => {
    setGapFill((prev) => {
      const answers = prev.answers.map((variants, i) =>
        i === templateIdx ? [...variants, ""] : variants,
      );
      return { ...prev, answers };
    });
  };

  const removeGapAnswerVariant = (templateIdx: number, variantIdx: number) => {
    setGapFill((prev) => {
      const answers = prev.answers.map((variants, i) => {
        if (i !== templateIdx || variants.length <= 1) return variants;
        return variants.filter((_, vi) => vi !== variantIdx);
      });
      return { ...prev, answers };
    });
  };

  const addGapTemplate = () => {
    setGapFill((prev) => ({
      ...prev,
      templates: [...prev.templates, ""],
      answers: [...prev.answers, [""]],
      explanations: [...prev.explanations, { text: "", highlightedText: "" }],
    }));
  };

  const removeGapTemplate = (idx: number) => {
    if (gapFill.templates.length <= 1) return;
    setGapFill((prev) => ({
      ...prev,
      templates: prev.templates.filter((_, i) => i !== idx),
      answers: prev.answers.filter((_, i) => i !== idx),
      explanations: prev.explanations.filter((_, i) => i !== idx),
    }));
  };

  const updateGapExplanation = (
    idx: number,
    field: "text" | "highlightedText",
    value: string,
  ) => {
    setGapFill((prev) => {
      const explanations = prev.explanations.map((e, i) =>
        i === idx ? { ...e, [field]: value } : e,
      );
      return { ...prev, explanations };
    });
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (topicId === "") {
      setFormError("Пожалуйста, выберите тему задания.");
      return;
    }
    if (!audioUrl.trim()) {
      setFormError("Пожалуйста, укажите URL или загрузите аудиофайл.");
      return;
    }
    if (!taskType) {
      setFormError("Не удалось определить тип задания. Выберите тему.");
      return;
    }

    let payload;

    if (taskType === "multiple_choice") {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]!;
        if (!q.questionText.trim()) {
          setFormError(`Вопрос №${i + 1}: введите текст вопроса.`);
          return;
        }
        if (q.options.some((opt) => !opt.trim())) {
          setFormError(
            `Вопрос №${i + 1}: все варианты ответов должны быть заполнены.`,
          );
          return;
        }
        if (!q.explanationText.trim()) {
          setFormError(`Вопрос №${i + 1}: введите текст пояснения.`);
          return;
        }
      }
      payload = {
        taskType: "multiple_choice" as const,
        topicId: Number(topicId),
        audioUrl: audioUrl.trim(),
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.map((opt) => opt.trim()),
        })),
        answers: questions.map((q) => q.correctAnswer + 1),
        explanations: questions.map((q) => ({
          text: q.explanationText.trim(),
          highlightedText: q.highlightedText.trim() || undefined,
        })),
      };
    } else if (taskType === "matching") {
      for (let i = 0; i < matching.rubrics.length; i++) {
        if (!matching.rubrics[i]!.trim()) {
          setFormError(`Рубрика №${i + 1}: введите текст рубрики.`);
          return;
        }
      }
      for (let i = 0; i < matching.speakerAnswers.length; i++) {
        if (!matching.speakerAnswers[i]) {
          setFormError(`Спикер ${SPEAKER_LETTERS[i]}: выберите рубрику.`);
          return;
        }
      }
      for (let i = 0; i < matching.explanations.length; i++) {
        if (!matching.explanations[i]!.text.trim()) {
          setFormError(
            `Пояснение для спикера ${SPEAKER_LETTERS[i]}: введите текст.`,
          );
          return;
        }
      }
      payload = {
        taskType: "matching" as const,
        topicId: Number(topicId),
        audioUrl: audioUrl.trim(),
        questions: matching.rubrics.map((r) => r.trim()),
        answers: matching.speakerAnswers,
        explanations: matching.explanations.map((e) => ({
          text: e.text.trim(),
          highlightedText: e.highlightedText.trim() || undefined,
        })),
      };
    } else {
      for (let i = 0; i < gapFill.templates.length; i++) {
        if (!gapFill.templates[i]!.trim()) {
          setFormError(`Предложение №${i + 1}: введите шаблон.`);
          return;
        }
      }
      for (let i = 0; i < gapFill.answers.length; i++) {
        const variants = gapFill.answers[i]!;
        if (variants.every((v) => !v.trim())) {
          setFormError(`Ответ №${i + 1}: введите хотя бы один вариант.`);
          return;
        }
      }
      for (let i = 0; i < gapFill.explanations.length; i++) {
        if (!gapFill.explanations[i]!.text.trim()) {
          setFormError(`Пояснение №${i + 1}: введите текст.`);
          return;
        }
      }
      payload = {
        taskType: "gap_fill" as const,
        topicId: Number(topicId),
        audioUrl: audioUrl.trim(),
        questions: gapFill.templates.map((t) => t.trim()),
        answers: gapFill.answers.map((variants) => {
          const filtered = variants.map((v) => v.trim()).filter(Boolean);
          return filtered.length === 1 ? filtered[0]! : filtered;
        }),
        explanations: gapFill.explanations.map((e) => ({
          text: e.text.trim(),
          highlightedText: e.highlightedText.trim() || undefined,
        })),
      };
    }

    try {
      if (isEditMode && taskId) {
        await updateMutation.mutateAsync({ id: taskId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/admin/tasks/audio");
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error ? err.message : "Произошла ошибка при сохранении",
      );
    }
  };

  if (isEditMode && isLoadingTask) {
    return (
      <div className="text-ink-3 mx-auto max-w-[900px] py-12 text-center">
        Загрузка данных задания #{taskId}...
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[900px] space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/tasks/audio"
          className="text-ink-3 hover:text-ink mb-1 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          &larr; Назад к списку заданий
        </Link>
        <h1 className="font-display text-[28px] tracking-tight sm:text-[34px]">
          {isEditMode
            ? `Редактирование задания по аудированию #${taskId}`
            : "Новое задание по аудированию"}
        </h1>
      </div>

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-700">
          {formError}
        </div>
      )}

      {/* ── Section 1: Basic Parameters ── */}
      <div className="bg-surface border-line space-y-5 rounded-xl border p-6 shadow-xs">
        <h2 className="font-display text-[20px] font-semibold">
          1. Основные параметры
        </h2>

        <div>
          <label className="text-ink mb-1.5 block text-[14px] font-medium">
            Тема задания *
          </label>
          <CustomSelect
            options={
              topics?.map((t) => ({ value: t.id, label: t.title })) ?? []
            }
            value={topicId}
            onChange={(val) => setTopicId(val)}
            placeholder="-- Выберите тему из списка --"
            className="w-full"
          />
          {taskType && (
            <div className="text-ink-3 mt-2 text-[13px]">
              Тип задания:{" "}
              <span className="text-ink font-medium">
                {TASK_TYPE_LABELS[taskType]}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-ink block text-[14px] font-medium">
            Аудиозапись *
          </label>
          <div className="border-line bg-surface-2/50 relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center">
            <svg
              className="text-ink-4 mb-2 h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-ink text-[14px] font-medium">
              Перетащите аудиофайл (.mp3, .wav, .m4a) сюда или
            </p>
            <label className="bg-ink hover:bg-ink-2 text-on-ink mt-2 inline-flex cursor-pointer items-center rounded-lg px-4 py-2 text-[13px] font-medium transition-colors">
              Выбрать файл с компьютера
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileUpload(file);
                }}
              />
            </label>
            {isUploading && (
              <div className="text-accent mt-2 text-[13px] font-medium">
                Загрузка аудиофайла на сервер...
              </div>
            )}
            {uploadError && (
              <div className="mt-2 text-[13px] font-medium text-red-600">
                {uploadError}
              </div>
            )}
          </div>
          <div>
            <span className="text-ink-3 mb-1.5 block text-[13px]">
              Или укажите прямую ссылку на аудиофайл (URL):
            </span>
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://... или /uploads/audio/example.mp3"
              className="bg-surface-2 border-line text-ink w-full rounded-lg border px-3.5 py-2.5 font-mono text-[14px] focus:outline-hidden"
            />
          </div>
          {audioUrl.trim() && (
            <div className="bg-surface-2 border-line rounded-lg border p-3">
              <span className="text-ink-3 mb-1 block text-[12px] font-medium">
                Предпросмотр аудиоплеера:
              </span>
              <audio
                src={normalizeAudioUrl(audioUrl)}
                controls
                className="h-10 w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2+: Task-type-specific constructor ── */}

      {!taskType && (
        <div className="bg-surface border-line rounded-xl border p-8 text-center shadow-xs">
          <p className="text-ink-3 text-[15px]">
            Выберите тему задания, чтобы отобразить конструктор вопросов.
          </p>
        </div>
      )}

      {taskType === "multiple_choice" && (
        <MultipleChoiceSection
          questions={questions}
          updateQuestion={updateQuestion}
          updateOptionText={updateOptionText}
          addOption={addOption}
          removeOption={removeOption}
          addQuestionBlock={addQuestionBlock}
          removeQuestionBlock={removeQuestionBlock}
        />
      )}

      {taskType === "matching" && (
        <MatchingSection
          state={matching}
          updateRubric={updateRubric}
          updateSpeakerAnswer={updateSpeakerAnswer}
          updateExplanation={updateMatchingExplanation}
        />
      )}

      {taskType === "gap_fill" && (
        <GapFillSection
          state={gapFill}
          updateTemplate={updateTemplate}
          updateAnswer={updateGapAnswer}
          addAnswerVariant={addGapAnswerVariant}
          removeAnswerVariant={removeGapAnswerVariant}
          addTemplate={addGapTemplate}
          removeTemplate={removeGapTemplate}
          updateExplanation={updateGapExplanation}
        />
      )}

      {/* ── Bottom Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/admin/tasks/audio"
          className="border-line text-ink hover:bg-surface rounded-lg border px-5 py-2.5 text-[14.5px] font-medium transition-colors"
        >
          Отмена
        </Link>
        <button
          type="submit"
          disabled={isSaving || !taskType}
          className="bg-ink hover:bg-ink-2 text-on-ink rounded-lg px-6 py-2.5 text-[14.5px] font-medium transition-colors disabled:opacity-50"
        >
          {isSaving
            ? "Сохранение..."
            : isEditMode
              ? "Сохранить изменения"
              : "Создать задание"}
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Multiple-choice section (existing logic, extracted)
// ═══════════════════════════════════════════════════════════════════════════

function MultipleChoiceSection({
  questions,
  updateQuestion,
  updateOptionText,
  addOption,
  removeOption,
  addQuestionBlock,
  removeQuestionBlock,
}: {
  questions: QuestionItem[];
  updateQuestion: (
    idx: number,
    field: keyof QuestionItem,
    value: unknown,
  ) => void;
  updateOptionText: (qIdx: number, oIdx: number, text: string) => void;
  addOption: (qIdx: number) => void;
  removeOption: (qIdx: number, oIdx: number) => void;
  addQuestionBlock: () => void;
  removeQuestionBlock: (idx: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[22px] font-semibold">
          2. Конструктор вопросов ({questions.length})
        </h2>
        <button
          type="button"
          onClick={addQuestionBlock}
          className="border-line text-ink hover:bg-surface rounded-lg border px-3.5 py-1.5 text-[13.5px] font-medium transition-colors"
        >
          + Добавить вопрос
        </button>
      </div>

      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          className="bg-surface border-line space-y-4 rounded-xl border p-6 shadow-xs"
        >
          <div className="border-line flex items-center justify-between border-b pb-3">
            <span className="font-display text-ink text-[17px] font-semibold">
              Вопрос №{qIndex + 1}
            </span>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestionBlock(qIndex)}
                className="text-[13px] font-medium text-red-500 transition-colors hover:text-red-700"
              >
                Удалить вопрос
              </button>
            )}
          </div>

          <div>
            <label className="text-ink mb-1 block text-[13.5px] font-medium">
              Текст вопроса *
            </label>
            <input
              type="text"
              value={q.questionText}
              onChange={(e) =>
                updateQuestion(qIndex, "questionText", e.target.value)
              }
              placeholder="например: Where is the speaker going tomorrow?"
              className="bg-surface-2 border-line text-ink w-full rounded-lg border px-3.5 py-2 text-[14px] focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-ink block text-[13.5px] font-medium">
              Варианты ответа (отметьте радио-кнопкой верный вариант) *
            </label>
            {q.options.map((optionText, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct_${qIndex}`}
                  checked={q.correctAnswer === oIndex}
                  onChange={() =>
                    updateQuestion(qIndex, "correctAnswer", oIndex)
                  }
                  className="accent-accent h-4 w-4 cursor-pointer"
                  title="Отметить как правильный ответ"
                />
                <input
                  type="text"
                  value={optionText}
                  onChange={(e) =>
                    updateOptionText(qIndex, oIndex, e.target.value)
                  }
                  placeholder={`Вариант ${oIndex + 1}`}
                  className={`bg-surface-2 border-line text-ink flex-1 rounded-lg border px-3 py-2 text-[14px] focus:outline-hidden ${
                    q.correctAnswer === oIndex
                      ? "border-accent/60 bg-accent/5 font-medium"
                      : ""
                  }`}
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(qIndex, oIndex)}
                    className="text-ink-4 px-1 text-[16px] hover:text-red-500"
                    title="Удалить вариант"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(qIndex)}
              className="text-accent pt-1 text-[13px] font-medium hover:underline"
            >
              + Добавить вариант ответа
            </button>
          </div>

          <ExplanationBlock
            explanationText={q.explanationText}
            highlightedText={q.highlightedText}
            onChangeExplanation={(v) =>
              updateQuestion(qIndex, "explanationText", v)
            }
            onChangeHighlight={(v) =>
              updateQuestion(qIndex, "highlightedText", v)
            }
          />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Matching section
// ═══════════════════════════════════════════════════════════════════════════

function MatchingSection({
  state,
  updateRubric,
  updateSpeakerAnswer,
  updateExplanation,
}: {
  state: MatchingFormState;
  updateRubric: (idx: number, text: string) => void;
  updateSpeakerAnswer: (speakerIdx: number, rubricNum: number) => void;
  updateExplanation: (
    idx: number,
    field: "text" | "highlightedText",
    value: string,
  ) => void;
}) {
  const usedRubrics = new Set(state.speakerAnswers.filter((a) => a > 0));

  return (
    <div className="space-y-6">
      {/* Rubrics */}
      <div className="bg-surface border-line space-y-4 rounded-xl border p-6 shadow-xs">
        <h2 className="font-display text-[20px] font-semibold">
          2. Рубрики ({state.rubrics.length})
        </h2>
        <p className="text-ink-3 text-[13px]">
          Введите текст каждой рубрики (одна из них будет лишней — дистрактор).
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {state.rubrics.map((rubric, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="bg-ink text-on-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold">
                {idx + 1}
              </span>
              <input
                type="text"
                value={rubric}
                onChange={(e) => updateRubric(idx, e.target.value)}
                placeholder={`Рубрика ${idx + 1}`}
                className="bg-surface-2 border-line text-ink flex-1 rounded-lg border px-3 py-2 text-[14px] focus:outline-hidden"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Speaker answers */}
      <div className="bg-surface border-line space-y-4 rounded-xl border p-6 shadow-xs">
        <h2 className="font-display text-[20px] font-semibold">
          3. Ответы спикеров
        </h2>
        <p className="text-ink-3 text-[13px]">
          Для каждого спикера (A-E) укажите номер соответствующей рубрики.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SPEAKER_LETTERS.map((letter, idx) => {
            const currentVal = state.speakerAnswers[idx] ?? 0;
            return (
              <div key={letter} className="flex items-center gap-3">
                <span className="font-display text-ink text-[16px] font-semibold">
                  Спикер {letter}
                </span>
                <CustomSelect
                  options={state.rubrics.map((_, ri) => {
                    const num = ri + 1;
                    const disabled = usedRubrics.has(num) && currentVal !== num;
                    return {
                      value: num,
                      label: `${num}${disabled ? " (занята)" : ""}`,
                      disabled,
                    };
                  })}
                  value={currentVal}
                  onChange={(val) => updateSpeakerAnswer(idx, Number(val))}
                  placeholder="—"
                  className="w-36"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanations */}
      <div className="space-y-4">
        <h2 className="font-display text-[20px] font-semibold">4. Пояснения</h2>
        {SPEAKER_LETTERS.map((letter, idx) => (
          <div
            key={letter}
            className="bg-surface border-line space-y-3 rounded-xl border p-6 shadow-xs"
          >
            <span className="font-display text-ink text-[17px] font-semibold">
              Пояснение — Спикер {letter}
            </span>
            <ExplanationBlock
              explanationText={state.explanations[idx]?.text ?? ""}
              highlightedText={state.explanations[idx]?.highlightedText ?? ""}
              onChangeExplanation={(v) => updateExplanation(idx, "text", v)}
              onChangeHighlight={(v) =>
                updateExplanation(idx, "highlightedText", v)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Gap-fill section
// ═══════════════════════════════════════════════════════════════════════════

function GapFillSection({
  state,
  updateTemplate,
  updateAnswer,
  addAnswerVariant,
  removeAnswerVariant,
  addTemplate,
  removeTemplate,
  updateExplanation,
}: {
  state: GapFillFormState;
  updateTemplate: (idx: number, text: string) => void;
  updateAnswer: (templateIdx: number, variantIdx: number, text: string) => void;
  addAnswerVariant: (templateIdx: number) => void;
  removeAnswerVariant: (templateIdx: number, variantIdx: number) => void;
  addTemplate: () => void;
  removeTemplate: (idx: number) => void;
  updateExplanation: (
    idx: number,
    field: "text" | "highlightedText",
    value: string,
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[22px] font-semibold">
          2. Шаблоны предложений ({state.templates.length})
        </h2>
        <button
          type="button"
          onClick={addTemplate}
          className="border-line text-ink hover:bg-surface rounded-lg border px-3.5 py-1.5 text-[13.5px] font-medium transition-colors"
        >
          + Добавить предложение
        </button>
      </div>

      {state.templates.map((template, idx) => {
        const taskNum = 6 + idx;
        const variants = state.answers[idx] ?? [""];

        return (
          <div
            key={idx}
            className="bg-surface border-line space-y-4 rounded-xl border p-6 shadow-xs"
          >
            <div className="border-line flex items-center justify-between border-b pb-3">
              <span className="font-display text-ink text-[17px] font-semibold">
                Задание {taskNum}
              </span>
              {state.templates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTemplate(idx)}
                  className="text-[13px] font-medium text-red-500 transition-colors hover:text-red-700"
                >
                  Удалить
                </button>
              )}
            </div>

            {/* Template sentence */}
            <div>
              <label className="text-ink mb-1 block text-[13.5px] font-medium">
                Шаблон предложения (используйте ____ для обозначения пропуска) *
              </label>
              <input
                type="text"
                value={template}
                onChange={(e) => updateTemplate(idx, e.target.value)}
                placeholder="Age of the respondent ____________________ years old"
                className="bg-surface-2 border-line text-ink w-full rounded-lg border px-3.5 py-2 text-[14px] focus:outline-hidden"
              />
            </div>

            {/* Answer variants */}
            <div className="space-y-2">
              <label className="text-ink block text-[13.5px] font-medium">
                Принимаемые варианты ответа *
              </label>
              {variants.map((variant, vIdx) => (
                <div key={vIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={variant}
                    onChange={(e) =>
                      updateAnswer(idx, vIdx, e.target.value.toUpperCase())
                    }
                    placeholder={
                      vIdx === 0 ? "Основной ответ" : "Альтернативный вариант"
                    }
                    className="bg-surface-2 border-line text-ink flex-1 rounded-lg border px-3 py-2 font-mono text-[14px] uppercase focus:outline-hidden"
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAnswerVariant(idx, vIdx)}
                      className="text-ink-4 px-1 text-[16px] hover:text-red-500"
                      title="Удалить вариант"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addAnswerVariant(idx)}
                className="text-accent pt-1 text-[13px] font-medium hover:underline"
              >
                + Добавить альтернативный вариант ответа
              </button>
            </div>

            {/* Explanation */}
            <ExplanationBlock
              explanationText={state.explanations[idx]?.text ?? ""}
              highlightedText={state.explanations[idx]?.highlightedText ?? ""}
              onChangeExplanation={(v) => updateExplanation(idx, "text", v)}
              onChangeHighlight={(v) =>
                updateExplanation(idx, "highlightedText", v)
              }
            />
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Shared explanation block
// ═══════════════════════════════════════════════════════════════════════════

function ExplanationBlock({
  explanationText,
  highlightedText,
  onChangeExplanation,
  onChangeHighlight,
}: {
  explanationText: string;
  highlightedText: string;
  onChangeExplanation: (value: string) => void;
  onChangeHighlight: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
      <div>
        <label className="text-ink mb-1.5 block text-[13.5px] font-medium">
          Пояснение ответа *
        </label>
        <textarea
          rows={7}
          value={explanationText}
          onChange={(e) => onChangeExplanation(e.target.value)}
          placeholder="Объяснение, почему выбранный ответ является правильным..."
          className="bg-surface-2 border-line text-ink min-h-[160px] w-full rounded-lg border px-3.5 py-2.5 text-[14px] leading-relaxed focus:outline-hidden"
        />
      </div>
      <div>
        <label className="text-ink mb-1.5 block text-[13.5px] font-medium">
          Выделенный цитируемый фрагмент (опционально)
        </label>
        <textarea
          rows={7}
          value={highlightedText}
          onChange={(e) => onChangeHighlight(e.target.value)}
          placeholder="Фрагменты из текста/пояснения..."
          className="bg-surface-2 border-line text-ink min-h-[160px] w-full rounded-lg border px-3.5 py-2.5 font-mono text-[13.5px] leading-relaxed focus:outline-hidden"
        />
      </div>
    </div>
  );
}
