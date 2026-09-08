import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { MockExamResultView } from "@/app/_components/mock-exams/mock-exam-result-view";

export default async function AdminMockExamResultPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const resultId = Number((await params).resultId);
  if (!Number.isInteger(resultId) || resultId <= 0) notFound();
  const result = await api.admin.getMockExamResultById({ id: resultId });
  if (!result) notFound();

  return (
    <div>
      <div className="mx-auto max-w-[1050px] px-5 pt-8 sm:px-8">
        <div className="text-ink-3 text-[13px]">
          Ученик: {result.user.name ?? "—"} · {result.user.email}
        </div>
      </div>
      <MockExamResultView
        details={result.details}
        backHref="/admin?tab=mock-exams"
      />
    </div>
  );
}
