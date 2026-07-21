import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { SectionSubHeader } from "@/app/_components/training/shared/training-sub-header";
import { DiagnosticFeedback } from "@/app/_components/diagnostics/grammar/diagnostic-feedback";

export default async function DiagnosticResultPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    notFound();
  }

  const { resultId } = await params;
  const id = Number(resultId);
  if (!Number.isInteger(id)) {
    notFound();
  }

  const result = await api.admin.getResultById({ id });
  if (!result) {
    notFound();
  }

  const completedAt = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(result.createdAt);

  return (
    <>
      <SectionSubHeader
        section="админка · диагностика"
        title={result.user?.name ?? result.user?.email ?? "Пользователь"}
        backHref="/admin?tab=diagnostics"
      />
      <div className="px-5 pt-8 pb-16 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-[820px]">
          <div className="text-ink-3 mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px]">
            <span className="text-ink font-medium">{result.user?.name}</span>
            <span>·</span>
            <span>{result.user?.email}</span>
            <span>·</span>
            <span className="font-mono text-[12.5px]">{completedAt}</span>
          </div>
          <DiagnosticFeedback feedback={result.details.feedback} />
        </div>
      </div>
    </>
  );
}
