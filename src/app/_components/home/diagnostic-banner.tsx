"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/_components/Modal";

interface DiagnosticBannerProps {
  completed: boolean;
  loggedIn: boolean;
}

export function DiagnosticBanner({
  completed,
  loggedIn,
}: DiagnosticBannerProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const href = completed
    ? "/diagnostics/grammar/result"
    : "/diagnostics/grammar";

  const handleClick = (e: React.MouseEvent) => {
    // Completed users (always logged in) follow the link to their saved result.
    if (completed) return;
    if (!loggedIn) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <section id="diagnostics" className="mb-9">
      <Link
        href={href}
        onClick={handleClick}
        className="bg-ink dark:bg-surface-2 dark:border-accent-line relative block overflow-hidden rounded-lg p-7 text-white no-underline sm:p-9 dark:border"
      >
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] text-white/55 uppercase">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: completed
                    ? "var(--color-ok)"
                    : "var(--color-accent-2)",
                }}
              />
              {completed ? "04 — пройдено" : "04 — старт"}
            </div>
            <div className="font-display mt-3 text-[30px] leading-none tracking-[-0.025em] text-white sm:text-[38px] lg:text-[44px]">
              {completed
                ? "Грамматическая диагностика пройдена"
                : "Первоначальная грамматическая диагностика"}
            </div>
          </div>
          <div className="text-[15px] leading-[1.45] text-white/70 lg:max-w-[380px]">
            {completed
              ? "Вы уже прошли диагностику. Откройте свой персональный разбор, чтобы вспомнить ошибки и сильные стороны."
              : "24 коротких вопроса, чтобы понять ваш уровень и составить персональный план до экзамена."}
            <div className="mt-3.5 font-mono text-[12px] tracking-[0.05em] text-white/45">
              {completed ? "разбор сохранён" : "≈ 12 минут · без таймера"}
            </div>
          </div>
          <button className="rounded-pill inline-flex h-[52px] w-full shrink-0 items-center justify-center bg-white px-7 text-[16px] font-medium text-[#0a1733] transition-colors hover:bg-[#eef1f7] lg:w-auto">
            {completed ? "Посмотреть разбор →" : "Пройти диагностику →"}
          </button>
        </div>
      </Link>

      {showModal && (
        <Modal
          title="Доступно только авторизованным пользователям"
          onClose={() => setShowModal(false)}
        >
          <div className="mt-2 flex gap-3">
            <button
              onClick={() => router.push("/auth/signin")}
              className="bg-ink text-on-ink hover:bg-ink-hover rounded-pill h-10 flex-1 text-[14px] font-medium transition-colors"
            >
              Войти
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="border-line-2 text-ink hover:bg-surface-2 rounded-pill h-10 flex-1 border text-[14px] font-medium transition-colors"
            >
              Отмена
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
