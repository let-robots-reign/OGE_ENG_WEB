import { notFound } from "next/navigation";
import { MockExamFormView } from "@/app/_components/admin/mock-exams/mock-exam-form-view";

export default async function EditMockExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <MockExamFormView id={id} />;
}
