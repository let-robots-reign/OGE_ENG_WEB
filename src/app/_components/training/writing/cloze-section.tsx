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

      <div
        className="bg-surface-2 text-ink rounded-lg"
        style={{ padding: "26px 32px", fontSize: 15.5, lineHeight: 2.2 }}
      >
        {tasks.map((task, ti) => (
          <p key={task.id} style={{ margin: ti === 0 ? 0 : "10px 0 0" }}>
            {task.segments.map((text, gi) => {
              const v = values[ti]?.[gi] ?? "";
              const ok = checked && correctness[ti]?.[gi];
              const empty = checked && !v;
              const wrong = checked && !!v && !correctness[ti]?.[gi];
              const border = checked
                ? ok
                  ? "var(--color-ok)"
                  : empty
                    ? "var(--color-line-2)"
                    : "var(--color-err)"
                : "var(--color-line-2)";
              const bg = checked
                ? ok
                  ? "var(--color-ok-soft)"
                  : wrong
                    ? "var(--color-err-soft)"
                    : "var(--color-surface)"
                : "var(--color-surface)";
              const color = checked
                ? ok
                  ? "var(--color-ok)"
                  : wrong
                    ? "var(--color-err)"
                    : "var(--color-ink-3)"
                : "var(--color-ink)";
              return (
                <span key={gi}>
                  <select
                    value={v}
                    disabled={checked}
                    onChange={(e) => onChange(ti, gi, e.target.value)}
                    className="align-middle font-mono"
                    style={{
                      margin: "0 2px",
                      padding: "6px 28px 6px 12px",
                      fontSize: 14,
                      fontWeight: 500,
                      border: `1.5px solid ${border}`,
                      borderRadius: 8,
                      backgroundColor: bg,
                      color,
                      appearance: "none",
                      // TODO(dark): chevron stroke is hardcoded #6b7493 (ink-3) inside a data-URI; CSS vars can't be embedded here. Mid-grey stays legible on both themes, but won't flip.
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7493' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                      cursor: checked ? "default" : "pointer",
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
