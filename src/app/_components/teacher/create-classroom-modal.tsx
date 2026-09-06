"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { InviteLink } from "./invite-link";

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
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

type Created = { id: string; name: string; inviteToken: string };

/**
 * "Создать класс" trigger + modal. Two states: the name form and, after
 * creation, a success panel with the invite link. Both the header button and
 * the dashed "create" card in the grid render this.
 */
export function CreateClassroomModal({
  variant = "button",
}: {
  variant?: "button" | "card";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [created, setCreated] = useState<Created | null>(null);

  const createClassroom = api.teacher.createClassroom.useMutation({
    onSuccess: (room) => {
      setCreated(room);
      router.refresh();
    },
  });

  const close = () => {
    setOpen(false);
    // Reset after the close so the form is fresh next time.
    setTimeout(() => {
      setName("");
      setCreated(null);
      createClassroom.reset();
    }, 150);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || createClassroom.isPending) return;
    createClassroom.mutate({ name: trimmed });
  };

  return (
    <>
      {variant === "button" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover inline-flex h-11 items-center gap-2 px-[22px] text-[15px] font-medium transition-colors"
        >
          <PlusIcon />
          Создать класс
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-line-2 hover:border-ink-4 flex min-h-[252px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors"
        >
          <span className="bg-accent-soft text-accent grid h-12 w-12 place-items-center rounded-full">
            <PlusIcon />
          </span>
          <span className="text-ink text-[15px] font-medium">Создать класс</span>
          <span className="text-ink-3 max-w-[200px] text-[13px]">
            Новый класс и ссылка-приглашение для учеников
          </span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          style={{ backgroundColor: "rgba(10,23,51,0.45)" }}
          onClick={close}
          role="presentation"
        >
          <div
            className="bg-surface border-line w-full max-w-[468px] rounded-xl border p-7 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {!created ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display m-0 text-[28px] leading-[1.05] tracking-[-0.025em]">
                      Новый класс
                    </h2>
                    <div className="text-ink-3 mt-1.5 text-[13.5px]">
                      Создайте группу и пригласите учеников по ссылке
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Закрыть"
                    onClick={close}
                    className="border-line text-ink-3 hover:bg-surface-2 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="mt-6">
                  <label className="text-ink-4 mb-2.5 block font-mono text-[10.5px] tracking-[0.1em] uppercase">
                    Название класса
                  </label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    maxLength={255}
                    placeholder="9 «А» · Школа 42"
                    className="border-line-2 bg-surface text-ink focus:border-accent h-12 w-full rounded-sm border px-3.5 text-[15px] outline-none transition-colors"
                  />
                  <div className="text-ink-3 mt-2.5 text-[12.5px] leading-[1.5]">
                    Ссылку-приглашение сгенерируем автоматически — сможете
                    скопировать её сразу после создания.
                  </div>
                  {createClassroom.error && (
                    <p className="text-err mt-3 text-[13px]">
                      Не удалось создать класс. Попробуйте ещё раз.
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
                    onClick={submit}
                    disabled={!name.trim() || createClassroom.isPending}
                    className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover inline-flex h-11 items-center gap-2 px-[22px] text-[15px] font-medium transition-colors disabled:opacity-60"
                  >
                    <PlusIcon />
                    {createClassroom.isPending ? "Создаём…" : "Создать класс"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    aria-label="Закрыть"
                    onClick={close}
                    className="border-line text-ink-3 hover:bg-surface-2 grid h-[34px] w-[34px] place-items-center rounded-full border transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className="text-center">
                  <span className="bg-ok-soft text-ok inline-grid h-14 w-14 place-items-center rounded-full">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <h2 className="font-display mt-4 mb-0 text-[28px] leading-[1.05] tracking-[-0.025em]">
                    Класс создан
                  </h2>
                  <div className="text-ink-3 mt-1.5 text-[14.5px]">
                    <span className="text-ink font-medium">{created.name}</span>{" "}
                    — 0 учеников
                  </div>
                </div>

                <div className="bg-bg border-line mt-6 rounded-md border p-4">
                  <div className="text-ink-4 mb-2.5 font-mono text-[10.5px] tracking-[0.1em] uppercase">
                    Ссылка-приглашение
                  </div>
                  <InviteLink token={created.inviteToken} />
                  <div className="text-ink-3 mt-2.5 text-[12.5px] leading-[1.5]">
                    Отправьте ссылку ученикам — они вступят в класс сами.
                    Обновить ссылку можно в настройках класса.
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-pill border-line-2 text-ink-3 hover:bg-surface-2 inline-flex h-11 items-center border px-[22px] text-[15px] font-medium transition-colors"
                  >
                    Готово
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/teacher/classrooms/${created.id}`)}
                    className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover inline-flex h-11 items-center px-[22px] text-[15px] font-medium transition-colors"
                  >
                    Открыть класс →
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
