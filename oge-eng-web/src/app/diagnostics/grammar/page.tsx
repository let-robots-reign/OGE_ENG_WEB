"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { api } from "@/trpc/react";
import { part1Questions, part2Questions } from "./data";
import {
  GrammarTask1,
  type GrammarTask1Ref,
} from "@/app/_components/diagnostics/initial/GrammarTask1";
import {
  GrammarTask2,
  type GrammarTask2Ref,
} from "@/app/_components/diagnostics/initial/GrammarTask2";
import styles from "@/app/_components/TrainingPage.module.css";
import homeStyles from "@/app/page.module.css";
import headerStyles from "@/app/_components/Header.module.css";
import { TrainingHeader } from "@/app/_components/TrainingHeader";
import { useSession } from "next-auth/react";
import { Modal } from "@/app/_components/Modal";
import { ReactDOMServer } from "next/dist/server/route-modules/app-page/vendored/ssr/entrypoints";

interface Answers {
  part1: Record<number, string[]>;
  part2: Record<number, string>;
}

const processFeedback = (text: string): string => {
  if (!text) return "";
  return text
    .replace(
      /INCORRECT\[(.*?)\]/g,
      `<span class="${styles.incorrectAnswer}">$1</span>`,
    )
    .replace(
      /CORRECT\[(.*?)\]/g,
      `<span class="${styles.correctAnswer}">$1</span>`,
    );
};

export default function GrammarDiagnosticPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [currentPart, setCurrentPart] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    part1: {},
    part2: {},
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");

  const task1Refs = useRef<Record<number, GrammarTask1Ref>>({});
  const task2Refs = useRef<Record<number, GrammarTask2Ref>>({});

  const logResultMutation = api.training.logResult.useMutation();

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowModal(true);
    }
  }, [status]);

  const checkGrammarMutation = api.diagnostics.checkGrammar.useMutation({
    onSuccess: (data) => {
      setFeedback(data.feedback);
      setIsSubmitted(true);
      window.scrollTo(0, 0);

      if (session?.user) {
        logResultMutation.mutate({
          /*
          TODO: list of diagnostics is not stored in the DB yet
          Setting activityId: 1 here to satisfy the table's schema
          When there are more diagnostics types and they are stored in the DB,
          set ID of the current diagnostics here
           */
          activityId: 1,
          activityType: "diagnostics",
          result: "",
          details: { userAnswers: answers, feedback: data.feedback },
        });
      }
    },
  });

  const handlePart1AnswerChange = (id: number, answer: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      part1: { ...prev.part1, [id]: answer },
    }));
  };

  const handlePart2AnswerChange = (id: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      part2: { ...prev.part2, [id]: answer },
    }));
  };

  const normalizeAnswer = (answer: string) =>
    answer.toLowerCase().trim().replace(/’/g, "'").replace(/\s+/g, " ");

  const handleSubmit = () => {
    const payload = {
      part1: part1Questions.map((q) => ({
        id: q.id,
        text: q.text,
        userAnswers:
          answers.part1[q.id]?.map((a) => normalizeAnswer(a) || "") ?? [],
        correctAnswers: q.correctAnswers,
        checkResults: q.correctAnswers.map((corA, index) =>
          corA.includes(answers.part1[q.id]?.[index] ?? ""),
        ),
      })),
      part2: part2Questions.map((q) => ({
        ...q,
        text: ReactDOMServer.renderToStaticMarkup(q.text),
        userTranslation: answers.part2[q.id] ?? "",
      })),
    };
    checkGrammarMutation.mutate(payload);
  };

  const handleNextPart = () => {
    setCurrentPart(2);
    window.scrollTo(0, 0);
  };

  const handlePrevPart = () => {
    setCurrentPart(1);
    window.scrollTo(0, 0);
  };

  if (status === "loading") {
    return <></>;
  }

  if (showModal) {
    return (
      <Modal
        title="Доступно только авторизованным пользователям"
        onClose={() => router.push("/")}
        className={homeStyles.loginRequiredModal}
      >
        <div className={headerStyles.modalActions}>
          <button
            onClick={() => router.push("/auth/signin")}
            className={`${headerStyles.btn} ${headerStyles.primary}`}
          >
            Войти
          </button>
          <button
            onClick={() => router.push("/")}
            className={`${headerStyles.btn} ${headerStyles.secondary}`}
          >
            На главную
          </button>
        </div>
      </Modal>
    );
  }

  if (isSubmitted) {
    const processedFeedback = processFeedback(feedback);
    return (
      <main className={styles.trainingPage}>
        <TrainingHeader topic="Результаты диагностики" />
        <div className={styles.resultsContainer}>
          <h2 className={styles.sectionTitle}>Ваш персональный фидбек</h2>
          <div className={styles.feedbackContent}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {processedFeedback}
            </ReactMarkdown>
          </div>
          <div className={styles.buttonsGroup}>
            <button
              className={`${styles.btn} ${styles.secondary}`}
              onClick={() => router.push("/")}
            >
              На главную
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.trainingPage}>
      <TrainingHeader topic="Грамматическая диагностика" />

      {currentPart === 1 && (
        <div>
          <h2 className={styles.sectionTitle}>
            Часть 1<br />
            <i>
              Complete the sentences with the correct form of the word in
              brackets
            </i>
          </h2>

          {part1Questions.map((q) => (
            <GrammarTask1
              key={q.id}
              ref={(el) => {
                if (el) task1Refs.current[q.id] = el;
              }}
              id={q.id}
              question={q.text}
              onAnswerChange={handlePart1AnswerChange}
            />
          ))}
        </div>
      )}

      {currentPart === 2 && (
        <div>
          <h2 className={styles.sectionTitle}>
            Часть 2
            <br />
            <i>
              Translate the following sentences into English. Pay attention to
              the grammar topics <b>in bold</b>.
            </i>
          </h2>
          {part2Questions.map((q) => (
            <GrammarTask2
              key={q.id}
              ref={(el) => {
                if (el) task2Refs.current[q.id] = el;
              }}
              id={q.id}
              question={q.text}
              onAnswerChange={handlePart2AnswerChange}
            />
          ))}
        </div>
      )}

      {checkGrammarMutation.error && (
        <p className={styles.errorText}>{checkGrammarMutation.error.message}</p>
      )}

      <div className={styles.buttonsGroup}>
        {currentPart === 1 && (
          <>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={handleNextPart}
            >
              Далее
            </button>
            <button
              className={`${styles.btn} ${styles.secondary}`}
              onClick={() => router.push("/")}
            >
              Выход
            </button>
          </>
        )}
        {currentPart === 2 && (
          <>
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={handleSubmit}
              disabled={checkGrammarMutation.isPending}
            >
              {checkGrammarMutation.isPending ? "Анализируем..." : "Отправить"}
            </button>
            <button
              className={`${styles.btn} ${styles.secondary}`}
              onClick={handlePrevPart}
            >
              Назад
            </button>
          </>
        )}
      </div>
    </main>
  );
}
