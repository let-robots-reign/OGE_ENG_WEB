"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { CustomSelect } from "@/app/_components/ui/custom-select";
import {
  AdminHeader,
  AdminPagination,
  AdminDeleteModal,
} from "@/app/_components/admin/admin-table-controls";

export function UoeTasksListView() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState<"id" | "topicTitle">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const utils = api.useUtils();

  const { data: topics } = api.admin.getUoeTopics.useQuery();

  const { data, isLoading, isFetching } = api.admin.getUoeTasks.useQuery({
    page,
    pageSize,
    search,
    topicId: selectedTopicId,
    sortBy,
    sortOrder,
  });

  const deleteMutation = api.admin.deleteUoeTasks.useMutation({
    onSuccess: async () => {
      setSelectedIds([]);
      setDeleteConfirmId(null);
      setIsDeletingModalOpen(false);
      await utils.admin.getUoeTasks.invalidate();
    },
  });

  const tasks = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleSelectAll = (checked: boolean) => {
    if (checked && tasks) {
      setSelectedIds(tasks.map((t) => t.id));
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

  const handleDeleteConfirmed = () => {
    const idsToDelete =
      deleteConfirmId !== null ? [deleteConfirmId] : selectedIds;
    if (idsToDelete.length === 0) return;
    deleteMutation.mutate({ ids: idsToDelete });
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
    tasks.length > 0
      ? tasks.every((item) => selectedIds.includes(item.id))
      : false;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <AdminHeader
        title="Языковой материал"
        description="Список всех активных заданий тренировки «Языковой материал» (Грамматика и лексика)."
        createHref="/admin/tasks/uoe/create"
      />

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
              placeholder="Поиск по предложению, начальному слову, ответу или ID..."
              className="bg-surface-2 border-line text-ink placeholder:text-ink-4 focus:ring-accent/50 w-full rounded-lg border py-2 pr-4 pl-10 text-[14px] focus:ring-2 focus:outline-hidden"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={[
                { value: 0, label: "Все темы языкового материала" },
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
              onClick={() => {
                setDeleteConfirmId(null);
                setIsDeletingModalOpen(true);
              }}
              className="rounded-md bg-red-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-red-700"
            >
              Удалить выбранные ({selectedIds.length})
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
                  className="hover:text-ink w-40 cursor-pointer px-4 py-3.5"
                >
                  <div className="flex items-center gap-1">
                    Тема
                    {sortBy === "topicTitle" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3.5">Предложение / Задание</th>
                <th className="w-36 px-4 py-3.5">Начальное слово</th>
                <th className="w-36 px-4 py-3.5">Правильный ответ</th>
                <th className="w-28 px-4 py-3.5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={7} className="text-ink-3 py-12 text-center">
                    Загрузка заданий...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-ink-3 py-12 text-center">
                    Задания не найдены.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isSelected = selectedIds.includes(task.id);

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
                        {task.task}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-surface-2 text-ink border-line rounded-md border px-2 py-0.5 font-mono text-[12.5px] font-semibold">
                          {task.origin}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md border px-2 py-0.5 font-mono text-[12.5px] font-bold">
                          {task.answer}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/tasks/uoe/${task.id}`}
                            className="text-ink-3 hover:bg-surface-2 hover:text-ink rounded-lg p-1.5 transition-colors"
                            title="Редактировать"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmId(task.id);
                              setIsDeletingModalOpen(true);
                            }}
                            className="text-red-500 hover:bg-red-500/10 rounded-lg p-1.5 transition-colors"
                            title="Удалить"
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
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          itemLabel="заданий"
        />
      </div>

      {/* Delete Modal */}
      <AdminDeleteModal
        isOpen={isDeletingModalOpen}
        onClose={() => {
          setIsDeletingModalOpen(false);
          setDeleteConfirmId(null);
        }}
        onConfirm={handleDeleteConfirmed}
        isDeleting={deleteMutation.isPending}
        count={selectedIds.length}
        singleId={deleteConfirmId}
      />
    </div>
  );
}
