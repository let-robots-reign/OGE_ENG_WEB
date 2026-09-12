"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Modal } from "@/app/_components/Modal";
import { updateRole } from "./actions";

type SelectableRole = "student" | "teacher";

const ROLE_OPTIONS: { value: SelectableRole; label: string; hint: string }[] = [
  { value: "student", label: "Я ученик", hint: "Готовлюсь к ОГЭ" },
  {
    value: "teacher",
    label: "Я учитель",
    hint: "Веду классы и слежу за прогрессом учеников",
  },
];

const noop = () => undefined;

/**
 * Asks users without a role who they are — e.g. OAuth sign-ups from the sign-in
 * page, where no role is picked. Not dismissible: the role decides access to
 * classes and the teacher cabinet.
 */
export function RoleGate() {
  const { data: session, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState<SelectableRole | null>(null);
  const [error, setError] = useState(false);

  if (!session?.user || session.user.role || pathname.startsWith("/auth")) {
    return null;
  }

  const choose = async (role: SelectableRole) => {
    setPending(role);
    setError(false);
    const result = await updateRole(role);
    if (result.success) {
      await update();
      // Server components (header nav, pages) read the role from the session.
      router.refresh();
    } else {
      setError(true);
    }
    setPending(null);
  };

  return (
    <Modal title="Кто вы?" onClose={noop}>
      <p className="mb-5 text-[15px]">
        Выберите роль, чтобы мы настроили сайт под вас. Учителям откроется
        кабинет с классами и статистикой учеников.
      </p>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {ROLE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={pending !== null}
            onClick={() => void choose(option.value)}
            className="border-line-2 bg-surface hover:bg-surface-2 flex-1 rounded-md border px-4 py-3.5 text-left transition-colors disabled:opacity-60"
          >
            <span className="text-ink block text-[15px] font-medium">
              {pending === option.value ? "Сохраняем…" : option.label}
            </span>
            <span className="text-ink-3 mt-0.5 block text-[13px]">
              {option.hint}
            </span>
          </button>
        ))}
      </div>
      {error && (
        <p className="text-err mt-3 text-[13px]">
          Не удалось сохранить роль. Попробуйте ещё раз.
        </p>
      )}
    </Modal>
  );
}
