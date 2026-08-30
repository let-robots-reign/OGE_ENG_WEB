"use client";

import { useRouter } from "next/navigation";
export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Назад"
      className="absolute -left-[100px] mr-3 hidden h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-surface text-center text-[40px] font-bold leading-[80px] text-ink shadow-[2px_2px_3px_rgba(0,0,0,0.2)] transition-colors hover:bg-surface-3 min-[1101px]:flex"
    >
      &lt;-
    </button>
  );
}
