"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UoeTaskChainsListView } from "./uoe-task-chains-list-view";
import { UoeTasksListView } from "./uoe-tasks-list-view";

export function UoeAdminTabsView() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "chains" ? "chains" : "tasks";

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Разделы языкового материала"
        className="border-line mx-auto flex max-w-[1200px] gap-1 border-b"
      >
        <Link
          role="tab"
          aria-selected={activeTab === "tasks"}
          href="/admin/tasks/uoe?tab=tasks"
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "tasks"
              ? "border-ink text-ink"
              : "text-ink-3 hover:text-ink border-transparent"
          }`}
        >
          Задания
        </Link>
        <Link
          role="tab"
          aria-selected={activeTab === "chains"}
          href="/admin/tasks/uoe?tab=chains"
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "chains"
              ? "border-ink text-ink"
              : "text-ink-3 hover:text-ink border-transparent"
          }`}
        >
          Цепочки заданий
        </Link>
      </div>

      {activeTab === "chains" ? (
        <UoeTaskChainsListView />
      ) : (
        <UoeTasksListView />
      )}
    </div>
  );
}
