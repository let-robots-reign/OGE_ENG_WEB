import { Suspense } from "react";
import { ReadingTasksListView } from "@/app/_components/admin/tasks/reading-tasks-list-view";

export default function AdminReadingTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 p-8 text-center">
          Загрузка списка заданий по чтению...
        </div>
      }
    >
      <ReadingTasksListView />
    </Suspense>
  );
}
