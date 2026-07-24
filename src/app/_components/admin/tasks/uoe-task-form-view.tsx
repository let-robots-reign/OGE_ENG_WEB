"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { CustomSelect } from "@/app/_components/ui/custom-select";

export function UoeTaskFormView({ taskId }: { taskId?: number }) {
  const router = useRouter();
  const isEditMode = Boolean(taskId);

  const [topicId, setTopicId] = useState<number | "">("");
  const [taskText, setTaskText] = useState("");
  const [origin, setOrigin] = useState("");
  const [answer, setAnswer] = useState("");

  const [formError, setFormError] = useState<string | null>(null);

  const { data: topics } = api.admin.getUoeTopics.useQuery();

  const { data: existingTask, isLoading: isLoadingTask } =
    api.admin.getUoeTaskById.useQuery(
      { id: taskId! },
      { enabled: isEditMode },
    );

  const createMutation = api.admin.createUoeTask.useMutation();
  const updateMutation = api.admin.updateUoeTask.useMutation();

  useEffect(() => {
    if (existingTask) {
      setTopicId(existingTask.topicId ?? "");
      setTaskText(existingTask.task);
      setOrigin(existingTask.origin);
      setAnswer(existingTask.answer);
    }
  }, [existingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (topicId === "") {
      setFormError("Пожалуйста, выберите тему");
      return;
    }

    if (!taskText.trim()) {
      setFormError("Заполните текст предложения / задания");
      return;
    }

    if (!origin.trim()) {
      setFormError("Заполните начальное слово (origin)");
      return;
    }

    if (!answer.trim()) {
      setFormError("Заполните правильный ответ (answer)");
      return;
    }

    const payload = {
      topicId: Number(topicId),
      task: taskText.trim(),
      origin: origin.trim().toUpperCase(),
      answer: answer.trim().toUpperCase(),
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
      router.push("/admin/tasks/uoe");
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
      <div className="bg-surface border-line mx-auto max-w-[900px] rounded-2xl border p-12 text-center text-ink-3">
        Загрузка данных задания #{taskId}...
      </div>
    );
  }

  const topicOptions =
    topics?.map((t) => ({
      value: t.id.toString(),
      label: t.title,
    })) ?? [];

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[900px] space-y-8 pb-16">
      {/* Top Header & Navigation */}
      <div>
        <Link
          href="/admin/tasks/uoe"
          className="text-ink-3 hover:text-ink inline-flex items-center gap-1.5 text-xs font-medium transition-colors mb-1"
        >
          ← Назад к списку заданий
        </Link>
        <h1 className="font-display text-[28px] tracking-tight sm:text-[34px]">
          {isEditMode
            ? `Редактирование задания по языковому материалу #${taskId}`
            : "Новое задание по языковому материалу"}
        </h1>
      </div>

      {formError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
          {formError}
        </div>
      )}

      {/* 1. Basic Settings & Topic */}
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

      {/* 2. Task Sentence & Words */}
      <div className="bg-surface border-line space-y-5 rounded-2xl border p-6 shadow-sm">
        <h2 className="font-display text-[20px] font-semibold">
          2. Содержание задания
        </h2>

        {/* Task Sentence Prompt */}
        <div>
          <label className="text-ink-2 mb-1.5 block text-xs font-medium">
            Предложение / Задание <span className="text-red-500">*</span>
          </label>
          <p className="text-ink-4 mb-2 text-[11px]">
            Укажите предложение с пропуском или контекст задания
          </p>
          <textarea
            rows={4}
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Например: She ___ (GO) to school yesterday."
            className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent min-h-[100px] w-full rounded-xl border p-3.5 text-sm transition-colors focus:outline-none leading-relaxed"
          />
        </div>

        {/* Grid for Origin Word & Correct Answer */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Origin Word */}
          <div>
            <label className="text-ink-2 mb-1.5 block text-xs font-medium">
              Начальное слово (Origin) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Например: GO"
              className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent font-mono w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none uppercase"
            />
          </div>

          {/* Correct Answer */}
          <div>
            <label className="text-ink-2 mb-1.5 block text-xs font-medium">
              Правильный ответ (Answer) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Например: WENT"
              className="border-line bg-surface-2 text-ink placeholder:text-ink-4 focus:border-accent focus:ring-accent font-mono w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none uppercase"
            />
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/admin/tasks/uoe"
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
