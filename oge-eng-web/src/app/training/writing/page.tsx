"use client";

import { useRef, useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { TrainingPage } from "@/app/_components/TrainingPage";
import {
  WritingTask,
  type WritingTaskRef,
} from "@/app/_components/WritingTask";
import styles from "@/app/_components/TrainingPage.module.css";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";

export default function WritingPage() {
  const taskRef = useRef<WritingTaskRef>(null);

  const { data: session } = useSession();

  const { data, isLoading } = api.training.getWritingTraining.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      gcTime: 0,
    },
  );

  const { data: topicData } =
    api.training.getTopicByTopicTitle.useQuery("Письмо Упражнения");
  const topicId = topicData?.id;

  const checkAnswersMutation = api.training.checkWritingTraining.useMutation();
  const logResultMutation = api.training.logResult.useMutation();

  const [isChecking, setIsChecking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [resultText, setResultText] = useState("");

  const handleCheck = async () => {
    if (!data?.task) return;
    setIsChecking(true);

    const userAnswers = taskRef.current?.getAnswers();
    if (!userAnswers) {
      setIsChecking(false);
      return;
    }

    const result = await checkAnswersMutation.mutateAsync({
      answers: userAnswers,
    });

    taskRef.current?.showCorrectness({
      structureCorrectness: result.structureCorrectness,
      clichesCorrectness: result.clichesCorrectness,
      linkersCorrectness: result.linkersCorrectness,
      fullAnswersCorrectness: result.fullAnswersCorrectness,
    });

    const resultRatio = `${result.correctCount}/${result.total}`;
    setResultText(`Ваш результат: ${resultRatio}`);
    setIsChecking(false);
    setIsChecked(true);

    posthog.capture("training_completed", {
      training_type: "writing",
      topic: data.topicTitle,
      correct_count: result.correctCount,
      total: result.total,
      result: resultRatio,
    });

    if (session?.user && topicId) {
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
          Данная тренировка проверяет отдельные навыки, необходимые для
          написания письма:
        </p>
        <ol>
          <li>1. Знание структуры письма.</li>
          <li>2. Использование фраз-клише.</li>
          <li>3. Использование слов-связок.</li>
          <li>4. Умение дать полный ответ на вопрос.</li>
        </ol>
        <p>
          Для получения подробной информации обратитесь к соответствующим
          разделам Теории
        </p>
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
      >
        <WritingTask
          ref={taskRef}
          taskData={data.task}
          isChecking={isChecking}
          isChecked={isChecked}
        />
      </TrainingPage>
    </main>
  );
}
