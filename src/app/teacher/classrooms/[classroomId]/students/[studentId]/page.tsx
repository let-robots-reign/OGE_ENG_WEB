import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { StudentProgressHero } from "@/app/_components/teacher/student-progress-hero";
import { StudentActivitySection } from "@/app/_components/teacher/student-activity-section";
import { SubjectProgress } from "@/app/_components/profile/subject-progress";
import { HistoryTable } from "@/app/_components/profile/history-table";

export default async function StudentProgressPage({
  params,
}: {
  params: Promise<{ classroomId: string; studentId: string }>;
}) {
  const { classroomId, studentId } = await params;

  let data;
  let classroom;
  try {
    [data, classroom] = await Promise.all([
      api.teacher.getStudentProgress({ classroomId, studentId }),
      api.teacher.getClassroom({ classroomId }),
    ]);
  } catch (err) {
    if (err instanceof TRPCError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  return (
    <div className="px-5 pt-7 pb-16 sm:px-8 lg:px-14">
      <Link
        href={`/teacher/classrooms/${classroomId}`}
        className="text-ink-3 hover:text-ink text-[13.5px] transition-colors"
      >
        ← {classroom.name}
      </Link>

      <StudentProgressHero
        name={data.header.name}
        email={data.header.email}
        joinedAt={data.header.joinedAt}
      />

      <div className="mt-10">
        <StudentActivitySection classroomId={classroomId} studentId={studentId} />
        <SubjectProgress subjects={data.subjects} />
        <HistoryTable rows={data.recent} />
      </div>
    </div>
  );
}
