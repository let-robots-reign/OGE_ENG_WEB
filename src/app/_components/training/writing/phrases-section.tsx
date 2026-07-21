"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionHead, SectionCard } from "./section-head";

export interface PhraseItem {
  key: string;
  word: string;
}

interface PhrasesSectionProps {
  rows: { id: number; items: PhraseItem[] }[];
  onReorder: (rowIdx: number, items: PhraseItem[]) => void;
  checked: boolean;
  correctness: boolean[][];
}

function WordChip({
  id,
  word,
  checked,
  correct,
}: {
  id: string;
  word: string;
  checked: boolean;
  correct: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: checked });

  const border = checked
    ? correct
      ? "var(--color-ok)"
      : "var(--color-err)"
    : "var(--color-line-2)";
  const bg = checked
    ? correct
      ? "var(--color-ok-soft)"
      : "var(--color-err-soft)"
    : "var(--color-surface)";
  const color = checked
    ? correct
      ? "var(--color-ok)"
      : "var(--color-err)"
    : "var(--color-ink-2)";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="inline-flex items-center gap-1.5 font-mono"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "9px 16px",
        borderRadius: 999,
        border: `1.5px solid ${border}`,
        background: bg,
        color,
        fontSize: 13.5,
        fontWeight: 500,
        cursor: checked ? "default" : "grab",
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {!checked && (
        <span className="text-ink-4" style={{ fontSize: 10 }}>
          ⋮⋮
        </span>
      )}
      {word}
    </div>
  );
}

function PhraseRow({
  rowIdx,
  row,
  onReorder,
  checked,
  correctness,
}: {
  rowIdx: number;
  row: { id: number; items: PhraseItem[] };
  onReorder: (rowIdx: number, items: PhraseItem[]) => void;
  checked: boolean;
  correctness: boolean[];
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = row.items.findIndex((it) => it.key === active.id);
    const newIndex = row.items.findIndex((it) => it.key === over.id);
    onReorder(rowIdx, arrayMove(row.items, oldIndex, newIndex));
  };

  const allCorrect =
    checked && correctness.length > 0 && correctness.every(Boolean);

  return (
    <div
      className="grid items-center"
      style={{ gridTemplateColumns: "auto 1fr auto", gap: 18 }}
    >
      <div
        className="grid place-items-center font-mono"
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "var(--color-surface-2)",
          color: "var(--color-ink-2)",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {rowIdx + 1}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={row.items.map((it) => it.key)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {row.items.map((it, j) => (
              <WordChip
                key={it.key}
                id={it.key}
                word={it.word}
                checked={checked}
                correct={!!correctness[j]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {checked && (
        <div
          className="inline-flex items-center gap-1.5 font-mono uppercase"
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 500,
            letterSpacing: ".04em",
            background: allCorrect
              ? "var(--color-ok-soft)"
              : "var(--color-err-soft)",
            color: allCorrect ? "var(--color-ok)" : "var(--color-err)",
          }}
        >
          {allCorrect ? "✓ верно" : "✕ ошибка"}
        </div>
      )}
    </div>
  );
}

export function PhrasesSection({
  rows,
  onReorder,
  checked,
  correctness,
}: PhrasesSectionProps) {
  return (
    <SectionCard>
      <SectionHead
        index="02"
        en="Set phrases"
        title="Фразы-клише"
        subtitle="Соберите фразы из перетаскиваемых слов. В личном письме без таких фраз баллы снимут."
      />
      <div className="flex flex-col gap-[18px]">
        {rows.map((row, i) => (
          <PhraseRow
            key={row.id}
            rowIdx={i}
            row={row}
            onReorder={onReorder}
            checked={checked}
            correctness={correctness[i] ?? []}
          />
        ))}
      </div>
    </SectionCard>
  );
}
