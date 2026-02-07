"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { TrainingHeader } from "./TrainingHeader";
import styles from "./TrainingPage.module.css";

type TrainingPageProps = {
  topic: string;
  instruction: ReactNode;
  children: ReactNode;
  onCheck: () => void;
  isChecking: boolean;
  isChecked: boolean;
  resultText: string;
  explanationComponent?: ReactNode;
};

export function TrainingPage({
  topic,
  instruction,
  children,
  onCheck,
  isChecking,
  isChecked,
  resultText,
  explanationComponent,
}: TrainingPageProps) {
  const router = useRouter();
  const [showInstruction, setShowInstruction] = useState(true);
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
      {showInstruction && (
        <Modal title="Инструкция" onClose={() => setShowInstruction(false)}>
          <div>
            {instruction}
            <button
              className={`${styles.btn} ${styles.primary} ${styles.btnBlock} ${styles.btnCentered}`}
              onClick={() => setShowInstruction(false)}
            >
              ОК
            </button>
          </div>
        </Modal>
      )}

      <TrainingHeader
        topic={topic}
        onShowInstruction={() => setShowInstruction(true)}
      />

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
            <button
              className={`${styles.btn} ${styles.primary} ${styles.btnBlock} ${styles.btnCentered}`}
              onClick={() => setShowResult(false)}
            >
              ОК
            </button>
            {explanationComponent && (
              <button
                className={`${styles.btn} ${styles.primary} ${styles.btnBlock} ${styles.btnCentered}`}
                onClick={toggleExplanation}
              >
                Пояснение
              </button>
            )}
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
