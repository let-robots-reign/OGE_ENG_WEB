import { Suspense } from "react";
import { AudioTaskFormView } from "@/app/_components/admin/tasks/audio-task-form-view";

export default function AdminNewAudioTaskPage() {
  return (
    <Suspense fallback={<div className="text-ink-3 p-8 text-center">Загрузка формы...</div>}>
      <AudioTaskFormView />
    </Suspense>
  );
}
