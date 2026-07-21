"use client";

import { Suspense } from "react";
import { ListeningRunner } from "@/app/_components/training/listening/listening-runner";

export default function ListeningPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
          Загрузка задания...
        </div>
      }
    >
      <ListeningRunner />
    </Suspense>
  );
}
