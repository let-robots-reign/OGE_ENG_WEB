"use client";

import { SectionHead, SectionCard } from "./section-head";

export interface ClozeTask {
  id: number;
  segments: string[];
  options: string[];
}

interface ClozeSectionProps {
  tasks: ClozeTask[];
  values: string[][];
  onChange: (taskIdx: number, gapIdx: number, value: string) => void;
  checked: boolean;
  correctness: boolean[][];
}

export function ClozeSection({
  tasks,
  values,
  onChange,
  checked,
  correctness,
}: ClozeSectionProps) {
  return (
    <SectionCard>
      <SectionHead
        index="04"
        en="Cloze · use of linkers"
        title="Дополните текст"
        subtitle="Используйте связки из задания выше. Каждая связка несёт смысл — причина, перечисление, добавление."
      />

      <div className="bg-surface-2 text-ink rounded-lg px-8 py-[26px] text-[15.5px] leading-[2.2]">
        {tasks.map((task, ti) => (
          <p key={task.id} className={ti === 0 ? "m-0" : "mt-2.5"}>
            {task.segments.map((text, gi) => {
              const v = values[ti]?.[gi] ?? "";
              const ok = checked && correctness[ti]?.[gi];
              const wrong = checked && !!v && !correctness[ti]?.[gi];
              return (
                <span key={gi}>
                  <select
                    value={v}
                    disabled={checked}
                    onChange={(e) => onChange(ti, gi, e.target.value)}
                    className={`mx-0.5 appearance-none rounded-xs border-[1.5px] bg-[right_8px_center] bg-no-repeat py-1.5 pr-7 pl-3 align-middle font-mono text-[14px] font-medium ${
                      checked ? "cursor-default" : "cursor-pointer"
                    } ${
                      checked
                        ? ok
                          ? "border-ok bg-ok-soft text-ok"
                          : wrong
                            ? "border-err bg-err-soft text-err"
                            : "border-line-2 bg-surface text-ink-3"
                        : "border-line-2 bg-surface text-ink"
                    }`}
                    style={{
                      // TODO(dark): chevron stroke is hardcoded #6b7493 (ink-3) inside a data-URI; CSS vars can't be embedded here. Mid-grey stays legible on both themes, but won't flip.
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7493' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>\")",
                    }}
                  >
                    <option value="">—</option>
                    {task.options.map((o, oi) => (
                      <option key={oi} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <span>{text}</span>
                </span>
              );
            })}
          </p>
        ))}
      </div>
    </SectionCard>
  );
}
