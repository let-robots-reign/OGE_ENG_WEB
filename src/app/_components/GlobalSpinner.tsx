"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
export function GlobalSpinner() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isVisible = isFetching > 0 || isMutating > 0;

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
      <div className="h-[50px] w-[50px] animate-spin rounded-full border-4 border-white/30 border-t-ok" />
    </div>
  );
}
