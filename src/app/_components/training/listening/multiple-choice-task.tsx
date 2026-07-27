"use client";

import type { AudioTaskQuestion } from "@/server/db/schema";
import { MCQuestion } from "./mc-question";

interface MultipleChoiceTaskProps {
  questions: AudioTaskQuestion[];
  answers: (number | null)[];
  setAnswer: (qIndex: number, optNum: number) => void;
  checked: boolean;
  correctAnswers: number[];
}

export function MultipleChoiceTask({
  questions,
  answers,
  setAnswer,
  checked,
  correctAnswers,
}: MultipleChoiceTaskProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {questions.map((q, i) => (
        <MCQuestion
          key={i}
          idx={i + 1}
          question={q.questionText}
          options={q.options}
          value={answers[i] ?? null}
          onChange={(optNum) => setAnswer(i, optNum)}
          checked={checked}
          correct={correctAnswers[i]}
        />
      ))}
    </div>
  );
}
