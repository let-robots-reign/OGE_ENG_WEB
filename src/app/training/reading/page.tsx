"use client";

import { useRef, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { TrainingPage } from "@/app/_components/TrainingPage";
import {
  ReadingTask,
  type ReadingTaskRef,
} from "@/app/_components/ReadingTask";
import { TrainingExplanation } from "@/app/_components/TrainingExplanation";
import styles from "@/app/_components/TrainingPage.module.css";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";

export default function ReadingPage() {
  return (
    <Suspense fallback={<div className="text-white">Загрузка...</div>}>
      <ReadingContent />
    </Suspense>
  );
}

function ReadingContent() {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topic"));

  const taskRef = useRef<ReadingTaskRef>(null);

  const { data: session } = useSession();

  const { data, isLoading } = api.training.getReadingTraining.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      refetchOnWindowFocus: false,
      gcTime: 0,
    },
  );

  const checkAnswersMutation = api.training.checkReadingTraining.useMutation();
  const logResultMutation = api.training.logResult.useMutation();

  const [isChecking, setIsChecking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [resultText, setResultText] = useState("");
  const [explanationComponent, setExplanationComponent] =
    useState<React.ReactNode | null>(null);

  const handleCheck = async () => {
    if (!data?.task) return;
    setIsChecking(true);

    const userAnswers = taskRef.current?.getAnswers() ?? [];
    const result = await checkAnswersMutation.mutateAsync({
      id: data.task.id,
      answers: userAnswers.map((userAnswer) =>
        userAnswer ? data.task.headings.indexOf(userAnswer) : null,
      ),
    });

    taskRef.current?.showCorrectAnswers(userAnswers, result.correctAnswers);

    const resultRatio = `${result.correctCount}/${result.total}`;
    setResultText(`Ваш результат: ${resultRatio}`);

    if (result.explanation) {
      setExplanationComponent(
        <TrainingExplanation
          explanation={result.explanation}
          userAnswers={userAnswers}
          correctAnswers={result.correctAnswers}
          headings={data.task.headings}
        />,
      );
    }
    setIsChecking(false);
    setIsChecked(true);

    posthog.capture("training_completed", {
      training_type: "reading",
      topic: data.topicTitle,
      topic_id: topicId,
      correct_count: result.correctCount,
      total: result.total,
      result: resultRatio,
    });

    if (session?.user) {
      logResultMutation.mutate({
        activityId: topicId,
        activityType: "training",
        result: resultRatio,
      });
    }
  };

  const instruction = useMemo(
    () => (
      <>
        <p>
          Определите, в каком из текстов <b>A-F</b> содержатся ответы на вопросы{" "}
          <b>1-7</b>.
        </p>
        <p>Используйте каждую цифру только один раз.</p>
        <p>В задании есть один лишний вопрос.</p>
      </>
    ),
    [],
  );

  if (!isLoading && !data) {
    return (
      <div className="text-white">
        Не удалось загрузить задание. Попробуйте еще раз.
      </div>
    );
  } else if (!data) {
    return <></>;
  }

  return (
    <main className={styles.trainingPage}>
      <TrainingPage
        topic={data.topicTitle}
        instruction={instruction}
        onCheck={handleCheck}
        isChecking={isChecking}
        isChecked={isChecked}
        resultText={resultText}
        explanationComponent={explanationComponent}
      >
        <ReadingTask
          ref={taskRef}
          headings={data.task.headings}
          texts={data.task.texts}
        />
      </TrainingPage>
    </main>
  );
}
