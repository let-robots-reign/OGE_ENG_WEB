"use client";

import { api } from "@/trpc/react";
import { ActivityView } from "@/app/_components/profile/activity-view";

/**
 * Teacher's read-only view of a student's activity heatmap. Fetches with the
 * teacher's browser timezone so the grid aligns to how they read dates, and
 * reuses the same presentational component as the student's own profile.
 */
export function StudentActivitySection({
  classroomId,
  studentId,
}: {
  classroomId: string;
  studentId: string;
}) {
  const timeZone =
    typeof Intl !== "undefined"
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Europe/Moscow")
      : "Europe/Moscow";

  const { data } = api.teacher.getStudentActivity.useQuery({
    classroomId,
    studentId,
    timeZone,
    weeks: 16,
  });

  return <ActivityView data={data} readOnly />;
}
