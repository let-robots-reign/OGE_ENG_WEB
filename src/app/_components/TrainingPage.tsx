"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { TrainingHeader } from "./TrainingHeader";
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

      <div className="mt-4 flex flex-col items-center justify-center gap-4">
        <button
          className="h-[50px] w-full cursor-pointer rounded-lg bg-ok text-[18px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          disabled={isChecking}
          hidden={isChecked}
          onClick={handleCheck}
        >
          Проверить
        </button>
        <button
          className="h-[50px] w-full cursor-pointer rounded-lg bg-surface-3 text-[18px] font-bold uppercase tracking-wider text-ink-2 transition-opacity hover:opacity-80"
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
                className="my-3 mx-auto block w-full cursor-pointer rounded-full bg-ok px-6 py-2 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
                onClick={toggleExplanation}
              >
                Пояснение
              </button>
            )}
            <button
              className="my-3 mx-auto block w-full cursor-pointer rounded-full bg-ok px-6 py-2 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
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
            className="my-3 mx-auto block w-full cursor-pointer rounded-full bg-ok px-6 py-2 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
            onClick={toggleExplanation}
          >
            Назад
          </button>
        </Modal>
      )}
    </>
  );
}
