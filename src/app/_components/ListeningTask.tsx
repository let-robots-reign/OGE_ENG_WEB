"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import clsx from "clsx";

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
    const [correctAnswers, setCorrectAnswers] = useState<number[] | null>(null);

    useImperativeHandle(ref, () => ({
      getAnswers: () => answers,
      showCorrectAnswers: (userAnswers, correct) => {
        const newValidity = userAnswers.map((ans, i) => ans === correct[i]);
        setValidity(newValidity);
        setCorrectAnswers(correct);
      },
    }));

    const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
      const newAnswers = [...answers];
      newAnswers[questionIndex] = optionIndex + 1;
      setAnswers(newAnswers);

      setValidity(Array(questions.length).fill(null));
      setCorrectAnswers(null);
    };

    const getLabelClass = (qIndex: number, oIndex: number) => {
      if (validity[qIndex] === null || correctAnswers === null) return "";

      const userAnswer = answers[qIndex];
      const correctAnswer = correctAnswers[qIndex];
      const currentOption = oIndex + 1;

      if (userAnswer === currentOption) {
        return validity[qIndex] ? "text-ok font-bold" : "text-err font-bold";
      }

      if (correctAnswer === currentOption && !validity[qIndex]) {
        return "text-ok font-bold";
      }

      return "";
    };

    return (
      <div className="flex flex-col gap-5">
        <audio controls src={audioUrl} className="w-full">
          Your browser does not support the audio element.
        </audio>

        <div className="flex flex-col gap-5">
          {questions.map((q, i) => (
            <div key={i} className="rounded-[16px] bg-surface p-6 text-ink">
              <p className="mb-2.5 text-[18px] font-bold leading-[20px]">
                {q.question}
              </p>
              <div className="flex flex-col gap-2.5 rounded-[5px] p-2.5">
                {q.options.map((option, j) => (
                  <label
                    key={j}
                    className={clsx(
                      "flex cursor-pointer items-center gap-2.5",
                      getLabelClass(i, j),
                    )}
                  >
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={j + 1}
                      checked={answers[i] === j + 1}
                      onChange={() => handleAnswerChange(i, j)}
                      disabled={validity[i] !== null}
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
