"use client";

import { useSession } from "next-auth/react";
import { useRouter, notFound } from "next/navigation";
import { api } from "@/trpc/react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import styles from "@/app/_components/TrainingPage.module.css";
import { TrainingHeader } from "@/app/_components/TrainingHeader";
import { processFeedback } from "@/app/_utils/_diagnostics";

export default function DiagnosticResultPage({
  params: { resultId: resultIdString },
}: {
  params: { resultId: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const resultId = Number(resultIdString);

  const hasAccess =
    status === "authenticated" && session?.user?.role === "admin";

  const { data: result, isLoading } = api.admin.getResultById.useQuery(
    { id: resultId },
    {
      enabled: !isNaN(resultId) && hasAccess,
    },
  );

  if (status === "loading" || isLoading) {
    return <div className="text-white">Загрузка...</div>;
  }

  if (!hasAccess) {
    notFound();
  }

  if (!result) {
    return <div className="text-white">Результат не найден.</div>;
  }

  const processedFeedback = processFeedback(result.details.feedback);

  return (
    <main className={styles.trainingPage}>
      <TrainingHeader topic="Результаты диагностики" />
      <div>
        <h2 className={styles.sectionTitle}>
          Фидбек по диагностике для {result.user?.name} ({result.user?.email})
        </h2>
        <div className={styles.feedbackContent}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {processedFeedback}
          </ReactMarkdown>
        </div>
        <div className={styles.buttonsGroup}>
          <button
            className={`${styles.btn} ${styles.secondary}`}
            onClick={() => router.back()}
          >
            Назад
          </button>
        </div>
      </div>
    </main>
  );
}
