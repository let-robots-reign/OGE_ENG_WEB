import { Suspense } from "react";
import { UoeTaskFormView } from "@/app/_components/admin/tasks/uoe-task-form-view";

export default function AdminNewUoeTaskPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 p-8 text-center">Загрузка формы...</div>
      }
    >
      <UoeTaskFormView />
    </Suspense>
  );
}
