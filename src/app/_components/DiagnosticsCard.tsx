"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { TrainingCard } from "./training-card";
import { Modal } from "./Modal";
import styles from "@/app/page.module.css";
import headerStyles from "./Header.module.css";
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
        className={`${styles.trainingLink} ${
          disabled ? styles.disabledLink : ""
        }`}
        onClick={handleDiagnosticsClick}
      >
        <TrainingCard
          className={clsx(
            "grid-cols-[1fr_3fr]",
            disabled && styles.disabledCard,
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
          <div className={headerStyles.modalActions}>
            <button
              onClick={() => router.push("/auth/signin")}
              className={`${headerStyles.btn} ${headerStyles.primary}`}
            >
              Войти
            </button>
            <button
              onClick={() => setShowModal(false)}
              className={`${headerStyles.btn} ${headerStyles.secondary}`}
            >
              Отмена
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
