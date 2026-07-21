"use client";

import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SectionHead, SectionCard } from "./section-head";

interface LinkersSectionProps {
  enLabels: string[];
  ruBank: string[];
  /** enIndex → chipIndex (chip index into ruBank, unique per chip even if RU repeats) */
  assign: Record<number, number>;
  onAssign: (enIndex: number, chipIndex: number) => void;
  onClear: (enIndex: number) => void;
  checked: boolean;
  correctness: boolean[];
}

function BankChip({
  chipIndex,
  ru,
  used,
  disabled,
}: {
  chipIndex: number;
  ru: string;
  used: boolean;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `chip:${chipIndex}`,
      disabled,
    });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        padding: "8px 14px",
        borderRadius: 999,
        background: used ? "transparent" : "var(--color-surface)",
        border: `1px ${used ? "dashed" : "solid"} var(--color-line-2)`,
        color: used ? "var(--color-ink-4)" : "var(--color-ink)",
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "default" : "grab",
        textDecoration: used ? "line-through" : "none",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {ru}
    </div>
  );
}

function Slot({
  enIndex,
  en,
  value,
  onClear,
  checked,
  correctness,
}: {
  enIndex: number;
  en: string;
  value: string | undefined;
  onClear: (enIndex: number) => void;
  checked: boolean;
  correctness: boolean | undefined;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${enIndex}`,
    disabled: checked,
  });

  const correct = checked && !!value && correctness;
  const wrong = checked && !!value && !correctness;
  const empty = checked && !value;

  const border = checked
    ? correct
      ? "var(--color-ok)"
      : empty
        ? "var(--color-line-2)"
        : "var(--color-err)"
    : isOver
      ? "var(--color-accent)"
      : "var(--color-line-2)";
  const bg =
    isOver && !checked
      ? "var(--color-accent-soft)"
      : correct
        ? "var(--color-ok-soft)"
        : wrong
          ? "var(--color-err-soft)"
          : "var(--color-surface)";

  return (
    <div
      ref={setNodeRef}
      className="grid items-center"
      style={{
        gridTemplateColumns: "96px 1fr",
        gap: 10,
        padding: "10px 12px",
        minHeight: 50,
        border: `1.5px solid ${border}`,
        borderRadius: 10,
        background: bg,
      }}
    >
      <div
        className="text-ink-2 truncate font-mono font-medium"
        style={{ fontSize: 13 }}
      >
        {en}
      </div>
      <div
        className="flex flex-wrap items-center gap-1.5"
        style={{ minWidth: 0, minHeight: 28 }}
      >
        {value ? (
          <>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: checked ? "#fff" : "var(--color-on-ink)",
                background: checked
                  ? correct
                    ? "var(--color-ok)"
                    : "var(--color-err)"
                  : "var(--color-ink)",
              }}
            >
              {value}
            </span>
            {!checked && (
              <button
                type="button"
                onClick={() => onClear(enIndex)}
                className="text-ink-4 grid place-items-center"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "none",
                  background: "transparent",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <span
            className="font-display italic"
            style={{ fontSize: 12, color: "var(--color-ink-4)" }}
          >
            перетащите перевод
          </span>
        )}
      </div>
    </div>
  );
}

export function LinkersSection({
  enLabels,
  ruBank,
  assign,
  onAssign,
  onClear,
  checked,
  correctness,
}: LinkersSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const usedChips = new Set(Object.values(assign));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (!activeId.startsWith("chip:") || !overId.startsWith("slot:")) return;
    const chipIndex = Number(activeId.slice(5));
    const enIndex = Number(overId.slice(5));
    onAssign(enIndex, chipIndex);
  };

  return (
    <SectionCard>
      <SectionHead
        index="03"
        en="Linking words"
        title="Слова-связки"
        subtitle="Перетащите русский перевод к каждому английскому слову. Их 24 — связки нужны и в письме, и в устной речи."
      />
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div
          className="mb-6 rounded-lg"
          style={{
            padding: "20px 22px",
            background:
              "linear-gradient(180deg, var(--color-surface-2) 0%, var(--color-surface) 100%)",
            border: "1px dashed var(--color-line-2)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-ink-3 font-mono text-[11px] tracking-[0.1em] uppercase">
              банк переводов
            </div>
            <div className="text-ink-3 text-[12px]">
              <strong className="text-ink font-mono">
                {ruBank.length - usedChips.size}
              </strong>{" "}
              из {ruBank.length} осталось
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {ruBank.map((ru, i) => (
              <BankChip
                key={i}
                chipIndex={i}
                ru={ru}
                used={usedChips.has(i)}
                disabled={checked || usedChips.has(i)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {enLabels.map((en, i) => {
            const chipIdx = assign[i];
            return (
              <Slot
                key={i}
                enIndex={i}
                en={en}
                value={chipIdx != null ? ruBank[chipIdx] : undefined}
                onClear={onClear}
                checked={checked}
                correctness={correctness[i]}
              />
            );
          })}
        </div>
      </DndContext>
    </SectionCard>
  );
}
