"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { part1Questions, part2Questions } from "./data";
import {
  GrammarTask1,
  type GrammarTask1Ref,
} from "@/app/_components/diagnostics/initial/GrammarTask1";
import {
  GrammarTask2,
  type GrammarTask2Ref,
} from "@/app/_components/diagnostics/initial/GrammarTask2";
import styles from "@/app/_components/TrainingPage.module.css";
import { TrainingHeader } from "@/app/_components/TrainingHeader";

interface Answers {
  part1: Record<number, string[]>;
  part2: Record<number, string>;
}

export default function GrammarDiagnosticPage() {
  const router = useRouter();
  const [currentPart, setCurrentPart] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    part1: {},
    part2: {},
  });

  const task1Refs = useRef<Record<number, GrammarTask1Ref>>({});
  const task2Refs = useRef<Record<number, GrammarTask2Ref>>({});

  const handlePart1AnswerChange = (id: number, answer: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      part1: { ...prev.part1, [id]: answer },
    }));
  };

  const handlePart2AnswerChange = (id: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      part2: { ...prev.part2, [id]: answer },
    }));
  };

  const handleSubmit = () => {
    // Здесь будет логика отправки ответов на сервер
    console.log("Submitting answers:", answers);
    router.push("/");
  };

  const handleNextPart = () => {
    setCurrentPart(2);
    window.scrollTo(0, 0);
  };

  const handlePrevPart = () => {
    setCurrentPart(1);
    window.scrollTo(0, 0);
  };

  return (
    <main className={styles.trainingPage}>
      <TrainingHeader topic="Грамматическая диагностика" />

      {currentPart === 1 && (
        <div>
          <h2 className={styles.sectionTitle}>
            Часть 1<br />
            <i>
              Complete the sentences with the correct form of the word in
              brackets
            </i>
          </h2>

          {part1Questions.map((q) => (
            <GrammarTask1
              key={q.id}
              ref={(el) => {
                if (el) task1Refs.current[q.id] = el;
              }}
              id={q.id}
              question={q.text}
              onAnswerChange={handlePart1AnswerChange}
            />
          ))}
        </div>
      )}

      {currentPart === 2 && (
        <div>
          <h2 className={styles.sectionTitle}>
            Часть 2: Переведите предложения
            <br />
            <i>
              Translate the following sentences into English. Pay attention to
              the grammar topics <b>in bold</b>.
            </i>
          </h2>
          {part2Questions.map((q) => (
            <GrammarTask2
              key={q.id}
              ref={(el) => {
                if (el) task2Refs.current[q.id] = el;
              }}
              id={q.id}
              question={q.text}
              onAnswerChange={handlePart2AnswerChange}
            />
          ))}
        </div>
      )}

      <div className={styles.buttonsGroup}>
        {currentPart === 1 && (
          <>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={handleNextPart}
            >
              Далее
            </button>
            <button
              className={`${styles.btn} ${styles.secondary}`}
              onClick={() => router.push("/")}
            >
              Выход
            </button>
          </>
        )}
        {currentPart === 2 && (
          <>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={handleSubmit}
            >
              Отправить
            </button>
            <button
              className={`${styles.btn} ${styles.secondary}`}
              onClick={handlePrevPart}
            >
              Назад
            </button>
          </>
        )}
      </div>
    </main>
  );
}
