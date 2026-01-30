"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { TrainingHeader } from "./TrainingHeader";
import styles from "./TrainingPage.module.css";
import clsx from "clsx";

type TrainingPageProps = {
  topic: string;
  instruction: ReactNode;
  children: ReactNode;
  onCheck: () => void;
  isChecking: boolean;
  isChecked: boolean;
  resultText: string;
};

export function TrainingPage({
  topic,
  instruction,
  children,
  onCheck,
  isChecking,
  isChecked,
  resultText,
}: TrainingPageProps) {
  const router = useRouter();
  const [showInstruction, setShowInstruction] = useState(true);
  const [showResult, setShowResult] = useState(false);

  return (
    <>
      {showInstruction && (
        <Modal title="Инструкция" onClose={() => setShowInstruction(false)}>
          <div>
            {instruction}
            <button
              className={clsx(
                styles.btn,
                styles.btnBlock,
                styles.btnCentered,
                styles.primary,
              )}
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
          className={clsx(styles.btn, styles.primary)}
          disabled={isChecking}
          hidden={isChecked}
          onClick={() => {
            onCheck();
            setShowResult(true);
          }}
        >
          Проверить
        </button>
        <button
          className={clsx(styles.btn, styles.secondary)}
          onClick={() => router.back()}
        >
          Выход
        </button>
      </div>

      {isChecked && showResult && (
        <Modal title={resultText} onClose={() => setShowResult(false)}>
          <div>
            <p>Вы можете посмотреть свои ошибки и правильные ответы</p>
            <button
              className={clsx(
                styles.btn,
                styles.btnBlock,
                styles.btnCentered,
                styles.primary,
              )}
              onClick={() => setShowResult(false)}
            >
              ОК
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
