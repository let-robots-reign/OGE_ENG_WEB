"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

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

import { CustomSelect } from "@/app/_components/ui/custom-select";
import { normalizeAudioUrl } from "@/app/_utils/audio";

export function AudioTaskFormView({ taskId }: { taskId?: number }) {
  const router = useRouter();
  const isEditMode = Boolean(taskId);

  const [topicId, setTopicId] = useState<number | "">("");
  const [audioUrl, setAudioUrl] = useState("");
  const [questions, setQuestions] = useState<QuestionItem[]>([
    DEFAULT_QUESTION(),
    DEFAULT_QUESTION(),
    DEFAULT_QUESTION(),
    DEFAULT_QUESTION(),
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: topics } = api.admin.getAudioTopics.useQuery();

  const { data: existingTask, isLoading: isLoadingTask } =
    api.admin.getAudioTaskById.useQuery(
      { id: taskId! },
      { enabled: isEditMode },
    );

  const createMutation = api.admin.createAudioTask.useMutation();
  const updateMutation = api.admin.updateAudioTask.useMutation();

  useEffect(() => {
    if (existingTask) {
      setTopicId(existingTask.topicId ?? "");
      setAudioUrl(existingTask.audioUrl);

      if (existingTask.questions && existingTask.questions.length > 0) {
        const loadedQuestions: QuestionItem[] = existingTask.questions.map(
          (q, idx) => {
            const rawAns = existingTask.answers?.[idx];
            const correctAnswer =
              typeof rawAns === "number" && rawAns >= 1 ? rawAns - 1 : 0;

            return {
              questionText: q.questionText,
              options: q.options ? [...q.options] : ["", "", ""],
              correctAnswer,
              explanationText: existingTask.explanations?.[idx]?.text ?? "",
              highlightedText:
                existingTask.explanations?.[idx]?.highlightedText ?? "",
            };
          },
        );
        setQuestions(loadedQuestions);
      }
    }
  }, [existingTask]);

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

  const updateQuestion = (
    qIndex: number,
    field: keyof QuestionItem,
    value: unknown,
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, [field]: value } : q)),
    );
  };

  const updateOptionText = (
    qIndex: number,
    oIndex: number,
    text: string,
  ) => {
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

    const payload = {
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
          className="text-ink-3 hover:text-ink inline-flex items-center gap-1.5 text-xs font-medium transition-colors mb-1"
        >
          ← Назад к списку заданий
        </Link>
        <h1 className="font-display text-[28px] tracking-tight sm:text-[34px]">
          {isEditMode
            ? `Редактирование задания по аудированию #${taskId}`
            : "Новое задание по аудированию"}
        </h1>
      </div>

      {formError && (
        <div className="border-red-200 bg-red-50 text-red-700 rounded-xl border p-4 text-[14px]">
          {formError}
        </div>
      )}

      {/* Basic Parameters */}
      <div className="bg-surface border-line space-y-5 rounded-xl border p-6 shadow-xs">
        <h2 className="font-display text-[20px] font-semibold">
          1. Основные параметры
        </h2>

        {/* Topic Selection */}
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
        </div>

        {/* Audio File & URL */}
        <div className="space-y-3">
          <label className="text-ink block text-[14px] font-medium">
            Аудиозапись *
          </label>

          {/* Upload Drop Zone */}
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
              <div className="mt-2 text-[13px] text-red-600 font-medium">
                {uploadError}
              </div>
            )}
          </div>

          {/* Direct URL Fallback Input */}
          <div>
            <span className="text-ink-3 mb-1.5 block text-[13px]">
              Или укажите прямую ссылку на аудиофайл (URL):
            </span>
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://... или /uploads/audio/example.mp3"
              className="bg-surface-2 border-line text-ink w-full rounded-lg border px-3.5 py-2.5 text-[14px] font-mono focus:outline-hidden"
            />
          </div>

          {/* Preview Player */}
          {audioUrl.trim() && (
            <div className="bg-surface-2 border-line rounded-lg border p-3">
              <span className="text-ink-3 mb-1 block text-[12px] font-medium">
                Предпросмотр аудиоплеера:
              </span>
              <audio src={normalizeAudioUrl(audioUrl)} controls className="h-10 w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Questions Constructor */}
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
            <div className="flex items-center justify-between border-line pb-3 border-b">
              <span className="font-display text-[17px] font-semibold text-ink">
                Вопрос №{qIndex + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestionBlock(qIndex)}
                  className="text-red-500 hover:text-red-700 text-[13px] font-medium transition-colors"
                >
                  Удалить вопрос
                </button>
              )}
            </div>

            {/* Question Text */}
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

            {/* Options */}
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
                      className="text-ink-4 hover:text-red-500 px-1 text-[16px]"
                      title="Удалить вариант"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="text-accent hover:underline text-[13px] font-medium pt-1"
              >
                + Добавить вариант ответа
              </button>
            </div>

            {/* Explanation & Highlight */}
            <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
              <div>
                <label className="text-ink mb-1.5 block text-[13.5px] font-medium">
                  Пояснение ответа *
                </label>
                <textarea
                  rows={7}
                  value={q.explanationText}
                  onChange={(e) =>
                    updateQuestion(qIndex, "explanationText", e.target.value)
                  }
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
                  value={q.highlightedText}
                  onChange={(e) =>
                    updateQuestion(qIndex, "highlightedText", e.target.value)
                  }
                  placeholder="Фрагменты из текста/пояснения (можно несколько, каждую фразу с новой строки или через точку с запятой)..."
                  className="bg-surface-2 border-line text-ink min-h-[160px] w-full rounded-lg border px-3.5 py-2.5 font-mono text-[13.5px] leading-relaxed focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/admin/tasks/audio"
          className="border-line text-ink hover:bg-surface rounded-lg border px-5 py-2.5 text-[14.5px] font-medium transition-colors"
        >
          Отмена
        </Link>
        <button
          type="submit"
          disabled={isSaving}
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
