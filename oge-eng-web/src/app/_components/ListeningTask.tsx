"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import styles from "./ListeningTask.module.css";

type ListeningTaskProps = {
  audioUrl: string;
  questions: {
    question: string | undefined;
    options: string[];
  }[];
};

export type ListeningTaskRef = {
  getAnswers: () => (number | null)[];
  showCorrectAnswers: (
    userAnswers: (number | null)[],
    correctAnswers: number[],
  ) => void;
};

export const ListeningTask = forwardRef<ListeningTaskRef, ListeningTaskProps>(
  ({ audioUrl, questions }, ref) => {
    const [answers, setAnswers] = useState<(number | null)[]>(
      Array(questions.length).fill(null),
    );
    const [validity, setValidity] = useState<(boolean | null)[]>(
      Array(questions.length).fill(null),
    );

    useImperativeHandle(ref, () => ({
      getAnswers: () => answers,
      showCorrectAnswers: (userAnswers, correctAnswers) => {
        const newValidity = userAnswers.map(
          (ans, i) => ans === correctAnswers[i],
        );
        setValidity(newValidity);
      },
    }));

    const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
      const newAnswers = [...answers];
      newAnswers[questionIndex] = optionIndex + 1;
      setAnswers(newAnswers);

      const newValidity = [...validity];
      newValidity[questionIndex] = null;
      setValidity(newValidity);
    };

    const getRadioGroupClass = (index: number) => {
      if (validity[index]) return styles.valid;
      if (validity[index] === false) return styles.invalid;
      return "";
    };

    return (
      <div className={styles.listeningTask}>
        <audio controls src={audioUrl} className={styles.audioPlayer}>
          Your browser does not support the audio element.
        </audio>

        <div className={styles.questions}>
          {questions.map((q, i) => (
            <div key={i} className={styles.questionBlock}>
              <p className={styles.questionText}>{q.question}</p>
              <div
                className={`${styles.radioGroup} ${getRadioGroupClass(i)}`}
              >
                {q.options.map((option, j) => (
                  <label key={j} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={j + 1}
                      checked={answers[i] === j + 1}
                      onChange={() => handleAnswerChange(i, j)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

ListeningTask.displayName = "ListeningTask";
