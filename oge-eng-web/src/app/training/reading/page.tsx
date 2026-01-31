"use client";

import { useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { TrainingPage } from "@/app/_components/TrainingPage";
import {
  ReadingTask,
  type ReadingTaskRef,
} from "@/app/_components/ReadingTask";
import styles from "@/app/_components/TrainingPage.module.css";

export default function ReadingPage() {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topic"));

  const taskRef = useRef<ReadingTaskRef>(null);

  const { data, isLoading } = api.training.getReadingTraining.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      refetchOnWindowFocus: false,
      gcTime: 0,
    },
  );

  const checkAnswersMutation = api.training.checkReadingTraining.useMutation();

  const [isChecking, setIsChecking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [resultText, setResultText] = useState("");
  const [explanationData, setExplanationData] = useState<{
    text: string;
    userAnswers: (string | null)[];
    correctAnswers: number[];
    headings: string[];
  } | null>(null);

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

    setResultText(`Ваш результат: ${result.correctCount}/${result.total}`);
    if (result.explanation) {
      setExplanationData({
        text: result.explanation,
        userAnswers,
        correctAnswers: result.correctAnswers,
        headings: data.task.headings,
      });
    }
    setIsChecking(false);
    setIsChecked(true);
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
        explanation={explanationData}
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
