"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

type Mode = "rename" | "delete" | null;

function PencilIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4.5l5 5L8 21H3v-5z" />
      <path d="M13 6l5 5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Lifecycle controls for the classroom owner: rename (inline modal) and delete
 * (confirm modal). Deleting drops the class and its membership links; students
 * and their results are untouched, so the confirm copy says as much.
 */
export function ClassroomSettings({
  classroomId,
  name,
}: {
  classroomId: string;
  name: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [value, setValue] = useState(name);

  const rename = api.teacher.renameClassroom.useMutation({
    onSuccess: () => {
      setMode(null);
      router.refresh();
    },
  });
  const remove = api.teacher.deleteClassroom.useMutation({
    onSuccess: () => {
      router.push("/teacher");
      router.refresh();
    },
  });

  const busy = rename.isPending || remove.isPending;

  const close = () => {
    if (busy) return;
    setMode(null);
    setTimeout(() => {
      setValue(name);
      rename.reset();
      remove.reset();
    }, 150);
  };

  const submitRename = () => {
    const trimmed = value.trim();
    if (!trimmed || rename.isPending) return;
    rename.mutate({ classroomId, name: trimmed });
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setValue(name);
            setMode("rename");
          }}
          className="rounded-pill border-line-2 text-ink-3 hover:bg-surface-2 hover:text-ink inline-flex items-center gap-1.5 border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
        >
          <PencilIcon />
          Переименовать
        </button>
        <button
          type="button"
          onClick={() => setMode("delete")}
          className="rounded-pill border-line-2 text-err hover:bg-err-soft inline-flex items-center gap-1.5 border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
        >
          <TrashIcon />
          Удалить класс
        </button>
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          style={{ backgroundColor: "rgba(10,23,51,0.45)" }}
          onClick={close}
          role="presentation"
        >
          <div
            className="bg-surface border-line relative w-full max-w-[440px] rounded-xl border p-7 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              aria-label="Закрыть"
              onClick={close}
              disabled={busy}
              className="border-line text-ink-3 hover:bg-surface-2 absolute top-5 right-5 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border transition-colors disabled:opacity-60"
            >
              <CloseIcon />
            </button>

            {mode === "rename" ? (
              <>
                <h2 className="font-display m-0 text-[26px] leading-[1.05] tracking-[-0.025em]">
                  Переименовать класс
                </h2>
                <div className="mt-6">
                  <label className="text-ink-4 mb-2.5 block font-mono text-[10.5px] tracking-[0.1em] uppercase">
                    Название класса
                  </label>
                  <input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitRename()}
                    maxLength={255}
                    className="border-line-2 bg-surface text-ink focus:border-accent h-12 w-full rounded-sm border px-3.5 text-[15px] transition-colors outline-none"
                  />
                  {rename.error && (
                    <p className="text-err mt-3 text-[13px]">
                      Не удалось переименовать класс. Попробуйте ещё раз.
                    </p>
                  )}
                </div>
                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-pill border-line-2 text-ink-3 hover:bg-surface-2 inline-flex h-11 items-center border px-[22px] text-[15px] font-medium transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={submitRename}
                    disabled={!value.trim() || rename.isPending}
                    className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover inline-flex h-11 items-center px-[22px] text-[15px] font-medium transition-colors disabled:opacity-60"
                  >
                    {rename.isPending ? "Сохраняем…" : "Сохранить"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display m-0 text-[26px] leading-[1.05] tracking-[-0.025em]">
                  Удалить класс?
                </h2>
                <div className="text-ink-3 mt-3 text-[14px] leading-[1.55]">
                  Класс <span className="text-ink font-medium">{name}</span> и
                  ссылка-приглашение будут удалены безвозвратно. Ученики и их
                  результаты сохранятся — они просто перестанут состоять в этом
                  классе.
                </div>
                {remove.error && (
                  <p className="text-err mt-3 text-[13px]">
                    Не удалось удалить класс. Попробуйте ещё раз.
                  </p>
                )}
                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-pill border-line-2 text-ink-3 hover:bg-surface-2 inline-flex h-11 items-center border px-[22px] text-[15px] font-medium transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={() => remove.mutate({ classroomId })}
                    disabled={remove.isPending}
                    className="rounded-pill bg-err inline-flex h-11 items-center px-[22px] text-[15px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
                  >
                    {remove.isPending ? "Удаляем…" : "Удалить класс"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
