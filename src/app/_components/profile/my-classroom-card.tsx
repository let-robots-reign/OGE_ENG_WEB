"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { SectionEyebrow } from "./section-eyebrow";

const joinedFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

/**
 * Student's "Мой класс" block. Renders nothing until we know the student is in
 * a class (teachers/admins never have a membership). Lets the student see their
 * class and leave it.
 */
export function MyClassroomCard() {
  const router = useRouter();
  const utils = api.useUtils();
  const [confirming, setConfirming] = useState(false);
  const { data, isLoading } = api.teacher.getMyClassroom.useQuery();

  const leave = api.teacher.leaveClassroom.useMutation({
    onSuccess: async () => {
      setConfirming(false);
      await utils.teacher.getMyClassroom.invalidate();
      router.refresh();
    },
  });

  if (isLoading || !data) return null;

  return (
    <section className="mb-[72px]">
      <div className="mb-5">
        <SectionEyebrow>мой класс</SectionEyebrow>
      </div>
      <div className="border-line bg-surface flex flex-col items-start justify-between gap-4 rounded-lg border p-6 sm:flex-row sm:items-center sm:p-7">
        <div>
          <div className="font-display text-[22px] tracking-[-0.02em]">
            {data.name}
          </div>
          <div className="text-ink-3 mt-1.5 text-[13.5px]">
            Учитель: {data.teacherName} · вы вступили{" "}
            {joinedFmt.format(data.joinedAt)}
          </div>
          <div className="text-ink-4 mt-2 max-w-[440px] text-[12.5px] leading-[1.5]">
            Учитель видит ваш учебный прогресс в приложении: активность, баллы по
            разделам и результаты пробников.
          </div>
        </div>

        {confirming ? (
          <div className="flex shrink-0 items-center gap-3 text-[13.5px]">
            <span className="text-ink-3">Выйти из класса?</span>
            <button
              type="button"
              onClick={() => leave.mutate()}
              disabled={leave.isPending}
              className="text-err font-medium hover:underline disabled:opacity-60"
            >
              {leave.isPending ? "…" : "Да, выйти"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-ink-3 hover:text-ink"
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-pill border-line-2 text-ink hover:bg-surface-2 inline-flex h-11 shrink-0 items-center border px-[22px] text-[14.5px] font-medium transition-colors"
          >
            Выйти из класса
          </button>
        )}
      </div>
    </section>
  );
}
