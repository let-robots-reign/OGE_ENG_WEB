import { isGapFillAnswerCorrect } from "@/app/_utils/gapFill";
import type {
  MockExamAnswer,
  MockExamResultDetails,
  MockExamResultItem,
  MockExamSlot,
  MockExamSnapshot,
  MockExamSnapshotPart,
} from "@/server/db/schema";

export const MOCK_EXAM_SECONDS = 2 * 60 * 60;

export const MOCK_EXAM_SLOT_META: Record<
  MockExamSlot,
  {
    label: string;
    kind: "audio" | "reading" | "uoe";
    topicTitle: string;
  }
> = {
  audio_1_4: {
    label: "Аудирование · Задания 1–4",
    kind: "audio",
    topicTitle: "Задания 1-4",
  },
  audio_5: {
    label: "Аудирование · Задание 5",
    kind: "audio",
    topicTitle: "Задание 5",
  },
  audio_6_11: {
    label: "Аудирование · Задания 6–11",
    kind: "audio",
    topicTitle: "Задания 6-11",
  },
  reading_12: {
    label: "Чтение · Задание 12",
    kind: "reading",
    topicTitle: "Задание 12",
  },
  reading_13_19: {
    label: "Чтение · Задания 13–19",
    kind: "reading",
    topicTitle: "Задания 13-19",
  },
  uoe_all_topics: {
    label: "Языковой материал · Задания 20-28",
    kind: "uoe",
    topicTitle: "По всем темам",
  },
  uoe_word_formation: {
    label: "Языковой материал · Задания 29-34",
    kind: "uoe",
    topicTitle: "Словообразование",
  },
};

export const MOCK_EXAM_SLOT_ORDER = Object.keys(
  MOCK_EXAM_SLOT_META,
) as MockExamSlot[];

export function getMockExamGrade(percentage: number): 2 | 3 | 4 | 5 {
  // Product default for the reduced written variant (letter/oral parts are not
  // included). Keep the thresholds centralized so an approved scale can be
  // substituted without changing API or UI code.
  if (percentage >= 85) return 5;
  if (percentage >= 65) return 4;
  if (percentage >= 50) return 3;
  return 2;
}

export function toStudentSnapshot(snapshot: MockExamSnapshot) {
  return {
    mockExam: snapshot.mockExam,
    parts: snapshot.parts.map((part) => ({
      slot: part.slot,
      label: part.label,
      kind: part.kind,
      topicTitle: part.topicTitle,
      resourceId: part.resourceId,
      taskType: part.taskType,
      total: part.total,
      audioUrl: part.audioUrl,
      questions: part.questions,
      texts: part.texts,
      headings: part.headings,
      tasks: part.tasks?.map(({ id, task, origin }) => ({
        id,
        task,
        origin,
      })),
    })),
  };
}

const normalize = (value: MockExamAnswer | undefined) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

const displayAnswer = (value: MockExamAnswer | string[] | undefined) => {
  if (Array.isArray(value)) return value.join(" / ");
  if (value === null || value === undefined || value === "")
    return "Нет ответа";
  return String(value);
};

const displayPartAnswer = (
  part: MockExamSnapshotPart,
  value: MockExamAnswer | string[] | undefined,
  index: number,
) => {
  if (typeof value !== "number") return displayAnswer(value);
  if (part.kind === "reading" && part.taskType === "true_false") {
    return ["", "True", "False", "Not stated"][value] ?? String(value);
  }
  if (part.kind === "reading" && part.taskType === "matching") {
    const heading = part.headings?.[value - 1];
    return heading ? `${value}. ${heading}` : String(value);
  }
  if (part.kind === "audio" && part.taskType === "matching") {
    const rubric = part.questions?.[value - 1];
    return typeof rubric === "string" ? `${value}. ${rubric}` : String(value);
  }
  if (part.kind === "audio" && part.taskType === "multiple_choice") {
    const question = part.questions?.[index];
    if (question && typeof question !== "string") {
      return question.options[value - 1] ?? String(value);
    }
  }
  return String(value);
};

const itemLabel = (slot: MockExamSlot, index: number) => {
  if (slot === "audio_1_4") return String(index + 1);
  if (slot === "audio_5") return String.fromCharCode(65 + index);
  if (slot === "audio_6_11") return String(index + 6);
  if (slot === "reading_12") return String.fromCharCode(65 + index);
  if (slot === "reading_13_19") return String(index + 13);
  if (slot === "uoe_all_topics") return String(index + 20);
  return String(index + 29);
};

function gradePart(
  part: MockExamSnapshotPart,
  answers: MockExamAnswer[],
): MockExamResultDetails["parts"][number] {
  let items: MockExamResultItem[] = [];

  if (part.kind === "uoe") {
    items = (part.tasks ?? []).map((task, index) => {
      const userAnswer = normalize(answers[index]);
      const acceptedAnswers = task.answer
        .split("/")
        .map(normalize)
        .filter((answer) => answer !== "");
      const isCorrect =
        userAnswer !== "" && acceptedAnswers.includes(userAnswer);
      return {
        label: itemLabel(part.slot, index),
        title: task.task,
        userAnswer: displayAnswer(userAnswer),
        correctAnswer: task.answer,
        isCorrect,
        origin: task.origin,
      };
    });
  } else {
    const correctAnswers = part.correctAnswers ?? [];
    items = correctAnswers.map((correctAnswer, index) => {
      const userAnswer = answers[index] ?? null;
      const isCorrect =
        part.kind === "audio" && part.taskType === "gap_fill"
          ? isGapFillAnswerCorrect(userAnswer, correctAnswer)
          : userAnswer !== null &&
            userAnswer !== "" &&
            Number(userAnswer) === Number(correctAnswer);
      const explanation = part.explanations?.[index];
      const question = part.questions?.[index];
      const title =
        part.kind === "reading" && part.taskType === "matching"
          ? (part.texts?.[index] ?? part.label)
          : typeof question === "string"
            ? question
            : (question?.questionText ??
              part.headings?.[index] ??
              part.texts?.[index] ??
              part.label);

      return {
        label: itemLabel(part.slot, index),
        title,
        userAnswer: displayPartAnswer(part, userAnswer, index),
        correctAnswer: displayPartAnswer(part, correctAnswer, index),
        isCorrect,
        explanation: explanation?.text,
        highlightedText: explanation?.highlightedText,
      };
    });
  }

  return {
    slot: part.slot,
    label: part.label,
    kind: part.kind,
    resourceId: part.resourceId,
    correctCount: items.filter((item) => item.isCorrect).length,
    total: items.length,
    items,
  };
}

export function gradeMockExam(
  snapshot: MockExamSnapshot,
  answers: Array<{ slot: MockExamSlot; values: MockExamAnswer[] }>,
  options: {
    attemptKey: string;
    timeSpent: number;
    timedOut: boolean;
  },
): MockExamResultDetails {
  const answersBySlot = new Map(
    answers.map((answer) => [answer.slot, answer.values]),
  );
  const parts = snapshot.parts.map((part) =>
    gradePart(part, answersBySlot.get(part.slot) ?? []),
  );
  const correctCount = parts.reduce((sum, part) => sum + part.correctCount, 0);
  const total = parts.reduce((sum, part) => sum + part.total, 0);
  const percentage = total ? Math.round((correctCount / total) * 100) : 0;

  return {
    version: 1,
    attemptKey: options.attemptKey,
    mockExam: {
      id: snapshot.mockExam.id,
      title: snapshot.mockExam.title,
    },
    correctCount,
    total,
    percentage,
    grade: getMockExamGrade(percentage),
    timeSpent: options.timeSpent,
    timedOut: options.timedOut,
    parts,
  };
}

export function isMockExamResultDetails(
  value: unknown,
): value is MockExamResultDetails {
  if (!value || typeof value !== "object") return false;
  const details = value as Partial<MockExamResultDetails>;
  return (
    details.version === 1 &&
    typeof details.attemptKey === "string" &&
    typeof details.correctCount === "number" &&
    typeof details.total === "number" &&
    Array.isArray(details.parts)
  );
}
