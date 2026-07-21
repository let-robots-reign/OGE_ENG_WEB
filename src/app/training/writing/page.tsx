"use client";

import { Suspense } from "react";
import { WritingRunner } from "@/app/_components/training/writing/writing-runner";

export default function WritingPage() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-3 grid place-items-center py-32 text-[15px]">
          Загрузка задания...
        </div>
      }
    >
      <WritingRunner />
    </Suspense>
  );
}
