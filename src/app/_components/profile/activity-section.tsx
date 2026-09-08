"use client";

import { api } from "@/trpc/react";
import { ActivityView } from "./activity-view";

export function ActivitySection() {
  const timeZone =
    typeof Intl !== "undefined"
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Europe/Moscow")
      : "Europe/Moscow";

  const { data } = api.user.getActivity.useQuery({ timeZone, weeks: 16 });

  return <ActivityView data={data} />;
}
