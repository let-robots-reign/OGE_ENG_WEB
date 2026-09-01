"use client";

import Image from "next/image";
import { api } from "@/trpc/react";
import { pluralizeDays } from "@/app/_utils/pluralize";

function FlameIcon({ active }: { active: boolean }) {
  return (
    <Image
      src="/icons/fire.svg"
      width={16}
      height={16}
      alt=""
      className={active ? undefined : "opacity-45 grayscale"}
    />
  );
}

export function StreakBadge() {
  const timeZone =
    typeof Intl !== "undefined"
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Europe/Moscow")
      : "Europe/Moscow";

  const { data } = api.user.getStreak.useQuery({ timeZone });

  if (!data || data.count === 0) return null;

  const { count, isActiveToday } = data;

  return (
    <div
      className={`border-line bg-surface rounded-pill inline-flex h-9 items-center gap-2 border px-[14px] text-[13.5px] font-medium ${
        isActiveToday ? "text-accent-2" : "text-ink-4"
      }`}
    >
      <FlameIcon active={isActiveToday} />
      {count} {pluralizeDays(count)} подряд
    </div>
  );
}
