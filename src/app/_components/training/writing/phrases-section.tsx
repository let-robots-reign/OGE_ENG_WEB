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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`rounded-pill inline-flex items-center gap-1.5 border-[1.5px] px-4 py-[9px] font-mono text-[13.5px] font-medium ${
        checked ? "cursor-default" : "cursor-grab"
      } ${
        checked
          ? correct
            ? "border-ok bg-ok-soft text-ok"
            : "border-err bg-err-soft text-err"
          : "border-line-2 bg-surface text-ink-2"
      } ${isDragging ? "opacity-40" : "opacity-100"}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {!checked && <span className="text-ink-4 text-[10px]">⋮⋮</span>}
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
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-[18px]">
      <div className="bg-surface-2 text-ink-2 grid size-[30px] place-items-center rounded-xs font-mono text-[13px] font-medium">
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
          className={`rounded-pill inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11.5px] font-medium tracking-[0.04em] uppercase ${
            allCorrect ? "bg-ok-soft text-ok" : "bg-err-soft text-err"
          }`}
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
