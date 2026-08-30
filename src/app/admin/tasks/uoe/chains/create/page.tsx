import { Suspense } from "react";
import { UoeTaskChainFormView } from "@/app/_components/admin/tasks/uoe-task-chain-form-view";

export default function AdminCreateUoeTaskChainPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 p-8 text-center">Загрузка формы...</div>
      }
    >
      <UoeTaskChainFormView />
    </Suspense>
  );
}
