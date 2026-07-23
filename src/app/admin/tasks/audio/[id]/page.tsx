import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AudioTaskFormView } from "@/app/_components/admin/tasks/audio-task-form-view";

export default async function AdminEditAudioTaskPage({
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
    <Suspense fallback={<div className="text-ink-3 p-8 text-center">Загрузка задания...</div>}>
      <AudioTaskFormView taskId={taskId} />
    </Suspense>
  );
}
