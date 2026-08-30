"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import clsx from "clsx";

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
    isCorrect === null
      ? "border-line-2 focus:border-ok"
      : isCorrect
        ? "border-ok"
        : "border-err";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCorrect(null);
    setUserAnswer(e.target.value.toUpperCase().replace(" ", ""));
  };

  return (
    <div className="relative my-6 mx-auto flex w-0 min-w-full flex-col justify-between gap-4 overflow-hidden rounded-[16px] bg-surface p-4 text-ink shadow-[2px_3px_10px_rgba(0,0,0,0.2)]">
      <div
        className="w-0 min-w-full text-[18px]"
        dangerouslySetInnerHTML={{ __html: currentQuestion }}
      />
      <input
        className={clsx(
          "text-ink block w-full resize-none rounded-[3px] border-2 bg-transparent p-2 text-base outline-none transition-colors",
          validity,
        )}
        type="text"
        placeholder={origin}
        value={userAnswer}
        onChange={handleChange}
      />
    </div>
  );
});

UseOfEnglishCard.displayName = "UseOfEnglishCard";
