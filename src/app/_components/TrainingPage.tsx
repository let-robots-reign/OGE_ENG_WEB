"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { TrainingHeader } from "./TrainingHeader";
import styles from "./TrainingPage.module.css";

type TrainingPageProps = {
  topic: string;
  instruction?: ReactNode;
  children: ReactNode;
  onCheck: () => void;
  isChecking: boolean;
  isChecked: boolean;
  resultText: string;
  explanationComponent?: ReactNode;
  dismissText?: string;
};

export function TrainingPage({
  topic,
  children,
  onCheck,
  isChecking,
  isChecked,
  resultText,
  explanationComponent,
  dismissText,
}: TrainingPageProps) {
  const router = useRouter();
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCheck = () => {
    onCheck();
    setShowResult(true);
  };

  const toggleExplanation = () => {
    setShowResult(!showResult);
    setShowExplanation(!showExplanation);
  };

  return (
    <>
      <TrainingHeader topic={topic} />

      {children}

      <div className={styles.buttonsGroup}>
        <button
          className={`${styles.btn} ${styles.primary}`}
          disabled={isChecking}
          hidden={isChecked}
          onClick={handleCheck}
        >
          Проверить
        </button>
        <button
          className={`${styles.btn} ${styles.secondary}`}
          onClick={() => router.back()}
        >
          Выход
        </button>
      </div>

      {isChecked && showResult && (
        <Modal title={resultText} onClose={() => setShowResult(false)}>
          <div>
            <p>Вы можете посмотреть свои ошибки и правильные ответы.</p>
            {explanationComponent && (
              <button
                className={`${styles.btn} ${styles.primary} ${styles.btnBlock} ${styles.btnCentered}`}
                onClick={toggleExplanation}
              >
                Пояснение
              </button>
            )}
            <button
              className={`${styles.btn} ${styles.primary} ${styles.btnBlock} ${styles.btnCentered}`}
              onClick={() => setShowResult(false)}
            >
              {dismissText ?? "Закрыть"}
            </button>
          </div>
        </Modal>
      )}

      {isChecked && showExplanation && explanationComponent && (
        <Modal
          title="Пояснение к заданию"
          size="large"
          onClose={toggleExplanation}
        >
          {explanationComponent}
          <button
            className={`${styles.btn} ${styles.primary} ${styles.btnBlock} ${styles.btnCentered}`}
            onClick={toggleExplanation}
          >
            Назад
          </button>
        </Modal>
      )}
    </>
  );
}
