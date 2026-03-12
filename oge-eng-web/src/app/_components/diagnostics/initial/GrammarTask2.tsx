"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import styles from "../../UseOfEnglishCard.module.css";

type GrammarTask2Props = {
  id: number;
  question: React.ReactNode;
  onAnswerChange: (id: number, answer: string) => void;
};

export type GrammarTask2Ref = {
  getAnswer: () => string;
};

export const GrammarTask2 = forwardRef<GrammarTask2Ref, GrammarTask2Props>(
  ({ id, question, onAnswerChange }, ref) => {
    const [answer, setAnswer] = useState("");

    useImperativeHandle(ref, () => ({
      getAnswer: () => answer,
    }));

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAnswer(e.target.value);
      onAnswerChange(id, e.target.value);
    };

    return (
      <div className={`${styles.card} ${styles.uoeCard}`}>
        {question}
        <textarea
          className={styles.uoeCard__input}
          style={{ width: "100%", minHeight: "100px", resize: "vertical" }}
          value={answer}
          onChange={handleChange}
          placeholder="Введите ваш перевод..."
        />
      </div>
    );
  },
);

GrammarTask2.displayName = "GrammarTask2";
