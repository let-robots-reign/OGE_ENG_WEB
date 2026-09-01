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
      className={`rounded-pill touch-none border px-3.5 py-2 text-[13px] font-medium select-none ${
        disabled ? "cursor-default" : "cursor-grab"
      } ${
        used
          ? "border-line-2 text-ink-4 border-dashed bg-transparent line-through"
          : "border-line-2 bg-surface text-ink border-solid"
      } ${isDragging ? "opacity-40" : "opacity-100"}`}
      style={{
        transform: CSS.Translate.toString(transform),
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
  const empty = checked && !value;

  return (
    <div
      ref={setNodeRef}
      className={`grid min-h-[50px] grid-cols-[96px_1fr] items-center gap-2.5 rounded-[10px] border-[1.5px] px-3 py-2.5 ${
        checked
          ? correct
            ? "border-ok bg-ok-soft"
            : empty
              ? "border-line-2 bg-surface"
              : "border-err bg-err-soft"
          : isOver
            ? "border-accent bg-accent-soft"
            : "border-line-2 bg-surface"
      }`}
    >
      <div className="text-ink-2 truncate font-mono text-[13px] font-medium">
        {en}
      </div>
      <div className="flex min-h-7 min-w-0 flex-wrap items-center gap-1.5">
        {value ? (
          <>
            <span
              className={`rounded-pill px-2.5 py-1 text-[12.5px] font-medium whitespace-nowrap ${
                checked
                  ? correct
                    ? "bg-ok text-white"
                    : "bg-err text-white"
                  : "bg-ink text-on-ink"
              }`}
            >
              {value}
            </span>
            {!checked && (
              <button
                type="button"
                onClick={() => onClear(enIndex)}
                className="text-ink-4 grid size-[18px] place-items-center rounded-full border-none bg-transparent"
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
          <span className="font-display text-ink-4 text-[12px] italic">
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
        <div className="border-line-2 from-surface-2 to-surface mb-6 rounded-lg border border-dashed bg-gradient-to-b px-[22px] py-5">
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
