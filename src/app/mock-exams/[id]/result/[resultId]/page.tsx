import { redirect, notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { SavedMockExamResult } from "@/app/_components/mock-exams/mock-exam-experience";

export default async function MockExamResultPage({
  params,
}: {
  params: Promise<{ id: string; resultId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const resultId = Number((await params).resultId);
  if (!Number.isInteger(resultId) || resultId <= 0) notFound();
  return <SavedMockExamResult id={resultId} />;
}
