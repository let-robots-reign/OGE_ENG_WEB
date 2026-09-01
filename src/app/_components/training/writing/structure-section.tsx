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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`grid grid-cols-[auto_auto_1fr_auto] items-start gap-[18px] rounded-[14px] border-[1.5px] px-[18px] py-4 ${
        checked ? "cursor-default" : "cursor-grab"
      } ${isDragging ? "bg-surface-2 opacity-50" : "bg-surface opacity-100"} ${
        checked ? (correct ? "border-ok" : "border-err") : "border-line-2"
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div
        className={`grid size-9 place-items-center rounded-[9px] font-mono text-[14px] font-medium ${
          checked
            ? correct
              ? "bg-ok text-white"
              : "bg-err text-white"
            : "bg-ink text-on-ink"
        }`}
      >
        {position + 1}
      </div>
      <div className="text-ink-4 mt-2 grid w-[18px] place-items-center">
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
        className={`text-ink-2 pt-1.5 leading-relaxed ${text.length > 200 ? "text-[14.5px]" : "text-[15.5px]"}`}
      >
        {text}
      </div>
      {checked && (
        <div
          className={`pt-3 font-mono text-[11px] tracking-[0.08em] uppercase ${
            correct ? "text-ok" : "text-err"
          }`}
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
