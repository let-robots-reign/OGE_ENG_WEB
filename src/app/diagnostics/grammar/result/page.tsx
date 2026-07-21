import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { DiagnosticResultView } from "@/app/_components/diagnostics/grammar/diagnostic-result-view";

export default async function GrammarDiagnosticResultPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const result = await api.diagnostics.getDiagnosticsResult();

  // Not completed yet → send them to take the diagnostics.
  if (!result) redirect("/diagnostics/grammar");
  // Completed but no feedback stored (shouldn't normally happen).
  if (!result.feedback) redirect("/");

  return (
    <DiagnosticResultView
      feedback={result.feedback}
      completedAt={result.createdAt}
    />
  );
}
