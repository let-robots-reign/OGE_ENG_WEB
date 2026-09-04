"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MockExamSlot } from "@/server/db/schema";
import { api } from "@/trpc/react";

export function MockExamFormView({ id }: { id?: number }) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: slots, isLoading: optionsLoading } =
    api.admin.getMockExamOptions.useQuery();
  const { data: existing, isLoading: examLoading } =
    api.admin.getMockExamById.useQuery(
      { id: id ?? 0 },
      { enabled: typeof id === "number" },
    );
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("1");
  const [selected, setSelected] = useState<
    Partial<Record<MockExamSlot, number>>
  >({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setOrder(String(existing.order));
    setSelected(
      Object.fromEntries(
        existing.parts.map((part) => [
          part.slot,
          part.audioTaskId ?? part.readingTaskId ?? part.uoeTaskChainId ?? 0,
        ]),
      ) as Partial<Record<MockExamSlot, number>>,
    );
  }, [existing]);

  const onSuccess = async () => {
    await Promise.all([
      utils.admin.getMockExams.invalidate(),
      utils.mockExams.list.invalidate(),
    ]);
    router.push("/admin/mock-exams");
  };
  const createMutation = api.admin.createMockExam.useMutation({ onSuccess });
  const updateMutation = api.admin.updateMockExam.useMutation({ onSuccess });
  const pending = createMutation.isPending || updateMutation.isPending;

  const submit = () => {
    setError(null);
    if (!title.trim()) {
      setError("Укажите название варианта.");
      return;
    }
    const parsedOrder = Number(order);
    if (!order.trim() || !Number.isInteger(parsedOrder) || parsedOrder < 1) {
      setError("Порядок должен быть целым положительным числом.");
      return;
    }
    if (!slots || slots.some((slot) => !selected[slot.slot])) {
      setError("Выберите задание для каждой из семи частей.");
      return;
    }
    const parts = slots.map((slot) => ({
      slot: slot.slot,
      resourceId: selected[slot.slot]!,
    }));
    const payload = { title: title.trim(), order: parsedOrder, parts };
    if (id) {
      updateMutation.mutate(
        { id, ...payload },
        { onError: (cause) => setError(cause.message) },
      );
    } else {
      createMutation.mutate(payload, {
        onError: (cause) => setError(cause.message),
      });
    }
  };

  if (optionsLoading || (id && examLoading)) {
    return <div className="text-ink-3 p-10 text-center">Загрузка...</div>;
  }
  if (id && !existing) {
    return <div className="text-err p-10 text-center">Вариант не найден.</div>;
  }

  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-[920px]">
        <div className="mb-7">
          <button
            type="button"
            onClick={() => router.push("/admin/mock-exams")}
            className="text-ink-3 text-[14px]"
          >
            ← К вариантам
          </button>
          <h1 className="font-display mt-4 text-[38px] leading-none tracking-[-0.03em]">
            {id ? "Редактировать вариант" : "Новый вариант"}
          </h1>
        </div>

        <div className="border-line bg-surface rounded-lg border p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <label className="text-[14px] font-medium">
              Название
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="border-line-2 mt-2 h-11 w-full rounded-md border px-3 font-normal"
                placeholder="Тренировочный вариант 01"
              />
            </label>
            <label className="text-[14px] font-medium">
              Порядок
              <input
                type="number"
                min={1}
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                className="border-line-2 mt-2 h-11 w-full rounded-md border px-3 font-normal"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-5">
            {slots?.map((slot, index) => (
              <label key={slot.slot} className="block">
                <div className="mb-2 flex items-center gap-3">
                  <span className="bg-ink text-on-ink grid size-7 place-items-center rounded-full font-mono text-[11px]">
                    {index + 1}
                  </span>
                  <span className="font-display text-[20px]">{slot.label}</span>
                  <span className="text-ink-3 text-[12px] uppercase">
                    {slot.kind}
                  </span>
                </div>
                <select
                  value={selected[slot.slot] ?? ""}
                  onChange={(event) =>
                    setSelected((previous) => ({
                      ...previous,
                      [slot.slot]: Number(event.target.value),
                    }))
                  }
                  className="border-line-2 bg-surface h-12 w-full rounded-md border px-3 text-[14px]"
                >
                  <option value="">Выберите задание</option>
                  {slot.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      #{option.id} · {option.type} · {option.total} ответов ·{" "}
                      {option.preview}
                    </option>
                  ))}
                </select>
                {slot.options.length === 0 && (
                  <div className="text-warn mt-2 text-[13px]">
                    Для этой части нет доступных заданий.
                  </div>
                )}
              </label>
            ))}
          </div>

          {error && (
            <div className="bg-err-soft text-err mt-6 rounded-md px-4 py-3 text-[14px]">
              {error}
            </div>
          )}

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/mock-exams")}
              className="rounded-pill border-line-2 h-11 border px-5 text-[14px] font-medium"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="bg-ink text-on-ink rounded-pill h-11 px-6 text-[14px] font-medium disabled:opacity-60"
            >
              {pending ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
