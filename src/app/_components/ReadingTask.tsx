"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { BaseSelect } from "./form/BaseSelect";

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
          (ans, i) => parseInt(ans ?? "") === correctAnswers[i],
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
      if (validity[index]) return "!border-ok";
      if (validity[index] === false) return "!border-err !text-err";
      return "";
    };

    return (
      <div className="flex flex-col">
        <div className="relative mb-4 overflow-hidden rounded-[16px] bg-surface p-6 text-ink shadow-[2px_3px_10px_rgba(0,0,0,0.2)]">
          <h3 className="text-2xl font-bold">Заголовки</h3>
          <ol className="mt-4 list-decimal pl-4">
            {headings.slice(1).map((heading, i) => (
              <li key={i}>{heading}</li>
            ))}
          </ol>
        </div>

        <div className="relative mb-4 flex flex-col gap-6 overflow-hidden rounded-[16px] bg-surface p-6 text-ink shadow-[2px_3px_10px_rgba(0,0,0,0.2)]">
          <h3 className="text-2xl font-bold">Тексты</h3>
          {texts.map((text, i) => (
            <div
              key={i}
              className="flex flex-col items-start gap-4 text-[1.1rem] leading-[1.6]"
            >
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
