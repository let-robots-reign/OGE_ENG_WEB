"use client";

import { useRef, useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { TrainingPage } from "@/app/_components/TrainingPage";
import {
  WritingTask,
  type WritingTaskRef,
} from "@/app/_components/WritingTask";
import styles from "@/app/_components/TrainingPage.module.css";

export default function WritingPage() {
  const taskRef = useRef<WritingTaskRef>(null);

  const { data, isLoading } = api.training.getWritingTraining.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      gcTime: 0,
    },
  );

  console.log(data);

  const checkAnswersMutation = api.training.checkWritingTraining.useMutation();

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

    setResultText(`Ваш результат: ${result.correctCount}/${result.total}`);
    setIsChecking(false);
    setIsChecked(true);
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
          isChecking={isChecking || isChecked}
        />
      </TrainingPage>
    </main>
  );
}
