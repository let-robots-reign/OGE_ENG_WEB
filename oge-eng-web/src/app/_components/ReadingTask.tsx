"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { BaseSelect } from "./form/BaseSelect";
import styles from "./ReadingTask.module.css";

type ReadingTaskProps = {
  headings: string[];
  texts: string[];
};

export type ReadingTaskRef = {
  getAnswers: () => (string | null)[];
  showCorrectAnswers: (
    userAnswers: (string | null)[],
    correctAnswers: number[],
  ) => void;
};

export const ReadingTask = forwardRef<ReadingTaskRef, ReadingTaskProps>(
  ({ headings, texts }, ref) => {
    const [answers, setAnswers] = useState<(string | null)[]>(
      Array(texts.length).fill(null),
    );
    const [validity, setValidity] = useState<(boolean | null)[]>(
      Array(texts.length).fill(null),
    );

    useImperativeHandle(ref, () => ({
      getAnswers: () => answers,
      showCorrectAnswers: (userAnswers, correctAnswers) => {
        const newValidity = userAnswers.map(
          (ans, i) => Number(ans) === correctAnswers[i],
        );
        setValidity(newValidity);
      },
    }));

    const handleAnswerChange = (textIndex: number, value: string) => {
      const newAnswers = [...answers];
      newAnswers[textIndex] = value === "" ? null : value;
      setAnswers(newAnswers);

      const newValidity = [...validity];
      newValidity[textIndex] = null;
      setValidity(newValidity);
    };

    const answerOptions = headings.slice(1);

    const getSelectClass = (index: number) => {
      if (validity[index] === true) return styles.valid;
      if (validity[index] === false) return styles.invalid;
      return "";
    };

    return (
      <div className={styles.readingTask}>
        <div className={`${styles.card} ${styles.headingsCard}`}>
          <h3>Заголовки</h3>
          <ol>
            {headings.slice(1).map((heading, i) => (
              <li key={i}>{heading}</li>
            ))}
          </ol>
        </div>

        <div className={`${styles.card} ${styles.textsCard}`}>
          <h3>Тексты</h3>
          {texts.map((text, i) => (
            <div key={i} className={styles.textSection}>
              <BaseSelect
                className={getSelectClass(i)}
                modelValue={answers[i]}
                onUpdate={(value) => handleAnswerChange(i, value)}
                options={answerOptions}
              />
              <p>
                <strong>{String.fromCharCode(65 + i)}.</strong> {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

ReadingTask.displayName = "ReadingTask";
