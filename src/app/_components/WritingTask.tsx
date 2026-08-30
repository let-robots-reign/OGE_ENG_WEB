"use client";

import { useState, useImperativeHandle, forwardRef, Fragment } from "react";
import { BaseInput } from "./form/BaseInput";
import { BaseSelect } from "./form/BaseSelect";
import { BaseRadioGroup } from "./form/BaseRadioGroup";
import { shuffle } from "@/app/_utils/shuffle";
import clsx from "clsx";

interface WritingTaskBase {
  id: number;
  task: string;
  topic: string;
}
interface WritingTaskWithOptions extends WritingTaskBase {
  options: string[];
}
interface WritingTaskFullAnswers extends WritingTaskWithOptions {
  question: string;
}

type WritingTaskData = {
  structure: WritingTaskBase[];
  cliches: WritingTaskWithOptions[];
  linkers: WritingTaskWithOptions[];
  fullAnswers: WritingTaskFullAnswers[];
};

type WritingTaskProps = {
  taskData: WritingTaskData;
  isChecking: boolean;
  isChecked: boolean;
};

export type WritingTaskRef = {
  getAnswers: () => {
    structure: { id: number; answer: number[] };
    cliches: { id: number; answer: string[] }[];
    linkers: { id: number; answer: string[] }[];
    fullAnswers: { id: number; answer: string }[];
  };
  showCorrectness: (correctness: {
    structureCorrectness: boolean[];
    clichesCorrectness: boolean[][];
    linkersCorrectness: boolean[][];
    fullAnswersCorrectness: boolean[];
  }) => void;
};

export const WritingTask = forwardRef<WritingTaskRef, WritingTaskProps>(
  ({ taskData, isChecking, isChecked }, ref) => {
    const { structure, cliches, linkers, fullAnswers } = taskData;
    const structureTask = structure[0]!; // Assuming there is always one structure task

    const [shuffledLetterParts] = useState(() => {
      const originalLetterParts = structureTask.task
        .split("\n")
        .map((part, index) => ({ part, originalIndex: index + 1 }));
      return shuffle(originalLetterParts);
    });

    // State for answers
    const [letterPartsAnswers, setLetterPartsAnswers] = useState<number[]>(
      Array(shuffledLetterParts.length).fill(0),
    );
    const [clichesAnswers, setClichesAnswers] = useState<string[][]>(
      cliches.map((c) => c.task.split(" ")),
    );
    const [linkersAnswers, setLinkersAnswers] = useState<string[][]>(
      linkers.map((l) => Array<string>(l.task.split("\n").length).fill("")),
    );
    const [fullRepliesAnswers, setFullRepliesAnswers] = useState<string[]>(
      Array(fullAnswers.length).fill(""),
    );

    // State for correctness indicators
    const [letterPartsCorrectness, setLetterPartsCorrectness] = useState<
      (boolean | null)[]
    >(Array(shuffledLetterParts.length).fill(null));
    const [clichesCorrectness, setClichesCorrectness] = useState<
      (boolean[] | null)[]
    >(cliches.map(() => null));
    const [linkersCorrectness, setLinkersCorrectness] = useState<
      (boolean[] | null)[]
    >(linkers.map(() => null));
    const [fullRepliesCorrectness, setFullRepliesCorrectness] = useState<
      (boolean | null)[]
    >(Array(fullAnswers.length).fill(null));

    useImperativeHandle(ref, () => ({
      getAnswers: () => {
        const structureAnswer = letterPartsAnswers.map((answer) => {
          if (answer > 0 && answer <= shuffledLetterParts.length) {
            return shuffledLetterParts[answer - 1]!.originalIndex;
          }
          return 0;
        });
        return {
          structure: { id: structureTask.id, answer: structureAnswer },
          cliches: cliches.map((c, i) => ({
            id: c.id,
            answer: clichesAnswers[i]!,
          })),
          linkers: linkers.map((l, i) => ({
            id: l.id,
            answer: linkersAnswers[i]!,
          })),
          fullAnswers: fullAnswers.map((fa, i) => ({
            id: fa.id,
            answer: fullRepliesAnswers[i]!,
          })),
        };
      },
      showCorrectness: (correctness) => {
        setLetterPartsCorrectness(correctness.structureCorrectness);
        setClichesCorrectness(correctness.clichesCorrectness);
        setLinkersCorrectness(correctness.linkersCorrectness);
        setFullRepliesCorrectness(correctness.fullAnswersCorrectness);
      },
    }));

    const getClassForUserInput = (correctness?: boolean | null) => {
      if (correctness) return "!border-ok";
      if (correctness === false) return "!border-err";
      return "";
    };

    const getHintClassForUserInput = (correctness?: boolean | null) => {
      if (correctness) return "text-ok ml-5 italic";
      if (correctness === false) return "text-err ml-5 italic";
      return "";
    };

    const disableControls = isChecking || isChecked;

    return (
      <div className="flex flex-col gap-5 rounded-lg bg-surface p-6 text-[18px] text-ink shadow-[2px_3px_10px_rgba(0,0,0,0.2)]">
        <div className="border-b border-line pb-5">
          <p className="mb-2 text-center text-[1.7rem] font-bold text-ink">
            Структура письма
          </p>
          <p className="mb-5 text-center italic text-ink-3">
            Поставьте предложения в правильном порядке, чтобы получилось письмо.
          </p>
          {shuffledLetterParts.map((item, index) => (
            <p key={index}>
              {index + 1}) {item.part}
            </p>
          ))}
          <div className="mx-auto mt-4 grid max-w-[70%] grid-cols-6 gap-1">
            {shuffledLetterParts.map((_, index) => (
              <BaseInput
                key={index}
                placeholder={(index + 1).toString()}
                modelValue={
                  letterPartsAnswers[index]
                    ? String(letterPartsAnswers[index])
                    : ""
                }
                onUpdate={(value) => {
                  const newAnswers = [...letterPartsAnswers];
                  newAnswers[index] = Number(value);
                  setLetterPartsAnswers(newAnswers);
                }}
                className={getClassForUserInput(letterPartsCorrectness[index])}
                disabled={disableControls}
              />
            ))}
          </div>
          <p className="mb-5 text-center italic text-ink-3">
            Впишите номера предложений в нужном порядке
          </p>
        </div>

        <div className="border-b border-line pb-5">
          <p className="mb-2 text-center text-[1.7rem] font-bold text-ink">
            Фразы-клише
          </p>
          <p className="mb-5 text-center italic text-ink-3">
            Расставьте слова по порядку
          </p>
          {cliches.map((cliche, clicheIndex) => (
            <div
              key={cliche.id}
              className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <span>{clicheIndex + 1})</span>
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {cliche.task.split(" ").map((_, wordIndex) => (
                  <BaseSelect
                    key={wordIndex}
                    modelValue={clichesAnswers[clicheIndex]?.[wordIndex]}
                    onUpdate={(value) => {
                      const newAnswers = [...clichesAnswers];
                      newAnswers[clicheIndex]![wordIndex] = value ?? "";
                      setClichesAnswers(newAnswers);
                    }}
                    options={cliche.options}
                    className={clsx(
                      "w-fit",
                      getClassForUserInput(
                        clichesCorrectness[clicheIndex]?.[wordIndex] ?? null,
                      ),
                    )}
                    disabled={disableControls}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-line pb-5">
          <p className="mb-2 text-center text-[1.7rem] font-bold text-ink">
            Слова-связки
          </p>
          <p className="mb-5 text-center italic text-ink-3">
            Совместите слова-связки с их русскими эквивалентами
          </p>
          {linkers[0]!.task.split("\n").map((linker, linkerIndex) => (
            <div
              key={linkerIndex}
              className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <span>
                {linkerIndex + 1}) {linker} —
              </span>
              <BaseSelect
                modelValue={linkersAnswers[0]?.[linkerIndex]}
                onUpdate={(value) => {
                  const newAnswers = [...linkersAnswers];
                  newAnswers[0]![linkerIndex] = value ?? "";
                  setLinkersAnswers(newAnswers);
                }}
                options={linkers[0]!.options}
                className={clsx(
                  "w-fit",
                  getClassForUserInput(
                    linkersCorrectness[0]?.[linkerIndex] ?? null,
                  ),
                )}
                disabled={disableControls}
              />
            </div>
          ))}
          <p className="mb-5 text-center italic text-ink-3">
            Дополните текст, используя слова-связки
          </p>
          {linkers.slice(1).map((task, index) => (
            <div
              key={task.id}
              className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              <span>{index + 1})</span>
              {task.task.split("\n").map((text, textIndex) => (
                <Fragment key={text}>
                  <BaseSelect
                    modelValue={linkersAnswers[index + 1]?.[textIndex]}
                    onUpdate={(value) => {
                      const newAnswers = [...linkersAnswers];
                      newAnswers[index + 1]![textIndex] = value ?? "";
                      setLinkersAnswers(newAnswers);
                    }}
                    options={task.options}
                    className={clsx(
                      "w-fit",
                      getClassForUserInput(
                        linkersCorrectness[index + 1]?.[textIndex] ?? null,
                      ),
                    )}
                    disabled={disableControls}
                  />
                  <span>{text}</span>
                </Fragment>
              ))}
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-center text-[1.7rem] font-bold text-ink">
            Полные ответы
          </p>
          {fullAnswers.map((fullAnswer, index) => (
            <div className="mb-5" key={fullAnswer.id}>
              <p className="mb-5 text-center italic text-ink-3">
                Выберите лучший ответ на вопрос:
              </p>
              <h4 className="mb-2 font-bold text-ink">
                {fullAnswer.question}
              </h4>
              <BaseRadioGroup
                name={`fullRepliesRadio-${index}`}
                options={fullAnswer.options.slice(0, 3)}
                modelValue={fullRepliesAnswers[index] ?? ""}
                onUpdate={(value) => {
                  const newAnswers = [...fullRepliesAnswers];
                  newAnswers[index] = String(value);
                  setFullRepliesAnswers(newAnswers);
                }}
                vertical
                disabled={disableControls}
                isChosenCorrect={fullRepliesCorrectness[index]}
              />
              {isChecked && (
                <p
                  className={clsx(
                    "mt-2 italic",
                    getHintClassForUserInput(fullRepliesCorrectness[index]),
                  )}
                >
                  {
                    fullAnswer.options.slice(3)[
                      fullAnswer.options.indexOf(fullRepliesAnswers[index]!)
                    ]
                  }
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

WritingTask.displayName = "WritingTask";
