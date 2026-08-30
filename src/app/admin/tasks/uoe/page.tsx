import { Suspense } from "react";
import { UoeAdminTabsView } from "@/app/_components/admin/tasks/uoe-admin-tabs-view";

export default function AdminUoeTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 p-8 text-center">
          Загрузка списка заданий...
        </div>
      }
    >
      <UoeAdminTabsView />
    </Suspense>
  );
}
