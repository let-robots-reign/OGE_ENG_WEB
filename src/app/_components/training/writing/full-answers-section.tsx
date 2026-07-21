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
                  const border = showCorrect
                    ? "var(--color-ok)"
                    : showWrong
                      ? "var(--color-err)"
                      : selected
                        ? "var(--color-accent)"
                        : "var(--color-line-2)";
                  const bg = showCorrect
                    ? "var(--color-ok-soft)"
                    : showWrong
                      ? "var(--color-err-soft)"
                      : selected
                        ? "var(--color-accent-soft)"
                        : "var(--color-surface)";
                  const dot = showCorrect
                    ? "var(--color-ok)"
                    : showWrong
                      ? "var(--color-err)"
                      : "var(--color-accent)";
                  return (
                    <label
                      key={oi}
                      className="grid items-start gap-3.5"
                      style={{
                        gridTemplateColumns: "auto 1fr",
                        padding: "16px 18px",
                        borderRadius: 12,
                        border: `1.5px solid ${border}`,
                        background: bg,
                        cursor: checked ? "default" : "pointer",
                      }}
                    >
                      <span style={{ paddingTop: 2 }}>
                        <span
                          className="grid place-items-center"
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${selected ? dot : "var(--color-line-2)"}`,
                            background: selected ? dot : "var(--color-surface)",
                          }}
                        >
                          {selected && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#fff",
                              }}
                            />
                          )}
                        </span>
                      </span>
                      <div>
                        <div className="text-ink text-[14.5px] leading-relaxed">
                          {text}
                        </div>
                        {checked && selected && explanations[oi] && (
                          <div
                            className="font-display mt-2.5 pt-2.5 italic"
                            style={{
                              borderTop: `1px dashed ${isQCorrect ? "var(--color-ok)" : "var(--color-err)"}`,
                              fontSize: 12.5,
                              color: isQCorrect
                                ? "var(--color-ok)"
                                : "var(--color-err)",
                            }}
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
