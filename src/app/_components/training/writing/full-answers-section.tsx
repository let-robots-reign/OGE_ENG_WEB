"use client";

import { SectionHead, SectionCard } from "./section-head";

export interface FullAnswerQuestion {
  id: number;
  question: string;
  options: string[];
}

interface FullAnswersSectionProps {
  questions: FullAnswerQuestion[];
  picks: string[];
  onPick: (qIdx: number, text: string) => void;
  checked: boolean;
  correctness: boolean[];
}

export function FullAnswersSection({
  questions,
  picks,
  onPick,
  checked,
  correctness,
}: FullAnswersSectionProps) {
  return (
    <SectionCard>
      <SectionHead
        index="05"
        en="Best answer"
        title="Полные ответы"
        subtitle="В каждом случае выберите лучший вариант ответа. Полный ответ всегда включает причину и личное отношение."
      />

      <div className="flex flex-col gap-7">
        {questions.map((q, qi) => {
          const answers = q.options.slice(0, 3);
          const explanations = q.options.slice(3);
          const isQCorrect = correctness[qi];
          return (
            <div key={q.id}>
              <div className="mb-3 flex items-center gap-3">
                <div className="text-ink-3 font-mono text-[11px] tracking-[0.1em] uppercase">
                  вопрос {qi + 1}
                </div>
                <div className="bg-line h-px flex-1" />
              </div>
              <div className="font-display mb-3.5 text-[22px] leading-snug tracking-[-0.02em]">
                {q.question}
              </div>

              <div className="flex flex-col gap-2">
                {answers.map((text, oi) => {
                  const selected = picks[qi] === text;
                  const showCorrect = checked && selected && isQCorrect;
                  const showWrong = checked && selected && !isQCorrect;
                  return (
                    <label
                      key={oi}
                      className={`grid grid-cols-[auto_1fr] items-start gap-3.5 rounded-sm border-[1.5px] px-[18px] py-4 ${
                        checked ? "cursor-default" : "cursor-pointer"
                      } ${
                        showCorrect
                          ? "border-ok bg-ok-soft"
                          : showWrong
                            ? "border-err bg-err-soft"
                            : selected
                              ? "border-accent bg-accent-soft"
                              : "border-line-2 bg-surface"
                      }`}
                    >
                      <span className="pt-0.5">
                        <span
                          className={`grid size-[18px] place-items-center rounded-full border-2 ${
                            selected
                              ? showCorrect
                                ? "border-ok bg-ok"
                                : showWrong
                                  ? "border-err bg-err"
                                  : "border-accent bg-accent"
                              : "border-line-2 bg-surface"
                          }`}
                        >
                          {selected && (
                            <span className="size-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </span>
                      <div>
                        <div className="text-ink text-[14.5px] leading-relaxed">
                          {text}
                        </div>
                        {checked && selected && explanations[oi] && (
                          <div
                            className={`font-display mt-2.5 border-t border-dashed pt-2.5 text-[12.5px] italic ${
                              isQCorrect
                                ? "border-ok text-ok"
                                : "border-err text-err"
                            }`}
                          >
                            {isQCorrect ? "✓ " : "✕ "}
                            {explanations[oi]}
                          </div>
                        )}
                      </div>
                      {!checked && (
                        <input
                          type="radio"
                          name={`fa-${q.id}`}
                          checked={selected}
                          onChange={() => onPick(qi, text)}
                          className="hidden"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
