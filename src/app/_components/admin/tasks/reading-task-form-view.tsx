"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { CustomSelect } from "@/app/_components/ui/custom-select";

interface PassageItem {
  text: string;
  selectedHeadingIndex: number;
  explanationText: string;
  highlightedText: string;
}

const DEFAULT_PASSAGES = (): PassageItem[] => [
  { text: "", selectedHeadingIndex: 0, explanationText: "", highlightedText: "" },
  { text: "", selectedHeadingIndex: 1, explanationText: "", highlightedText: "" },
  { text: "", selectedHeadingIndex: 2, explanationText: "", highlightedText: "" },
  { text: "", selectedHeadingIndex: 3, explanationText: "", highlightedText: "" },
  { text: "", selectedHeadingIndex: 4, explanationText: "", highlightedText: "" },
  { text: "", selectedHeadingIndex: 5, explanationText: "", highlightedText: "" },
];

const DEFAULT_HEADINGS = (): string[] => ["", "", "", "", "", "", ""];

const PASSAGE_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export function ReadingTaskFormView({ taskId }: { taskId?: number }) {
  const router = useRouter();
  const isEditMode = Boolean(taskId);

  const [topicId, setTopicId] = useState<number | "">("");
  const [headings, setHeadings] = useState<string[]>(DEFAULT_HEADINGS());
  const [passages, setPassages] = useState<PassageItem[]>(DEFAULT_PASSAGES());

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
    if (existingTask) {
      setTopicId(existingTask.topicId ?? "");

      if (existingTask.headings && existingTask.headings.length > 0) {
        setHeadings([...existingTask.headings]);
      }

      if (existingTask.texts && existingTask.texts.length > 0) {
        const loadedPassages: PassageItem[] = existingTask.texts.map(
          (text, idx) => {
            const rawAnswer = existingTask.answers?.[idx];
            const selectedHeadingIndex =
              typeof rawAnswer === "number" && rawAnswer >= 1
                ? rawAnswer - 1
                : 0;

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

  // Headings Handlers
  const handleAddHeading = () => {
    setHeadings((prev) => [...prev, ""]);
  };

  const handleRemoveHeading = (index: number) => {
    if (headings.length <= 1) return;
    setHeadings((prev) => prev.filter((_, i) => i !== index));
    // Adjust passages selected heading index if needed
    setPassages((prev) =>
      prev.map((p) => {
        if (p.selectedHeadingIndex === index) {
          return { ...p, selectedHeadingIndex: 0 };
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

  // Passages Handlers
  const handleAddPassage = () => {
    setPassages((prev) => [
      ...prev,
      {
        text: "",
        selectedHeadingIndex: 0,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (topicId === "") {
      setFormError("Пожалуйста, выберите тему");
      return;
    }

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

    for (let i = 0; i < passages.length; i++) {
      const p = passages[i]!;
      const label = PASSAGE_LABELS[i] ?? `#${i + 1}`;
      if (!p.text.trim()) {
        setFormError(`Заполните текст для фрагмента ${label}`);
        return;
      }
      if (!p.explanationText.trim()) {
        setFormError(`Заполните пояснение ответа для фрагмента ${label}`);
        return;
      }
    }

    const payload = {
      topicId: Number(topicId),
      texts: passages.map((p) => p.text.trim()),
      headings: headings.map((h) => h.trim()),
      answers: passages.map((p) => p.selectedHeadingIndex + 1), // 1-based indexing for DB
      explanations: passages.map((p) => ({
        text: p.explanationText.trim(),
        highlightedText: p.highlightedText.trim() || undefined,
      })),
    };

    try {
      if (isEditMode && taskId) {
        await updateMutation.mutateAsync({
          id: taskId,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/admin/tasks/reading");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Произошла ошибка при сохранении задания";
      setFormError(errorMessage);
    }
  };

  if (isEditMode && isLoadingTask) {
    return (
      <div className="bg-surface border-line rounded-2xl border p-12 text-center text-ink-3">
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
    label: `${i + 1}. ${h.slice(0, 40)}${h.length > 40 ? "..." : ""}` || `Заголовок ${i + 1}`,
  }));

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[900px] space-y-8 pb-16">
      {/* Top Header & Navigation */}
      <div>
        <Link
          href="/admin/tasks/reading"
          className="text-ink-3 hover:text-ink inline-flex items-center gap-1.5 text-xs font-medium transition-colors mb-1"
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
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
          {formError}
        </div>
      )}

      {/* 1. Select Topic */}
      <div className="bg-surface border-line space-y-4 rounded-2xl border p-6 shadow-sm">
        <h2 className="font-display text-[20px] font-semibold">
          1. Тема задания
        </h2>
        <div className="max-w-md">
          <label className="text-ink-2 mb-1.5 block text-xs font-medium">
            Выберите тему <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            options={topicOptions}
            value={topicId.toString()}
            onChange={(val) => setTopicId(val ? Number(val) : "")}
            placeholder="Выберите тему из списка..."
          />
        </div>
      </div>

      {/* 2. Headings List */}
      <div className="bg-surface border-line space-y-4 rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[20px] font-semibold">
              2. Заголовки (Headings)
            </h2>
            <p className="text-ink-3 text-xs mt-0.5">
              Укажите варианты заголовков для сопоставления с текстами
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddHeading}
            className="border-line text-ink hover:bg-surface-2 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            + Добавить заголовок
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {headings.map((heading, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-ink-3 font-mono text-xs font-semibold shrink-0 w-6 text-right">
                {index + 1}.
              </span>
              <input
                type="text"
                value={heading}
                onChange={(e) => handleHeadingChange(index, e.target.value)}
                placeholder={`Заголовок ${index + 1}...`}
                className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent w-full rounded-xl border px-3.5 py-2 text-sm transition-colors focus:outline-none"
              />
              {headings.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveHeading(index)}
                  className="text-red-500 hover:bg-red-500/10 shrink-0 rounded-lg p-1.5 transition-colors"
                  title="Удалить заголовок"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
            <p className="text-ink-3 text-xs mt-0.5">
              Каждый фрагмент сопоставляется с верным заголовком и имеет пояснение
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddPassage}
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
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-display text-ink font-semibold text-base flex items-center gap-2">
                  <span className="bg-accent/10 text-accent rounded-lg px-2.5 py-1 text-xs font-bold font-mono">
                    Фрагмент {passageLabel}
                  </span>
                </span>
                {passages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePassage(index)}
                    className="text-red-500 hover:bg-red-500/10 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                  >
                    Удалить фрагмент
                  </button>
                )}
              </div>

              {/* Passage Text */}
              <div>
                <label className="text-ink-2 mb-1.5 block text-xs font-medium">
                  Текст фрагмента {passageLabel} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={7}
                  value={passage.text}
                  onChange={(e) =>
                    handlePassageChange(index, "text", e.target.value)
                  }
                  placeholder={`Введите текст фрагмента ${passageLabel}...`}
                  className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent min-h-[160px] w-full rounded-xl border p-3.5 text-sm transition-colors focus:outline-none leading-relaxed"
                />
              </div>

              {/* Matched Heading Dropdown */}
              <div className="max-w-md">
                <label className="text-ink-2 mb-1.5 block text-xs font-medium">
                  Правильный заголовок для {passageLabel} <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={headingSelectOptions}
                  value={passage.selectedHeadingIndex.toString()}
                  onChange={(val) =>
                    handlePassageChange(
                      index,
                      "selectedHeadingIndex",
                      val ? Number(val) : 0,
                    )
                  }
                  placeholder="Выберите заголовок..."
                />
              </div>

              {/* Explanation Text */}
              <div>
                <label className="text-ink-2 mb-1.5 block text-xs font-medium">
                  Пояснение ответа <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={7}
                  value={passage.explanationText}
                  onChange={(e) =>
                    handlePassageChange(
                      index,
                      "explanationText",
                      e.target.value,
                    )
                  }
                  placeholder="Объяснение, почему выбран данный заголовок..."
                  className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent min-h-[160px] w-full rounded-xl border p-3.5 text-sm transition-colors focus:outline-none leading-relaxed"
                />
              </div>

              {/* Highlighted Quote Fragment */}
              <div>
                <label className="text-ink-2 mb-1 block text-xs font-medium">
                  Выделенный цитируемый фрагмент (опционально)
                </label>
                <p className="text-ink-4 mb-1.5 text-[11px]">
                  Подсвечивает фрагмент в тексте. Для нескольких цитат разделяйте их переносом строки или точкой с запятой (;)
                </p>
                <input
                  type="text"
                  value={passage.highlightedText}
                  onChange={(e) =>
                    handlePassageChange(
                      index,
                      "highlightedText",
                      e.target.value,
                    )
                  }
                  placeholder="Например: sentence from the text"
                  className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent w-full rounded-xl border px-3.5 py-2 text-sm transition-colors focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>

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
