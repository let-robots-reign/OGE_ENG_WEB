"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { TrainingCard } from "./training-card";
import { Modal } from "./Modal";
import clsx from "clsx";

interface DiagnosticsCardProps {
  card: {
    key: string;
    title: string;
    image: string;
  };
  disabled?: boolean;
}

export function DiagnosticsCard({ card, disabled }: DiagnosticsCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleDiagnosticsClick = (e: React.MouseEvent) => {
    if (disabled) {
      window.alert(
        "Вы уже прошли диагностику. Продолжайте проходить тренировки и изучать теорию, чтобы подготовиться к экзамену.",
      );
      e.preventDefault();
      return;
    }

    if (!session) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <>
      <Link
        href={`/diagnostics/${card.key}`}
        className={clsx("no-underline", disabled && "cursor-default")}
        onClick={handleDiagnosticsClick}
      >
        <TrainingCard
          className={clsx(
            "grid-cols-[1fr_3fr]",
            disabled &&
              "cursor-default select-none brightness-40 hover:cursor-default hover:shadow-[2px_3px_10px_rgba(0,0,0,0.2)]",
          )}
          title={card.title}
          image={card.image}
          isBeta
        />
      </Link>
      {showModal && (
        <Modal
          title="Доступно только авторизованным пользователям"
          onClose={() => setShowModal(false)}
        >
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push("/auth/signin")}
              className="bg-ok cursor-pointer rounded-2xl px-6 py-2 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
            >
              Войти
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="bg-surface-3 text-ink-2 cursor-pointer rounded-2xl px-6 py-2 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
            >
              Отмена
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
