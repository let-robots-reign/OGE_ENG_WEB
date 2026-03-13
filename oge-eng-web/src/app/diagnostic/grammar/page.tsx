"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
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
import { TrainingHeader } from "@/app/_components/TrainingHeader";
import { ReactDOMServer } from "next/dist/server/route-modules/app-page/vendored/ssr/entrypoints";

interface Answers {
  part1: Record<number, string[]>;
  part2: Record<number, string>;
}

// Define the expected API response structure
interface ApiFeedbackResponse {
  feedback: string;
  error?: string;
  details?: string;
}

// Helper function to parse custom tags and replace them with HTML spans
const processFeedback = (text: string): string => {
  if (!text) return "";
  return text
    .replace(
      /CORRECT\[(.*?)\]/g,
      `<span class="${styles.correctAnswer}">$1</span>`,
    )
    .replace(
      /INCORRECT\[(.*?)\]/g,
      `<span class="${styles.incorrectAnswer}">$1</span>`,
    );
};

export default function GrammarDiagnosticPage() {
  const router = useRouter();
  const [currentPart, setCurrentPart] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    part1: {},
    part2: {},
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  const task1Refs = useRef<Record<number, GrammarTask1Ref>>({});
  const task2Refs = useRef<Record<number, GrammarTask2Ref>>({});

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

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    const payload = {
      part1: part1Questions.map((q) => ({
        id: q.id,
        text: q.text, // The original text with blanks and hints
        userAnswers: answers.part1[q.id]?.map((a) => a || "пусто") ?? [], // The user's answers as a clean array
      })),
      part2: part2Questions.map((q) => ({
        ...q,
        text: ReactDOMServer.renderToStaticMarkup(q.text),
        userTranslation: answers.part2[q.id] ?? "пусто",
      })),
    };

    try {
      const response = await fetch("/api/groq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Use the defined type for the response body for type safety
      const result = (await response.json()) as ApiFeedbackResponse;

      if (!response.ok) {
        throw new Error(
          result.error ?? `An error occurred: ${response.statusText}`,
        );
      }

      setFeedback(result.feedback);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPart = () => {
    setCurrentPart(2);
    window.scrollTo(0, 0);
  };

  const handlePrevPart = () => {
    setCurrentPart(1);
    window.scrollTo(0, 0);
  };

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
            Часть 2: Переведите предложения
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

      {error && <p className={styles.errorText}>{error}</p>}

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
              disabled={isLoading}
            >
              {isLoading ? "Анализируем..." : "Отправить"}
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
