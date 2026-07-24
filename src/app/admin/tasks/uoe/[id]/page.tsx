import { Suspense } from "react";
import { notFound } from "next/navigation";
import { UoeTaskFormView } from "@/app/_components/admin/tasks/uoe-task-form-view";

export default async function AdminEditUoeTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskId = Number(id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="text-ink-3 p-8 text-center">Загрузка задания...</div>
      }
    >
      <UoeTaskFormView taskId={taskId} />
    </Suspense>
  );
}
