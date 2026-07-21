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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionHead, SectionCard } from "./section-head";

interface StructureSectionProps {
  sentences: string[];
  order: number[];
  onReorder: (order: number[]) => void;
  checked: boolean;
  correctness: boolean[];
}

function SortableSentence({
  id,
  position,
  text,
  checked,
  correct,
}: {
  id: number;
  position: number;
  text: string;
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
  const badge = checked
    ? correct
      ? "var(--color-ok)"
      : "var(--color-err)"
    : "var(--color-ink)";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: "grid",
        gridTemplateColumns: "auto auto 1fr auto",
        gap: 18,
        padding: "16px 18px",
        background: isDragging
          ? "var(--color-surface-2)"
          : "var(--color-surface)",
        border: `1.5px solid ${border}`,
        borderRadius: 14,
        opacity: isDragging ? 0.5 : 1,
        cursor: checked ? "default" : "grab",
        alignItems: "start",
      }}
    >
      <div
        className="grid place-items-center font-mono"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: badge,
          color: checked ? "#fff" : "var(--color-on-ink)",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {position + 1}
      </div>
      <div
        className="text-ink-4 grid place-items-center"
        style={{ width: 18, marginTop: 8 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="6" r="1.5" />
          <circle cx="16" cy="6" r="1.5" />
          <circle cx="8" cy="12" r="1.5" />
          <circle cx="16" cy="12" r="1.5" />
          <circle cx="8" cy="18" r="1.5" />
          <circle cx="16" cy="18" r="1.5" />
        </svg>
      </div>
      <div
        className="text-ink-2 leading-relaxed"
        style={{ fontSize: text.length > 200 ? 14.5 : 15.5, paddingTop: 6 }}
      >
        {text}
      </div>
      {checked && (
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 11,
            letterSpacing: ".08em",
            color: correct ? "var(--color-ok)" : "var(--color-err)",
            paddingTop: 12,
          }}
        >
          {correct ? "✓ верно" : "ошибка"}
        </div>
      )}
    </div>
  );
}

export function StructureSection({
  sentences,
  order,
  onReorder,
  checked,
  correctness,
}: StructureSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(Number(active.id));
    const newIndex = order.indexOf(Number(over.id));
    onReorder(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <SectionCard>
      <SectionHead
        index="01"
        en="Letter structure"
        title="Структура письма"
        subtitle="Расставьте предложения в правильном порядке. Перетаскивайте карточки."
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2.5">
            {order.map((sentenceIdx, pos) => (
              <SortableSentence
                key={sentenceIdx}
                id={sentenceIdx}
                position={pos}
                text={sentences[sentenceIdx] ?? ""}
                checked={checked}
                correct={!!correctness[pos]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </SectionCard>
  );
}
