import { Suspense } from "react";
import { AudioTasksListView } from "@/app/_components/admin/tasks/audio-tasks-list-view";

export default function AdminAudioTasksPage() {
  return (
    <Suspense fallback={<div className="text-ink-3 p-8 text-center">Загрузка списка заданий...</div>}>
      <AudioTasksListView />
    </Suspense>
  );
}
