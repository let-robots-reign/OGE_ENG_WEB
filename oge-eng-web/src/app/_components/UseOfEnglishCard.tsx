"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import styles from "./UseOfEnglishCard.module.css";

type UseOfEnglishCardProps = {
  id: number;
  question: string;
  origin: string;
};

export type UseOfEnglishCardRef = {
  getAnswerData: () => { id: number; answer: string };
  setIsCorrect: (isCorrect: boolean) => void;
  setQuestion: (question: string) => void;
};

export const UseOfEnglishCard = forwardRef<
  UseOfEnglishCardRef,
  UseOfEnglishCardProps
>(({ id, question, origin }, ref) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(question);

  useImperativeHandle(ref, () => ({
    getAnswerData: () => ({ id, answer: userAnswer }),
    setIsCorrect,
    setQuestion: setCurrentQuestion,
  }));

  const validity =
    isCorrect === null ? "" : isCorrect ? styles.valid : styles.invalid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCorrect(null);
    setUserAnswer(e.target.value.toUpperCase().replace(" ", ""));
  };

  return (
    <div className={`${styles.card} ${styles.uoeCard}`}>
      <div
        className={styles.uoeCard__question}
        dangerouslySetInnerHTML={{ __html: currentQuestion }}
      />
      <input
        className={`${styles.uoeCard__input} ${validity}`}
        type="text"
        placeholder={origin}
        value={userAnswer}
        onChange={handleChange}
      />
    </div>
  );
});

UseOfEnglishCard.displayName = "UseOfEnglishCard";
