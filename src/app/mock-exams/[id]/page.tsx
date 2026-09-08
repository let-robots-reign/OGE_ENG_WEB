import { redirect, notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { MockExamExperience } from "@/app/_components/mock-exams/mock-exam-experience";

export default async function MockExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <MockExamExperience id={id} />;
}
