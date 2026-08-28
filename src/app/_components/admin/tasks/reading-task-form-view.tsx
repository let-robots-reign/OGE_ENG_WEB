"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { CustomSelect } from "@/app/_components/ui/custom-select";
import type { ReadingTaskType } from "@/server/db/schema";

interface PassageItem {
  text: string;
  selectedHeadingIndex: number;
  explanationText: string;
  highlightedText: string;
}

interface TrueFalseFormState {
  text: string;
  statements: string[];
  answers: number[];
  explanations: { text: string; highlightedText: string }[];
}

const DEFAULT_PASSAGES = (): PassageItem[] => [
  {
    text: "",
    selectedHeadingIndex: 0,
    explanationText: "",
    highlightedText: "",
  },
  {
    text: "",
    selectedHeadingIndex: 1,
    explanationText: "",
    highlightedText: "",
  },
  {
    text: "",
    selectedHeadingIndex: 2,
    explanationText: "",
    highlightedText: "",
  },
  {
    text: "",
    selectedHeadingIndex: 3,
    explanationText: "",
    highlightedText: "",
  },
  {
    text: "",
    selectedHeadingIndex: 4,
    explanationText: "",
    highlightedText: "",
  },
  {
    text: "",
    selectedHeadingIndex: 5,
    explanationText: "",
    highlightedText: "",
  },
];

const DEFAULT_HEADINGS = (): string[] => ["", "", "", "", "", "", ""];

const DEFAULT_TRUE_FALSE = (): TrueFalseFormState => ({
  text: "",
  statements: ["", "", "", "", "", "", ""],
  answers: [0, 0, 0, 0, 0, 0, 0],
  explanations: Array.from({ length: 7 }, () => ({
    text: "",
    highlightedText: "",
  })),
});

const PASSAGE_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const TOPIC_TASK_TYPE_MAP: Record<string, ReadingTaskType> = {
  "Задание 12": "matching",
  "Задания 13-19": "true_false",
};

const TASK_TYPE_LABELS: Record<ReadingTaskType, string> = {
  matching: "Сопоставление (задание 12)",
  true_false: "True / False / Not stated (задания 13-19)",
};

const ANSWER_OPTIONS = [
  { value: "1", label: "1 — True" },
  { value: "2", label: "2 — False" },
  { value: "3", label: "3 — Not stated" },
];

export function ReadingTaskFormView({ taskId }: { taskId?: number }) {
  const router = useRouter();
  const isEditMode = Boolean(taskId);

  const [topicId, setTopicId] = useState<number | "">("");
  const [taskType, setTaskType] = useState<ReadingTaskType | null>(null);

  // Matching state
  const [headings, setHeadings] = useState<string[]>(DEFAULT_HEADINGS());
  const [passages, setPassages] = useState<PassageItem[]>(DEFAULT_PASSAGES());

  // True/False state
  const [trueFalse, setTrueFalse] =
    useState<TrueFalseFormState>(DEFAULT_TRUE_FALSE());

  const [formError, setFormError] = useState<string | null>(null);

  const { data: topics } = api.admin.getReadingTopics.useQuery();

  const { data: existingTask, isLoading: isLoadingTask } =
    api.admin.getReadingTaskById.useQuery(
      { id: taskId! },
      { enabled: isEditMode },
    );

  const createMutation = api.admin.createReadingTask.useMutation();
  const updateMutation = api.admin.updateReadingTask.useMutation();

  useEffect(() => {
    if (!topics || topicId === "") return;
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;
    const mapped = TOPIC_TASK_TYPE_MAP[topic.title] ?? null;
    setTaskType(mapped);
  }, [topicId, topics]);

  useEffect(() => {
    if (!existingTask) return;
    setTopicId(existingTask.topicId ?? "");

    if (existingTask.taskType === "true_false") {
      setTrueFalse({
        text: existingTask.texts?.[0] ?? "",
        statements: [...(existingTask.headings ?? [])],
        answers: [...(existingTask.answers ?? [])],
        explanations: (existingTask.headings ?? []).map((_, idx) => ({
          text: existingTask.explanations?.[idx]?.text ?? "",
          highlightedText:
            existingTask.explanations?.[idx]?.highlightedText ?? "",
        })),
      });
    } else {
      if (existingTask.headings && existingTask.headings.length > 0) {
        setHeadings([...existingTask.headings]);
      }
      if (existingTask.texts && existingTask.texts.length > 0) {
        const loadedPassages: PassageItem[] = existingTask.texts.map(
          (text, idx) => {
            const rawAnswer = existingTask.answers?.[idx];
            const selectedHeadingIndex =
              typeof rawAnswer === "number" &&
              rawAnswer >= 1 &&
              rawAnswer <= existingTask.headings.length
                ? rawAnswer - 1
                : -1;
            return {
              text,
              selectedHeadingIndex,
              explanationText: existingTask.explanations?.[idx]?.text ?? "",
              highlightedText:
                existingTask.explanations?.[idx]?.highlightedText ?? "",
            };
          },
        );
        setPassages(loadedPassages);
      }
    }
  }, [existingTask]);

  // Matching: Headings Handlers
  const handleAddHeading = () => {
    setHeadings((prev) => [...prev, ""]);
  };

  const handleRemoveHeading = (index: number) => {
    if (headings.length <= 1) return;
    setHeadings((prev) => prev.filter((_, i) => i !== index));
    setPassages((prev) =>
      prev.map((p) => {
        if (p.selectedHeadingIndex === index) {
          return { ...p, selectedHeadingIndex: -1 };
        }
        if (p.selectedHeadingIndex > index) {
          return { ...p, selectedHeadingIndex: p.selectedHeadingIndex - 1 };
        }
        return p;
      }),
    );
  };

  const handleHeadingChange = (index: number, val: string) => {
    setHeadings((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  // Matching: Passages Handlers
  const handleAddPassage = () => {
    setPassages((prev) => [
      ...prev,
      {
        text: "",
        selectedHeadingIndex: -1,
        explanationText: "",
        highlightedText: "",
      },
    ]);
  };

  const handleRemovePassage = (index: number) => {
    if (passages.length <= 1) return;
    setPassages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePassageChange = (
    index: number,
    field: keyof PassageItem,
    value: string | number,
  ) => {
    setPassages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]!, [field]: value };
      return next;
    });
  };

  // True/False Handlers
  const handleTfTextChange = (val: string) => {
    setTrueFalse((prev) => ({ ...prev, text: val }));
  };

  const handleTfStatementChange = (index: number, val: string) => {
    setTrueFalse((prev) => {
      const statements = [...prev.statements];
      statements[index] = val;
      return { ...prev, statements };
    });
  };

  const handleTfAnswerChange = (index: number, val: number) => {
    setTrueFalse((prev) => {
      const answers = [...prev.answers];
      answers[index] = val;
      return { ...prev, answers };
    });
  };

  const handleTfExplanationChange = (
    index: number,
    field: "text" | "highlightedText",
    val: string,
  ) => {
    setTrueFalse((prev) => {
      const explanations = [...prev.explanations];
      explanations[index] = { ...explanations[index]!, [field]: val };
      return { ...prev, explanations };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (topicId === "") {
      setFormError("Пожалуйста, выберите тему");
      return;
    }

    if (!taskType) {
      setFormError("Не удалось определить тип задания по выбранной теме");
      return;
    }

    if (taskType === "true_false") {
      if (!trueFalse.text.trim()) {
        setFormError("Введите текст для чтения");
        return;
      }
      for (let i = 0; i < trueFalse.statements.length; i++) {
        if (!trueFalse.statements[i]!.trim()) {
          setFormError(`Заполните утверждение ${13 + i}`);
          return;
        }
        if (trueFalse.answers[i] === 0) {
          setFormError(`Выберите ответ для утверждения ${13 + i}`);
          return;
        }
        if (!trueFalse.explanations[i]!.text.trim()) {
          setFormError(`Заполните пояснение для утверждения ${13 + i}`);
          return;
        }
      }

      const payload = {
        taskType: "true_false" as const,
        topicId: Number(topicId),
        texts: [trueFalse.text.trim()],
        headings: trueFalse.statements.map((s) => s.trim()),
        answers: trueFalse.answers,
        explanations: trueFalse.explanations.map((e) => ({
          text: e.text.trim(),
          highlightedText: e.highlightedText.trim() || undefined,
        })),
      };

      try {
        if (isEditMode && taskId) {
          await updateMutation.mutateAsync({ id: taskId, ...payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
        router.push("/admin/tasks/reading");
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Ошибка при сохранении",
        );
      }
      return;
    }

    // Matching validation & submit
    if (headings.length === 0) {
      setFormError("Добавьте хотя бы один заголовок");
      return;
    }
    if (headings.some((h) => !h.trim())) {
      setFormError("Все заголовки должны быть заполнены");
      return;
    }
    if (passages.length === 0) {
      setFormError("Добавьте хотя бы один фрагмент текста (пассаж)");
      return;
    }
    if (headings.length !== passages.length + 1) {
      setFormError("Заголовков должно быть на один больше, чем фрагментов");
      return;
    }
    for (let i = 0; i < passages.length; i++) {
      const p = passages[i]!;
      const label = PASSAGE_LABELS[i] ?? `#${i + 1}`;
      if (!p.text.trim()) {
        setFormError(`Заполните текст для фрагмента ${label}`);
        return;
      }
      if (
        p.selectedHeadingIndex < 0 ||
        p.selectedHeadingIndex >= headings.length
      ) {
        setFormError(`Выберите заголовок для фрагмента ${label}`);
        return;
      }
      if (
        passages.some(
          (other, otherIndex) =>
            otherIndex !== i &&
            other.selectedHeadingIndex === p.selectedHeadingIndex,
        )
      ) {
        setFormError(`Заголовок для фрагмента ${label} уже используется`);
        return;
      }
      if (!p.explanationText.trim()) {
        setFormError(`Заполните пояснение ответа для фрагмента ${label}`);
        return;
      }
    }

    const payload = {
      taskType: "matching" as const,
      topicId: Number(topicId),
      texts: passages.map((p) => p.text.trim()),
      headings: headings.map((h) => h.trim()),
      answers: passages.map((p) => p.selectedHeadingIndex + 1),
      explanations: passages.map((p) => ({
        text: p.explanationText.trim(),
        highlightedText: p.highlightedText.trim() || undefined,
      })),
    };

    try {
      if (isEditMode && taskId) {
        await updateMutation.mutateAsync({ id: taskId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/admin/tasks/reading");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Ошибка при сохранении",
      );
    }
  };

  if (isEditMode && isLoadingTask) {
    return (
      <div className="bg-surface border-line text-ink-3 rounded-2xl border p-12 text-center">
        Загрузка данных задания...
      </div>
    );
  }

  const topicOptions =
    topics?.map((t) => ({
      value: t.id.toString(),
      label: t.title,
    })) ?? [];

  const headingSelectOptions = headings.map((h, i) => ({
    value: i.toString(),
    label:
      `${i + 1}. ${h.slice(0, 40)}${h.length > 40 ? "..." : ""}` ||
      `Заголовок ${i + 1}`,
  }));

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[900px] space-y-8 pb-16"
    >
      {/* Top Header & Navigation */}
      <div>
        <Link
          href="/admin/tasks/reading"
          className="text-ink-3 hover:text-ink mb-1 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          ← Назад к списку заданий
        </Link>
        <h1 className="font-display text-[28px] tracking-tight sm:text-[34px]">
          {isEditMode
            ? `Редактирование задания по чтению #${taskId}`
            : "Новое задание по чтению"}
        </h1>
      </div>

      {formError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {formError}
        </div>
      )}

      {/* 1. Select Topic */}
      <div className="bg-surface border-line space-y-4 rounded-2xl border p-6 shadow-sm">
        <h2 className="font-display text-[20px] font-semibold">
          1. Основные параметры
        </h2>
        <div className="max-w-md">
          <label className="text-ink-2 mb-1.5 block text-xs font-medium">
            Тема задания <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            options={topicOptions}
            value={topicId.toString()}
            onChange={(val) => setTopicId(val ? Number(val) : "")}
            placeholder="-- Выберите тему из списка --"
          />
        </div>
        {taskType && (
          <p className="text-ink-2 text-sm">
            Тип задания:{" "}
            <span className="text-ink font-semibold">
              {TASK_TYPE_LABELS[taskType]}
            </span>
          </p>
        )}
      </div>

      {/* Conditional Sections */}
      {!taskType && (
        <div className="bg-surface border-line text-ink-3 rounded-2xl border p-8 text-center text-sm">
          Выберите тему задания, чтобы отобразить конструктор.
        </div>
      )}

      {taskType === "matching" && (
        <MatchingSection
          headings={headings}
          passages={passages}
          headingSelectOptions={headingSelectOptions}
          onAddHeading={handleAddHeading}
          onRemoveHeading={handleRemoveHeading}
          onHeadingChange={handleHeadingChange}
          onAddPassage={handleAddPassage}
          onRemovePassage={handleRemovePassage}
          onPassageChange={handlePassageChange}
        />
      )}

      {taskType === "true_false" && (
        <TrueFalseSection
          state={trueFalse}
          onTextChange={handleTfTextChange}
          onStatementChange={handleTfStatementChange}
          onAnswerChange={handleTfAnswerChange}
          onExplanationChange={handleTfExplanationChange}
        />
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/admin/tasks/reading"
          className="border-line text-ink hover:bg-surface-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Отмена
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-ink hover:bg-ink-2 text-on-ink rounded-lg px-6 py-2.5 text-[14.5px] font-medium transition-colors disabled:opacity-50"
        >
          {isSubmitting
            ? "Сохранение..."
            : isEditMode
              ? "Сохранить изменения"
              : "Создать задание"}
        </button>
      </div>
    </form>
  );
}

function MatchingSection({
  headings,
  passages,
  headingSelectOptions,
  onAddHeading,
  onRemoveHeading,
  onHeadingChange,
  onAddPassage,
  onRemovePassage,
  onPassageChange,
}: {
  headings: string[];
  passages: PassageItem[];
  headingSelectOptions: { value: string; label: string }[];
  onAddHeading: () => void;
  onRemoveHeading: (index: number) => void;
  onHeadingChange: (index: number, val: string) => void;
  onAddPassage: () => void;
  onRemovePassage: (index: number) => void;
  onPassageChange: (
    index: number,
    field: keyof PassageItem,
    value: string | number,
  ) => void;
}) {
  return (
    <>
      {/* 2. Headings List */}
      <div className="bg-surface border-line space-y-4 rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[20px] font-semibold">
              2. Заголовки ({headings.length})
            </h2>
            <p className="text-ink-3 mt-0.5 text-xs">
              Укажите варианты заголовков для сопоставления с текстами
            </p>
          </div>
          <button
            type="button"
            onClick={onAddHeading}
            className="border-line text-ink hover:bg-surface-2 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            + Добавить заголовок
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {headings.map((heading, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-ink-3 w-6 shrink-0 text-right font-mono text-xs font-semibold">
                {index + 1}.
              </span>
              <input
                type="text"
                value={heading}
                onChange={(e) => onHeadingChange(index, e.target.value)}
                placeholder={`Заголовок ${index + 1}...`}
                className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent w-full rounded-xl border px-3.5 py-2 text-sm transition-colors focus:outline-none"
              />
              {headings.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveHeading(index)}
                  className="shrink-0 rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
                  title="Удалить заголовок"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Passages & Explanations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[20px] font-semibold">
              3. Тексты и пояснения
            </h2>
            <p className="text-ink-3 mt-0.5 text-xs">
              Каждый фрагмент сопоставляется с верным заголовком и имеет
              пояснение
            </p>
          </div>
          <button
            type="button"
            onClick={onAddPassage}
            className="border-line text-ink hover:bg-surface-2 inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors"
          >
            + Добавить фрагмент текста
          </button>
        </div>

        {passages.map((passage, index) => {
          const passageLabel = PASSAGE_LABELS[index] ?? `#${index + 1}`;
          return (
            <div
              key={index}
              className="bg-surface border-line space-y-4 rounded-2xl border p-6 shadow-sm"
            >
              <div className="border-line flex items-center justify-between border-b pb-3">
                <span className="font-display text-ink flex items-center gap-2 text-base font-semibold">
                  <span className="bg-accent/10 text-accent rounded-lg px-2.5 py-1 font-mono text-xs font-bold">
                    Фрагмент {passageLabel}
                  </span>
                </span>
                {passages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemovePassage(index)}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    Удалить фрагмент
                  </button>
                )}
              </div>

              <div>
                <label className="text-ink-2 mb-1.5 block text-xs font-medium">
                  Текст фрагмента {passageLabel}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={7}
                  value={passage.text}
                  onChange={(e) =>
                    onPassageChange(index, "text", e.target.value)
                  }
                  placeholder={`Введите текст фрагмента ${passageLabel}...`}
                  className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent min-h-[160px] w-full rounded-xl border p-3.5 text-sm leading-relaxed transition-colors focus:outline-none"
                />
              </div>

              <div className="max-w-md">
                <label className="text-ink-2 mb-1.5 block text-xs font-medium">
                  Правильный заголовок для {passageLabel}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={headingSelectOptions.map((option, optionIndex) => ({
                    ...option,
                    disabled: passages.some(
                      (other, otherIndex) =>
                        otherIndex !== index &&
                        other.selectedHeadingIndex === optionIndex,
                    ),
                  }))}
                  value={
                    passage.selectedHeadingIndex >= 0
                      ? passage.selectedHeadingIndex.toString()
                      : ""
                  }
                  onChange={(val) =>
                    onPassageChange(
                      index,
                      "selectedHeadingIndex",
                      val ? Number(val) : 0,
                    )
                  }
                  placeholder="Выберите заголовок..."
                />
              </div>

              <ExplanationBlock
                explanationText={passage.explanationText}
                highlightedText={passage.highlightedText}
                onExplanationChange={(val) =>
                  onPassageChange(index, "explanationText", val)
                }
                onHighlightChange={(val) =>
                  onPassageChange(index, "highlightedText", val)
                }
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

function TrueFalseSection({
  state,
  onTextChange,
  onStatementChange,
  onAnswerChange,
  onExplanationChange,
}: {
  state: TrueFalseFormState;
  onTextChange: (val: string) => void;
  onStatementChange: (index: number, val: string) => void;
  onAnswerChange: (index: number, val: number) => void;
  onExplanationChange: (
    index: number,
    field: "text" | "highlightedText",
    val: string,
  ) => void;
}) {
  return (
    <>
      {/* 2. Reading Text */}
      <div className="bg-surface border-line space-y-4 rounded-2xl border p-6 shadow-sm">
        <h2 className="font-display text-[20px] font-semibold">
          2. Текст для чтения
        </h2>
        <p className="text-ink-3 text-xs">
          Один развёрнутый текст, по которому ученик будет оценивать утверждения
          как True / False / Not stated.
        </p>
        <textarea
          rows={12}
          value={state.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Введите текст для чтения..."
          className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent min-h-[200px] w-full rounded-xl border p-3.5 text-sm leading-relaxed transition-colors focus:outline-none"
        />
      </div>

      {/* 3. Statements & Answers */}
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-[20px] font-semibold">
            3. Утверждения и ответы
          </h2>
          <p className="text-ink-3 mt-0.5 text-xs">
            Для каждого утверждения укажите правильный ответ (True / False / Not
            stated) и пояснение.
          </p>
        </div>

        {state.statements.map((statement, index) => (
          <div
            key={index}
            className="bg-surface border-line space-y-4 rounded-2xl border p-6 shadow-sm"
          >
            <div className="border-line flex items-center gap-2 border-b pb-3">
              <span className="font-display text-ink text-base font-semibold">
                Утверждение {13 + index}
              </span>
            </div>

            <div>
              <label className="text-ink-2 mb-1.5 block text-xs font-medium">
                Текст утверждения <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={statement}
                onChange={(e) => onStatementChange(index, e.target.value)}
                placeholder={`Утверждение ${13 + index}...`}
                className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent w-full rounded-xl border px-3.5 py-2 text-sm transition-colors focus:outline-none"
              />
            </div>

            <div className="max-w-xs">
              <label className="text-ink-2 mb-1.5 block text-xs font-medium">
                Правильный ответ <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={ANSWER_OPTIONS}
                value={state.answers[index]?.toString() ?? "0"}
                onChange={(val) => onAnswerChange(index, val ? Number(val) : 0)}
                placeholder="— Выберите ответ —"
              />
            </div>

            <ExplanationBlock
              explanationText={state.explanations[index]?.text ?? ""}
              highlightedText={state.explanations[index]?.highlightedText ?? ""}
              onExplanationChange={(val) =>
                onExplanationChange(index, "text", val)
              }
              onHighlightChange={(val) =>
                onExplanationChange(index, "highlightedText", val)
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}

function ExplanationBlock({
  explanationText,
  highlightedText,
  onExplanationChange,
  onHighlightChange,
}: {
  explanationText: string;
  highlightedText: string;
  onExplanationChange: (val: string) => void;
  onHighlightChange: (val: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="text-ink-2 mb-1.5 block text-xs font-medium">
          Пояснение ответа <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={explanationText}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder="Объяснение, почему выбранный ответ является правильным..."
          className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent w-full rounded-xl border p-3.5 text-sm leading-relaxed transition-colors focus:outline-none"
        />
      </div>
      <div>
        <label className="text-ink-2 mb-1 block text-xs font-medium">
          Выделенный цитируемый фрагмент (опционально)
        </label>
        <textarea
          rows={4}
          value={highlightedText}
          onChange={(e) => onHighlightChange(e.target.value)}
          placeholder="Фрагменты из текста/пояснения..."
          className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent w-full rounded-xl border p-3.5 text-sm leading-relaxed transition-colors focus:outline-none"
        />
      </div>
    </div>
  );
}
