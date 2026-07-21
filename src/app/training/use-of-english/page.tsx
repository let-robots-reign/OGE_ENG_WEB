"use client";

import { Suspense } from "react";
import { UoERunner } from "@/app/_components/training/uoe/uoe-runner";

export default function UseOfEnglishPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
          Загрузка задания...
        </div>
      }
    >
      <UoERunner />
    </Suspense>
  );
}
