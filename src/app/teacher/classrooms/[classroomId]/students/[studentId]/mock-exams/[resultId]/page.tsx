import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { MockExamResultView } from "@/app/_components/mock-exams/mock-exam-result-view";

export default async function StudentMockExamResultPage({
  params,
}: {
  params: Promise<{
    classroomId: string;
    studentId: string;
    resultId: string;
  }>;
}) {
  const { classroomId, studentId, resultId } = await params;
  const rid = Number(resultId);
  if (!Number.isInteger(rid) || rid <= 0) notFound();

  let data;
  try {
    data = await api.teacher.getStudentMockResult({
      classroomId,
      studentId,
      resultId: rid,
    });
  } catch (err) {
    if (
      err instanceof TRPCError &&
      (err.code === "NOT_FOUND" || err.code === "FORBIDDEN")
    ) {
      notFound();
    }
    throw err;
  }

  return (
    <MockExamResultView
      details={data.details}
      backHref={`/teacher/classrooms/${classroomId}/students/${studentId}`}
    />
  );
}
