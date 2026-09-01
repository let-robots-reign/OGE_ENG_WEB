"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import {
  AdminDeleteModal,
  AdminHeader,
} from "@/app/_components/admin/admin-table-controls";

export function UoeTaskChainsListView() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const utils = api.useUtils();
  const {
    data: chains,
    isLoading,
    error,
  } = api.admin.getUoeTaskChains.useQuery();
  const deleteMutation = api.admin.deleteUoeTaskChain.useMutation({
    onSuccess: async () => {
      setDeleteId(null);
      setErrorMessage(null);
      await utils.admin.getUoeTaskChains.invalidate();
    },
    onError: (mutationError) => {
      setDeleteId(null);
      setErrorMessage(mutationError.message);
    },
  });

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <AdminHeader
        title="Цепочки заданий"
        description="Связные наборы из 9 заданий для тематических тренировок."
        createHref="/admin/tasks/uoe/chains/create"
        createLabel="Создать цепочку"
      />

      {(error !== null || errorMessage !== null) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {errorMessage ?? "Не удалось загрузить цепочки заданий."}
        </div>
      )}

      <div className="bg-surface border-line overflow-hidden rounded-xl border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-surface-2 text-ink-3 border-line border-b text-xs font-semibold tracking-wider uppercase">
              <tr>
                <th className="w-24 px-5 py-3.5">ID</th>
                <th className="w-48 px-5 py-3.5">Тема</th>
                <th className="w-32 px-5 py-3.5">Заданий</th>
                <th className="px-5 py-3.5">Превью цепочки</th>
                <th className="w-32 px-5 py-3.5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-ink-3 py-12 text-center">
                    Загрузка цепочек...
                  </td>
                </tr>
              ) : !chains?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="font-display text-ink text-xl">
                      Цепочки ещё не созданы
                    </div>
                    <p className="text-ink-3 mx-auto mt-2 max-w-lg text-sm">
                      Создайте хотя бы одну цепочку, чтобы ученики могли начать
                      тематические тренировки.
                    </p>
                    <Link
                      href="/admin/tasks/uoe/chains/create"
                      className="bg-ink text-on-ink mt-5 inline-flex rounded-lg px-5 py-2.5 text-sm font-medium"
                    >
                      Создать цепочку
                    </Link>
                  </td>
                </tr>
              ) : (
                chains.map((chain) => (
                  <tr key={chain.id} className="hover:bg-surface-2/60">
                    <td className="text-ink px-5 py-4 font-mono font-semibold">
                      #{chain.id}
                    </td>
                    <td className="text-ink-2 px-5 py-4">
                      {chain.topic.title}
                    </td>
                    <td className="text-ink-2 px-5 py-4 font-mono">
                      {chain.items.length} / 9
                    </td>
                    <td className="px-5 py-4">
                      <ol className="text-ink-2 space-y-1 text-[13px]">
                        {chain.items.slice(0, 3).map((item) => (
                          <li key={item.id} className="line-clamp-1">
                            <span className="text-ink-4 mr-2 font-mono">
                              {item.position}. #{item.task.id}
                            </span>
                            {item.task.task}
                          </li>
                        ))}
                      </ol>
                      {chain.items.length > 3 && (
                        <div className="text-ink-4 mt-1 text-xs">
                          и ещё {chain.items.length - 3}…
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/tasks/uoe/chains/${chain.id}`}
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
                            setErrorMessage(null);
                            setDeleteId(chain.id);
                          }}
                          className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDeleteModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate({ id: deleteId });
        }}
        isDeleting={deleteMutation.isPending}
        count={1}
        singleId={deleteId}
        singleLabel="цепочку"
      />
    </div>
  );
}
