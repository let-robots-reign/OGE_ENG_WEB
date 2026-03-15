"use client";

import Link from "next/link";
import { TrainingCard } from "./_components/training-card";
import { TheoryCard } from "./_components/theory-card";
import styles from "./page.module.css";
import headerStyles from "./_components/Header.module.css";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Modal } from "./_components/Modal";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const cards = {
    training: [
      {
        key: "audio",
        title: "Аудирование",
        image: "ic_audio.svg",
        urlSuffix: "/topics",
      },
      {
        key: "reading",
        title: "Чтение",
        image: "ic_reading.svg",
        urlSuffix: "/topics",
      },
      {
        key: "use-of-english",
        title: "Языковой материал",
        image: "ic_use_of_english.svg",
        urlSuffix: "/topics",
      },
      {
        key: "writing",
        title: "Письмо",
        image: "ic_writing.svg",
        urlSuffix: "",
      },
    ],
    diagnostics: [
      {
        key: "grammar",
        title: "Первоначальная грамматическая диагностика",
        image: "ic_diagnostics.svg",
      },
    ],
    theory: [
      {
        key: "general",
        title: "Общая информация об экзамене",
        image: "ic_exam.svg",
      },
      {
        key: "use-of-english",
        title: "Языковой материал",
        image: "ic_use_of_english.svg",
      },
      {
        key: "writing",
        title: "Письмо",
        image: "ic_writing.svg",
      },
    ],
  };

  const handleDiagnosticsClick = (e: React.MouseEvent, key: string) => {
    if (!session) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <>
      <div className={styles.mainPageSections}>
        <div className={styles.mainPageSection}>
          <p className={styles.sectionName}>Тренировки</p>
          <div className={styles.trainingsGrid}>
            {cards.training.map(({ key, title, image, urlSuffix }) => (
              <Link
                key={key}
                href={`/training/${key}${urlSuffix}`}
                className={styles.trainingLink}
              >
                <TrainingCard
                  className="grid-cols-[1fr_2fr]"
                  title={title}
                  image={image}
                />
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.mainPageSection}>
          <p className={styles.sectionName}>Теория</p>
          <div className={styles.theoryGrid}>
            {cards.theory.map(({ key, title, image }) => (
              <Link
                key={key}
                href={`/theory/${key}`}
                className={styles.theoryLink}
              >
                <TheoryCard title={title} image={image} />
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.mainPageSection}>
          <p className={styles.sectionName}>Диагностика</p>
          <div className={styles.trainingsGrid}>
            {cards.diagnostics.map(({ key, title, image }) => (
              <Link
                key={key}
                href={`/diagnostics/${key}`}
                className={styles.trainingLink}
                onClick={(e) => handleDiagnosticsClick(e, key)}
              >
                <TrainingCard
                  className="grid-cols-[1fr_3fr]"
                  title={title}
                  image={image}
                  isBeta
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
      {showModal && (
        <Modal
          className={styles.loginRequiredModal}
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
