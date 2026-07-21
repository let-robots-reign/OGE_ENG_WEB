"use client";

import { Suspense } from "react";
import { ReadingRunner } from "@/app/_components/training/reading/reading-runner";

export default function ReadingPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
          Загрузка задания...
        </div>
      }
    >
      <ReadingRunner />
    </Suspense>
  );
}
