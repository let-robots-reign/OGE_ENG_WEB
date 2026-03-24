"use client";

import { useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { TrainingPage } from "@/app/_components/TrainingPage";
import {
  ListeningTask,
  type ListeningTaskRef,
} from "@/app/_components/ListeningTask";
import { ListeningExplanation } from "@/app/_components/ListeningExplanation";
import styles from "@/app/_components/TrainingPage.module.css";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";

export default function ListeningPage() {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topic"));

  const taskRef = useRef<ListeningTaskRef>(null);

  const { data: session } = useSession();

  const { data, isLoading } = api.training.getListeningTraining.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      refetchOnWindowFocus: false,
      gcTime: 0,
    },
  );

  const checkAnswersMutation =
    api.training.checkListeningTraining.useMutation();
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
      answers: userAnswers,
    });

    taskRef.current?.showCorrectAnswers(userAnswers, result.correctAnswers);

    const resultRatio = `${result.correctCount}/${result.total}`;
    setResultText(`Ваш результат: ${resultRatio}`);

    if (result.explanation) {
      setExplanationComponent(
        <ListeningExplanation
          explanation={result.explanation}
          userAnswers={userAnswers}
          correctAnswers={result.correctAnswers}
          questions={data.task.questions}
        />,
      );
    }
    setIsChecking(false);
    setIsChecked(true);

    posthog.capture("training_completed", {
      training_type: "listening",
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
      <p>
        Вы услышите четыре коротких текста, обозначенных буквами А, B, C, D. В
        заданиях 1–4 запишите в поле ответа цифру 1, 2 или 3, соответствующую
        выбранному Вами варианту ответа.
      </p>
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
        <ListeningTask
          ref={taskRef}
          audioUrl={"/audio/topic1/" + data.task.audioUrl}
          questions={data.task.questions}
        />
      </TrainingPage>
    </main>
  );
}
