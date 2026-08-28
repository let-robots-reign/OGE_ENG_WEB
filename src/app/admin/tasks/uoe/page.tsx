import { Suspense } from "react";
import { UoeTasksListView } from "@/app/_components/admin/tasks/uoe-tasks-list-view";

export default function AdminUoeTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 p-8 text-center">
          Загрузка списка заданий...
        </div>
      }
    >
      <UoeTasksListView />
    </Suspense>
  );
}
