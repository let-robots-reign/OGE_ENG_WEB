import { Suspense } from "react";
import { ReadingTaskFormView } from "@/app/_components/admin/tasks/reading-task-form-view";

export default function AdminCreateReadingTaskPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 p-8 text-center">Загрузка формы...</div>
      }
    >
      <ReadingTaskFormView />
    </Suspense>
  );
}
