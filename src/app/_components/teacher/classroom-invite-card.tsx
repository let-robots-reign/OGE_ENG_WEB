"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { InviteLink } from "./invite-link";

/**
 * Header invite block for the classroom cabinet. "Обновить ссылку" regenerates
 * the token (a two-step confirm, since the old link stops working) and refreshes
 * the page so every consumer of the token re-renders with the new value.
 */
export function ClassroomInviteCard({
  classroomId,
  initialToken,
}: {
  classroomId: string;
  initialToken: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const regenerate = api.teacher.regenerateInviteToken.useMutation({
    onSuccess: () => {
      setConfirming(false);
      router.refresh();
    },
  });

  return (
    <div className="border-line bg-surface w-full max-w-[380px] rounded-lg border p-4 lg:min-w-[340px]">
      <div className="text-ink-4 mb-2.5 font-mono text-[10.5px] tracking-[0.1em] uppercase">
        Ссылка-приглашение
      </div>
      <InviteLink token={initialToken} />
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {confirming ? (
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-ink-3">Старая ссылка перестанет работать.</span>
            <button
              type="button"
              onClick={() => regenerate.mutate({ classroomId })}
              disabled={regenerate.isPending}
              className="text-accent font-medium hover:underline disabled:opacity-60"
            >
              {regenerate.isPending ? "Обновляем…" : "Обновить"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-ink-3 hover:text-ink"
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-ink-3 hover:text-ink text-[12px] transition-colors"
          >
            Обновить ссылку — старая перестанет работать
          </button>
        )}
      </div>
    </div>
  );
}
