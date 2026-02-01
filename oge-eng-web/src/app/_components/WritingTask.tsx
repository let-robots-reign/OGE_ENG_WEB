"use client";

import { useState, useImperativeHandle, forwardRef, Fragment } from "react";
import { BaseInput } from "./form/BaseInput";
import { BaseSelect } from "./form/BaseSelect";
import { BaseRadioGroup } from "./form/BaseRadioGroup";
import styles from "./WritingTask.module.css";
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
    const letterParts = structureTask.task.split("\n");

    // State for answers
    const [letterPartsAnswers, setLetterPartsAnswers] = useState<number[]>(
      Array(letterParts.length).fill(0),
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
    >(Array(letterParts.length).fill(null));
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
      getAnswers: () => ({
        structure: { id: structureTask.id, answer: letterPartsAnswers },
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
      }),
      showCorrectness: (correctness) => {
        setLetterPartsCorrectness(correctness.structureCorrectness);
        setClichesCorrectness(correctness.clichesCorrectness);
        setLinkersCorrectness(correctness.linkersCorrectness);
        setFullRepliesCorrectness(correctness.fullAnswersCorrectness);
      },
    }));

    const getClassForUserInput = (correctness?: boolean | null) => {
      if (correctness) return styles.valid;
      if (correctness === false) return styles.invalid;
      return "";
    };

    const disableControls = isChecking || isChecked;

    return (
      <div className={styles.writingTask}>
        <div className={styles.writingTaskSection}>
          <p className={styles.writingTaskTitle}>Структура письма</p>
          <p className={styles.writingTaskHint}>
            Поставьте предложения в правильном порядке, чтобы получилось письмо.
          </p>
          {letterParts.map((part, index) => (
            <p key={index}>
              {index + 1}) {part}
            </p>
          ))}
          <div className={styles.letterAnswers}>
            {letterParts.map((_, index) => (
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
          <p className={styles.writingTaskHint}>
            Впишите номера предложений в нужном порядке
          </p>
        </div>

        <div className={styles.writingTaskSection}>
          <p className={styles.writingTaskTitle}>Фразы-клише</p>
          <p className={styles.writingTaskHint}>Расставьте слова по порядку</p>
          {cliches.map((cliche, clicheIndex) => (
            <div key={cliche.id} className={styles.answerItem}>
              <span>{clicheIndex + 1})</span>
              <div className={styles.clichesList}>
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
                      styles.answerSelect,
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

        <div className={styles.writingTaskSection}>
          <p className={styles.writingTaskTitle}>Слова-связки</p>
          <p className={styles.writingTaskHint}>
            Совместите слова-связки с их русскими эквивалентами
          </p>
          {linkers[0]!.task.split("\n").map((linker, linkerIndex) => (
            <div key={linkerIndex} className={styles.answerItem}>
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
                  styles.answerSelect,
                  getClassForUserInput(
                    linkersCorrectness[0]?.[linkerIndex] ?? null,
                  ),
                )}
                disabled={disableControls}
              />
            </div>
          ))}
          <p className={styles.writingTaskHint}>
            Дополните текст, используя слова-связки
          </p>
          {linkers.slice(1).map((task, index) => (
            <div key={task.id} className={styles.answerItem}>
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
                      styles.answerSelect,
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

        <div className={styles.writingTaskSection}>
          <p className={styles.writingTaskTitle}>Полные ответы</p>
          {fullAnswers.map((fullAnswer, index) => (
            <div className={styles.writingTaskFullReplies} key={fullAnswer.id}>
              <p className={styles.writingTaskHint}>
                Выберите лучший ответ на вопрос:
              </p>
              <h4 className={styles.writingTaskFullRepliesQuestion}>
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
                    styles.writingTaskFullRepliesHint,
                    getClassForUserInput(fullRepliesCorrectness[index]),
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
