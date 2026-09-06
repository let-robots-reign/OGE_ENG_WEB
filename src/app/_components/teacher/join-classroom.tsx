"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { getInitials } from "./utils";
import { pluralize } from "@/app/_utils/pluralize";

interface JoinInfo {
  id: string;
  name: string;
  teacherName: string;
  memberCount: number;
  viewerRole: string | null;
  currentClassroom: { id: string; name: string } | null;
  isCurrentClass: boolean;
}

function WarnIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[480px]">
      <div className="border-line bg-surface rounded-xl border p-8 text-center shadow-lg sm:p-10">
        {children}
      </div>
    </div>
  );
}

/** Invalid / expired token state. */
export function JoinInvalid() {
  return (
    <Card>
      <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
        <span className="bg-accent h-1.5 w-1.5 rounded-full" />
        Приглашение в класс
      </div>
      <h1 className="font-display mt-6 text-[30px] leading-[1.05] tracking-[-0.025em]">
        Ссылка недействительна
      </h1>
      <p className="text-ink-3 mt-3 text-[14.5px] leading-[1.5]">
        Возможно, учитель обновил ссылку-приглашение. Попросите прислать новую.
      </p>
      <Link
        href="/"
        className="rounded-pill border-line-2 text-ink hover:bg-surface-2 mt-7 inline-flex h-12 items-center justify-center border px-6 text-[15px] font-medium transition-colors"
      >
        На главную
      </Link>
    </Card>
  );
}

export function JoinClassroom({ token, info }: { token: string; info: JoinInfo }) {
  const router = useRouter();
  const join = api.teacher.joinClassroom.useMutation({
    onSuccess: () => {
      router.push("/profile/me");
      router.refresh();
    },
  });

  const isStudent = info.viewerRole === "student";
  const isTransfer = !!info.currentClassroom && !info.isCurrentClass;

  return (
    <Card>
      <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
        <span className="bg-accent h-1.5 w-1.5 rounded-full" />
        Приглашение в класс
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <span className="bg-accent-soft text-accent grid h-10 w-10 place-items-center rounded-full text-[13px] font-semibold">
          {getInitials(info.teacherName, info.teacherName)}
        </span>
        <span className="text-ink-2 text-[14.5px]">
          {info.teacherName} приглашает вас в класс
        </span>
      </div>

      <h1 className="font-display mt-4 text-[34px] leading-[1.05] tracking-[-0.025em] sm:text-[38px]">
        {info.name}
      </h1>
      <div className="text-ink-3 mt-2.5 text-[14px]">
        {info.memberCount}{" "}
        {pluralize(info.memberCount, "ученик", "ученика", "учеников")} ·
        Английский язык, ОГЭ
      </div>

      {info.isCurrentClass ? (
        <>
          <div className="bg-ok-soft text-ok mt-6 rounded-md p-3.5 text-left text-[13px] leading-[1.5]">
            Вы уже состоите в этом классе.
          </div>
          <Link
            href="/profile/me"
            className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover mt-6 inline-flex h-[50px] w-full items-center justify-center text-[15.5px] font-medium transition-colors"
          >
            В профиль →
          </Link>
        </>
      ) : !isStudent ? (
        <>
          <div className="bg-warn-soft mt-6 flex gap-2.5 rounded-md p-3.5 text-left text-[13px] leading-[1.5] text-[color:var(--color-warn)]">
            <WarnIcon />
            <span>
              Вступить в класс может только ученик. Аккаунты учителя и
              администратора вступать в классы не могут.
            </span>
          </div>
          <Link
            href="/"
            className="rounded-pill border-line-2 text-ink hover:bg-surface-2 mt-6 inline-flex h-[50px] w-full items-center justify-center text-[15px] font-medium transition-colors"
          >
            На главную
          </Link>
        </>
      ) : (
        <>
          {isTransfer && (
            <div className="bg-warn-soft mt-6 flex gap-2.5 rounded-md p-3.5 text-left text-[13px] leading-[1.5] text-[color:var(--color-warn)]">
              <WarnIcon />
              <span>
                Вы уже состоите в классе{" "}
                <b>«{info.currentClassroom!.name}»</b>. Вступив сюда, вы перейдёте
                в новый класс — из прежнего вас исключат.
              </span>
            </div>
          )}

          <div className="bg-accent-soft mt-3 flex gap-2.5 rounded-md p-3.5 text-left text-[13px] leading-[1.5] text-[color:var(--color-accent)]">
            <ShieldIcon />
            <span>
              Вступив в класс, вы соглашаетесь, что учитель будет видеть ваш
              учебный прогресс в приложении.
            </span>
          </div>

          {join.error && (
            <p className="text-err mt-4 text-[13.5px]">
              Не удалось вступить в класс. Возможно, ссылка устарела.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => join.mutate({ token })}
              disabled={join.isPending}
              className="rounded-pill bg-ink text-on-ink hover:bg-ink-hover inline-flex h-[50px] w-full items-center justify-center text-[15.5px] font-medium transition-colors disabled:opacity-60"
            >
              {join.isPending
                ? "Вступаем…"
                : isTransfer
                  ? "Перейти в этот класс"
                  : "Вступить в класс"}
            </button>
            <Link
              href="/"
              className="rounded-pill border-line-2 text-ink-3 hover:bg-surface-2 inline-flex h-[50px] w-full items-center justify-center text-[15px] font-medium transition-colors"
            >
              Отмена
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
