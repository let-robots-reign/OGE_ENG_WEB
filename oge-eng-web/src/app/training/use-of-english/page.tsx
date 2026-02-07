"use client";

import { useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { TrainingPage } from "@/app/_components/TrainingPage";
import {
  UseOfEnglishCard,
  type UseOfEnglishCardRef,
} from "@/app/_components/UseOfEnglishCard";
import styles from "@/app/_components/TrainingPage.module.css";

export default function UseOfEnglishPage() {
  const searchParams = useSearchParams();
  const topicId = Number(searchParams.get("topic"));

  const cardRefs = useRef<UseOfEnglishCardRef[]>([]);

  const { data, isLoading } = api.training.getUoeTraining.useQuery(
    { topicId },
    {
      enabled: !!topicId,
      refetchOnWindowFocus: false,
      gcTime: 0,
    },
  );

  const checkAnswersMutation = api.training.checkUoeTraining.useMutation();

  const [isChecking, setIsChecking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [resultText, setResultText] = useState("");

  const handleCheck = async () => {
    setIsChecking(true);
    const answers = cardRefs.current.map((ref) => ref.getAnswerData());
    const result = await checkAnswersMutation.mutateAsync({ answers });

    result.results.forEach((res) => {
      const cardRef = cardRefs.current.find(
        (ref) => ref.getAnswerData().id === res.id,
      );
      cardRef?.setIsCorrect(res.isCorrect);
      if (!res.isCorrect) {
        const task = data?.tasks.find((t) => t.id === res.id);
        if (task) {
          cardRef?.setQuestion(
            task.task.replace(
              "_".repeat(18),
              `<strong>${res.correctAnswer}</strong>`,
            ),
          );
        }
      }
    });

    setResultText(`Ваш результат: ${result.correctCount}/${result.total}`);
    setIsChecking(false);
    setIsChecked(true);
  };

  const instruction = useMemo(
    () => (
      <>
        <p>
          Преобразуйте слова, напечатанные заглавными буквами так, чтобы они
          грамматически и лексически соответствовали содержанию текстов.
        </p>
        <p>Заполните пропуски полученными словами.</p>
        <p>
          Слова вводите заглавными буквами, без пробелов, как в экзаменационном
          бланке.
        </p>
        <p>Глагольные формы вводите без сокращений.</p>
      </>
    ),
    [],
  );

  if (!isLoading && !data) {
    return <div>Не удалось загрузить задание. Попробуйте еще раз.</div>;
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
        {data.tasks.map((task, i) => (
          <UseOfEnglishCard
            key={task.id}
            ref={(el) => {
              if (el) cardRefs.current[i] = el;
            }}
            id={task.id}
            question={task.task}
            origin={task.origin}
          />
        ))}
      </TrainingPage>
    </main>
  );
}
