"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
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
import { api, type RouterOutputs } from "@/trpc/react";
import { CustomSelect } from "@/app/_components/ui/custom-select";

type CatalogTask = RouterOutputs["admin"]["getUoeChainCatalog"][number];

function SortableChainTask({
  task,
  position,
  total,
  onRemove,
  onMove,
}: {
  task: CatalogTask;
  position: number;
  total: number;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
      className="bg-surface border-line flex gap-3 rounded-xl border p-3.5 shadow-xs"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Перетащить задание #${task.id}`}
        className="text-ink-4 hover:text-ink mt-1 cursor-grab touch-none rounded p-1 active:cursor-grabbing"
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-ink text-on-ink rounded-md px-2 py-0.5 font-mono">
            {position}
          </span>
          <span className="text-ink-4 font-mono">#{task.id}</span>
          <span className="text-ink-3">{task.topic?.title}</span>
        </div>
        <p className="text-ink-2 mt-2 text-sm leading-relaxed">{task.task}</p>
        <div className="mt-2 flex gap-2 font-mono text-xs">
          <span className="bg-surface-2 border-line rounded border px-2 py-0.5">
            {task.origin}
          </span>
          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-700">
            {task.answer}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          disabled={position === 1}
          onClick={() => onMove(-1)}
          aria-label={`Переместить задание #${task.id} вверх`}
          className="border-line rounded border px-2 py-1 text-xs disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={position === total}
          onClick={() => onMove(1)}
          aria-label={`Переместить задание #${task.id} вниз`}
          className="border-line rounded border px-2 py-1 text-xs disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Удалить задание #${task.id} из цепочки`}
          className="mt-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-500/10"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function UoeTaskChainFormView({ chainId }: { chainId?: number }) {
  const router = useRouter();
  const utils = api.useUtils();
  const isEditMode = chainId !== undefined;
  const [search, setSearch] = useState("");
  const [topicId, setTopicId] = useState<number | undefined>();
  const [selectedTasks, setSelectedTasks] = useState<CatalogTask[]>([]);
  const [initialTaskIds, setInitialTaskIds] = useState<number[] | null>(
    isEditMode ? null : [],
  );
  const [formError, setFormError] = useState<string | null>(null);

  const { data: topics } = api.admin.getUoeTopics.useQuery();
  const { data: catalog = [], isLoading: isCatalogLoading } =
    api.admin.getUoeChainCatalog.useQuery({ search, topicId, limit: 50 });
  const { data: existingChain, isLoading: isChainLoading } =
    api.admin.getUoeTaskChainById.useQuery(
      { id: chainId! },
      { enabled: isEditMode },
    );

  useEffect(() => {
    if (!existingChain || initialTaskIds !== null) return;
    const tasks = existingChain.items.map((item) => item.task);
    setSelectedTasks(tasks);
    setInitialTaskIds(tasks.map((task) => task.id));
  }, [existingChain, initialTaskIds]);

  const selectedIds = selectedTasks.map((task) => task.id);
  const isDirty =
    initialTaskIds !== null &&
    selectedIds.join(",") !== initialTaskIds.join(",");

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const createMutation = api.admin.createUoeTaskChain.useMutation();
  const updateMutation = api.admin.updateUoeTaskChain.useMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const topicOptions = useMemo(
    () => [
      { value: 0, label: "Все грамматические темы" },
      ...(topics
        ?.filter(
          (topic) =>
            topic.isActive &&
            topic.title !== "Словообразование" &&
            topic.title !== "По всем темам",
        )
        .map((topic) => ({ value: topic.id, label: topic.title })) ?? []),
    ],
    [topics],
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setSelectedTasks((current) => {
      const oldIndex = current.findIndex((task) => task.id === active.id);
      const newIndex = current.findIndex((task) => task.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const moveTask = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= selectedTasks.length) return;
    setSelectedTasks((current) => arrayMove(current, index, destination));
  };

  const handleCancel = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDirty && !window.confirm("Отменить несохранённые изменения?")) {
      event.preventDefault();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedTasks.length !== 9) return;
    setFormError(null);

    try {
      const taskIds = selectedTasks.map((task) => task.id);
      if (chainId !== undefined) {
        await updateMutation.mutateAsync({ id: chainId, taskIds });
      } else {
        await createMutation.mutateAsync({ taskIds });
      }
      await utils.admin.getUoeTaskChains.invalidate();
      if (chainId !== undefined) {
        await utils.admin.getUoeTaskChainById.invalidate({ id: chainId });
      }
      setInitialTaskIds(taskIds);
      router.push("/admin/tasks/uoe?tab=chains");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Не удалось сохранить цепочку",
      );
    }
  };

  if (isEditMode && isChainLoading) {
    return (
      <div className="text-ink-3 p-12 text-center">Загрузка цепочки...</div>
    );
  }

  if (isEditMode && existingChain === null) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h1 className="font-display text-3xl">Цепочка не найдена</h1>
        <Link
          href="/admin/tasks/uoe?tab=chains"
          className="text-accent mt-4 inline-block text-sm font-medium"
        >
          ← К списку цепочек
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[1400px] pb-16">
      <div className="mb-6">
        <Link
          href="/admin/tasks/uoe?tab=chains"
          onClick={handleCancel}
          className="text-ink-3 hover:text-ink text-xs font-medium"
        >
          ← Назад к цепочкам
        </Link>
        <h1 className="font-display mt-1 text-[30px] tracking-tight sm:text-[36px]">
          {isEditMode ? `Редактирование цепочки #${chainId}` : "Новая цепочка"}
        </h1>
        <p className="text-ink-3 mt-1 text-sm">
          Добавьте ровно 9 заданий и расположите предложения в порядке связного
          текста.
        </p>
      </div>

      {formError && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {formError}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <section className="bg-surface border-line rounded-2xl border p-5 shadow-sm">
          <h2 className="font-display text-xl">Доступные задания</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по ID, тексту, слову или ответу..."
              aria-label="Поиск заданий"
              className="bg-surface-2 border-line min-w-0 flex-1 rounded-lg border px-3.5 py-2 text-sm"
            />
            <CustomSelect
              options={topicOptions}
              value={topicId ?? 0}
              onChange={(value) => setTopicId(value === 0 ? undefined : value)}
              className="w-full sm:w-56"
            />
          </div>

          <div className="mt-4 max-h-[680px] space-y-2 overflow-y-auto pr-1">
            {isCatalogLoading ? (
              <div className="text-ink-3 py-10 text-center text-sm">
                Загрузка заданий...
              </div>
            ) : catalog.length === 0 ? (
              <div className="text-ink-3 py-10 text-center text-sm">
                Подходящие задания не найдены.
              </div>
            ) : (
              catalog.map((task) => {
                const isSelected = selectedIds.includes(task.id);
                const isFull = selectedTasks.length >= 9;
                return (
                  <article
                    key={task.id}
                    className={`border-line rounded-xl border p-3.5 ${
                      isSelected ? "bg-accent/5 border-accent/30" : "bg-surface"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-ink-4 flex flex-wrap gap-2 text-xs">
                          <span className="font-mono">#{task.id}</span>
                          <span>{task.topic?.title}</span>
                        </div>
                        <p className="text-ink-2 mt-1.5 text-sm leading-relaxed">
                          {task.task}
                        </p>
                        <div className="mt-2 flex gap-2 font-mono text-xs">
                          <span className="bg-surface-2 rounded px-2 py-0.5">
                            {task.origin}
                          </span>
                          <span className="text-emerald-700">
                            {task.answer}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isSelected || isFull}
                        onClick={() =>
                          setSelectedTasks((current) => [...current, task])
                        }
                        aria-label={`Добавить задание #${task.id}`}
                        className="bg-ink text-on-ink grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg disabled:opacity-35"
                      >
                        {isSelected ? "✓" : "+"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
          {catalog.length === 50 && (
            <p className="text-ink-4 mt-3 text-xs">
              Показаны первые 50 результатов. Уточните поиск, чтобы найти другие
              задания.
            </p>
          )}
        </section>

        <section className="bg-surface-2 border-line rounded-2xl border p-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Текущая цепочка</h2>
            <span
              className={`rounded-lg px-3 py-1 font-mono text-sm font-semibold ${
                selectedTasks.length === 9
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-surface text-ink-3"
              }`}
            >
              {selectedTasks.length} / 9
            </span>
          </div>

          {selectedTasks.length === 0 ? (
            <div className="border-line text-ink-3 mt-4 rounded-xl border border-dashed px-5 py-12 text-center text-sm">
              Нажимайте «+» у заданий слева, чтобы собрать цепочку.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="mt-4 max-h-[650px] space-y-2 overflow-y-auto pr-1">
                  {selectedTasks.map((task, index) => (
                    <SortableChainTask
                      key={task.id}
                      task={task}
                      position={index + 1}
                      total={selectedTasks.length}
                      onMove={(direction) => moveTask(index, direction)}
                      onRemove={() =>
                        setSelectedTasks((current) =>
                          current.filter((item) => item.id !== task.id),
                        )
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>

      <div className="bg-surface border-line sticky bottom-4 mt-6 flex items-center justify-end gap-3 rounded-xl border p-4 shadow-lg">
        <Link
          href="/admin/tasks/uoe?tab=chains"
          onClick={handleCancel}
          className="border-line rounded-lg border px-5 py-2.5 text-sm font-medium"
        >
          Отмена
        </Link>
        <button
          type="submit"
          disabled={selectedTasks.length !== 9 || isSaving}
          className="bg-ink text-on-ink rounded-lg px-6 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          {isSaving ? "Сохранение..." : "Сохранить цепочку"}
        </button>
      </div>
    </form>
  );
}
