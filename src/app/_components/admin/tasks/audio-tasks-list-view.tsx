"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { CustomSelect } from "@/app/_components/ui/custom-select";
import { normalizeAudioUrl } from "@/app/_utils/audio";

function CompactAudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fullUrl = normalizeAudioUrl(src);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        src={fullUrl}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="metadata"
      />
      <button
        type="button"
        onClick={togglePlay}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
          isPlaying
            ? "bg-accent text-white"
            : "bg-surface-2 text-ink hover:bg-surface-3"
        }`}
        title={isPlaying ? "Пауза" : "Воспроизвести"}
      >
        {isPlaying ? (
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="ml-0.5 h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <span
        className="text-ink-3 max-w-[110px] truncate font-mono text-[12px]"
        title={src}
      >
        {src.split("/").pop() ?? "аудио"}
      </span>
    </div>
  );
}

export function AudioTasksListView() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState<"id" | "topicTitle">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const utils = api.useUtils();

  const { data: topics } = api.admin.getAudioTopics.useQuery();

  const { data, isLoading, isFetching } = api.admin.getAudioTasks.useQuery({
    page,
    pageSize,
    search,
    topicId: selectedTopicId,
    sortBy,
    sortOrder,
  });

  const deleteMutation = api.admin.deleteAudioTasks.useMutation({
    onSuccess: async () => {
      setSelectedIds([]);
      setDeleteConfirmId(null);
      await utils.admin.getAudioTasks.invalidate();
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.items) {
      setSelectedIds(data.items.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ ids: selectedIds });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async (id: number) => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ ids: [id] });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSort = (field: "id" | "topicTitle") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const allPageIdsSelected =
    data?.items && data.items.length > 0
      ? data.items.every((item) => selectedIds.includes(item.id))
      : false;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[32px] tracking-tight sm:text-[40px]">
            Аудирование
          </h1>
          <p className="text-ink-3 mt-1 text-[14.5px]">
            Список всех активных заданий тренировки «Аудирование».
          </p>
        </div>
        <div>
          <Link
            href="/admin/tasks/audio/new"
            className="bg-ink hover:bg-ink-2 text-on-ink inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14.5px] font-medium transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Создать задание
          </Link>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-surface border-line space-y-3 rounded-xl border p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <svg
              className="text-ink-4 absolute top-3 left-3.5 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Поиск по теме, тексту вопроса или ID..."
              className="bg-surface-2 border-line text-ink placeholder:text-ink-4 focus:ring-accent/50 w-full rounded-lg border py-2 pr-4 pl-10 text-[14px] focus:ring-2 focus:outline-hidden"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={[
                { value: 0, label: "Все темы аудирования" },
                ...(topics?.map((t) => ({ value: t.id, label: t.title })) ??
                  []),
              ]}
              value={selectedTopicId ?? 0}
              onChange={(val) => {
                setSelectedTopicId(val === 0 ? undefined : Number(val));
                setPage(1);
              }}
              className="min-w-[210px]"
            />

            <CustomSelect
              options={[
                { value: 10, label: "10 на стр." },
                { value: 20, label: "20 на стр." },
                { value: 50, label: "50 на стр." },
              ]}
              value={pageSize}
              onChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
              className="w-32"
            />
          </div>
        </div>

        {/* Selection / Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-accent/10 border-accent/20 flex items-center justify-between rounded-lg border px-4 py-2 text-[14px]">
            <span className="text-ink font-medium">
              Выбрано элементов: {selectedIds.length}
            </span>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Удаление..." : "Удалить выбранные"}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface border-line overflow-hidden rounded-xl border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-[14px]">
            <thead className="bg-surface-2 text-ink-3 border-line border-b text-[12px] font-semibold tracking-wider uppercase">
              <tr>
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={allPageIdsSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-accent h-4 w-4 rounded"
                  />
                </th>
                <th
                  onClick={() => toggleSort("id")}
                  className="hover:text-ink w-20 cursor-pointer px-4 py-3.5"
                >
                  <div className="flex items-center gap-1">
                    ID
                    {sortBy === "id" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("topicTitle")}
                  className="hover:text-ink w-44 cursor-pointer px-4 py-3.5"
                >
                  <div className="flex items-center gap-1">
                    Тема
                    {sortBy === "topicTitle" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3.5">Задание</th>
                <th className="w-40 px-4 py-3.5">Аудиозапись</th>
                <th className="w-32 px-4 py-3.5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="text-ink-3 py-12 text-center">
                    Загрузка заданий...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-ink-3 py-12 text-center">
                    Задания не найдены.
                  </td>
                </tr>
              ) : (
                data.items.map((task) => {
                  const isSelected = selectedIds.includes(task.id);
                  const fullTaskText = task.questions
                    ?.map((q) => q.questionText)
                    .filter(Boolean)
                    .join(" ");

                  const taskPreview = fullTaskText
                    ? fullTaskText.length > 200
                      ? fullTaskText.slice(0, 200) + "..."
                      : fullTaskText
                    : "—";

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-surface-2/60 transition-colors ${
                        isSelected ? "bg-accent/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectOne(task.id, e.target.checked)
                          }
                          className="accent-accent h-4 w-4 rounded"
                        />
                      </td>
                      <td className="text-ink px-4 py-3.5 font-mono text-[13px] font-medium">
                        #{task.id}
                      </td>
                      <td className="text-ink px-4 py-3.5 font-medium">
                        {task.topic?.title ?? "—"}
                      </td>
                      <td className="text-ink-2 max-w-[340px] px-4 py-3.5 text-[13.5px] leading-snug">
                        {taskPreview}
                      </td>
                      <td className="px-4 py-3.5">
                        <CompactAudioPlayer src={task.audioUrl} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/tasks/audio/${task.id}`}
                            className="border-line text-ink hover:bg-surface-2 rounded-md border px-2.5 py-1 text-[13px] font-medium transition-colors"
                          >
                            Изменить
                          </Link>
                          {deleteConfirmId === task.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteSingle(task.id)}
                                disabled={isDeleting}
                                className="rounded-md bg-red-600 px-2 py-1 text-[12px] font-medium text-white hover:bg-red-700"
                              >
                                Да
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="bg-surface-2 text-ink rounded-md px-2 py-1 text-[12px]"
                              >
                                Нет
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(task.id)}
                              className="rounded-md px-2 py-1 text-[13px] text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.totalPages > 0 && (
          <div className="border-line bg-surface-2/40 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-ink-3 text-[13px]">
              Показаны {data.items.length > 0 ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, data.totalCount)} из {data.totalCount}{" "}
              заданий
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-line text-ink disabled:text-ink-4 hover:bg-surface rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-40"
              >
                ← Назад
              </button>
              <span className="text-ink px-2 font-mono text-[13px]">
                {page} / {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="border-line text-ink disabled:text-ink-4 hover:bg-surface rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-40"
              >
                Вперед →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
