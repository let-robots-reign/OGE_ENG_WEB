"use client";

import { useState, useImperativeHandle, forwardRef, useMemo } from "react";
import styles from "../../UseOfEnglishCard.module.css";

type GrammarTask1Props = {
  id: number;
  question: string;
  onAnswerChange: (id: number, answers: string[]) => void;
};

export type GrammarTask1Ref = {
  getAnswers: () => string[];
};

export const GrammarTask1 = forwardRef<GrammarTask1Ref, GrammarTask1Props>(
  ({ id, question, onAnswerChange }, ref) => {
    const gapCount = useMemo(
      () => (question.match(/_____________/g) ?? []).length,
      [question],
    );
    const [answers, setAnswers] = useState<string[]>(Array(gapCount).fill(""));

    useImperativeHandle(ref, () => ({
      getAnswers: () => answers,
    }));

    const handleChange = (index: number, value: string) => {
      const newAnswers = [...answers];
      newAnswers[index] = value;
      setAnswers(newAnswers);
      onAnswerChange(id, newAnswers);
    };

    const parts = question.split("_____________");

    return (
      <div className={`${styles.card} ${styles.uoeCard}`}>
        <div className={styles.uoeCard__question}>
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 && (
                <input
                  className={styles.uoeCard__input}
                  style={{ width: "150px", margin: "4px", display: "inline" }}
                  type="text"
                  value={answers[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    );
  },
);

GrammarTask1.displayName = "GrammarTask1";
