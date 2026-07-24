"use client";

import Link from "next/link";

interface AdminHeaderProps {
  title: string;
  description: string;
  createHref: string;
  createLabel?: string;
}

export function AdminHeader({
  title,
  description,
  createHref,
  createLabel = "Создать задание",
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-[32px] tracking-tight sm:text-[40px]">
          {title}
        </h1>
        <p className="text-ink-3 mt-1 text-[14.5px]">{description}</p>
      </div>
      <div>
        <Link
          href={createHref}
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
          {createLabel}
        </Link>
      </div>
    </div>
  );
}

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function AdminPagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  itemLabel = "заданий",
}: AdminPaginationProps) {
  if (totalCount === 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="border-line bg-surface-2/40 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-ink-3 text-[13px]">
        Показаны {startItem}–{endItem} из {totalCount} {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="border-line text-ink disabled:text-ink-4 hover:bg-surface rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-40"
        >
          ← Назад
        </button>
        <span className="text-ink px-2 font-mono text-[13px]">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="border-line text-ink disabled:text-ink-4 hover:bg-surface rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-40"
        >
          Вперед →
        </button>
      </div>
    </div>
  );
}

interface AdminDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  count: number;
  singleId?: number | null;
}

export function AdminDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  count,
  singleId,
}: AdminDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-surface border-line w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-xl">
        <h3 className="font-display text-ink text-lg font-bold">
          Подтверждение удаления
        </h3>
        <p className="text-ink-2 text-sm leading-relaxed">
          {singleId !== undefined && singleId !== null
            ? `Вы действительно хотите удалить задание #${singleId}?`
            : `Вы действительно хотите удалить ${count} выбранных заданий?`}
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border-line text-ink hover:bg-surface-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}
