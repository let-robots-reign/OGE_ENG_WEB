import { randomUUID } from "node:crypto";
import { grammarRules } from "./diagnostics-rules";
import { translationReferences } from "./diagnostics-translations";
import {
  diagnosticsInputSchema,
  translationSchemaFor,
  parseTranslations,
  type DiagnosticsInput,
  type Part1Mistake,
  type Explanation,
  type TranslationEvaluation,
} from "./diagnostics-schema";
import {
  DIAGNOSTICS_TIMEOUT_MS,
  generateStructured,
  type ProviderReceipt,
  type ProviderAttempt,
} from "./diagnostics-provider";
import { translationEvaluationPrompt } from "./prompts/diagnostics";

export function extractPart1Mistakes(
  input: DiagnosticsInput["part1"],
): Part1Mistake[] {
  return input.flatMap((task) =>
    task.correctAnswers.flatMap((answers, blankIndex) =>
      task.checkResults[blankIndex]
        ? []
        : [
            {
              id: task.id,
              blankIndex,
              text: plainSentence(task.text),
              userAnswer: task.userAnswers[blankIndex] ?? "",
              expectedAnswer: answers[0]!,
            },
          ],
    ),
  );
}

export type BatchCheckpoint = {
  key: string;
  items: TranslationEvaluation[];
  source?: ProviderReceipt & { runId?: string };
};
export type DiagnosticsOptions = {
  runId?: string;
  cachedBatches?: unknown;
  checkpoint?: (batch: BatchCheckpoint) => Promise<void>;
  onAttempt?: (attempt: ProviderAttempt) => Promise<void>;
};
export async function checkGrammar(
  input: DiagnosticsInput,
  options: DiagnosticsOptions = {},
) {
  const validated = diagnosticsInputSchema.parse(input);
  const explanations = extractPart1Mistakes(validated.part1).map((item) => {
    const rule = grammarRules[item.id]?.[item.blankIndex];
    if (!rule) throw new Error("Missing fixed grammar explanation");
    return { id: item.id, blankIndex: item.blankIndex, ...rule };
  });
  const translations = await evaluatePart2(validated.part2, {
    ...options,
    runId: options.runId ?? randomUUID(),
  });
  return {
    feedback: renderDiagnosticsFeedback(validated, explanations, translations),
    complete: validated.part2.every((task) =>
      translations.some((item) => item.id === task.id),
    ),
  };
}

async function evaluatePart2(
  tasks: DiagnosticsInput["part2"],
  options: DiagnosticsOptions,
) {
  const deadline = Date.now() + DIAGNOSTICS_TIMEOUT_MS;
  const results: TranslationEvaluation[] = [];
  for (const task of tasks.filter((task) => !task.userTranslation.trim())) {
    const reference = translationReferences[task.id];
    if (!reference) throw new Error("Missing fixed translation reference");
    results.push({
      id: task.id,
      correct: false,
      correctedTranslation: reference,
      topic: task.topics[0] ?? null,
      explanation:
        "Ты пропустил задание. Изучи пример перевода и попробуй перевести предложение самостоятельно.",
      example: reference,
    });
  }
  const answered = tasks.filter((task) => task.userTranslation.trim());
  if (!answered.length) return results;

  // Reuse independently validated items; retry all remaining translations in
  // one request. Legacy five-item checkpoints are ignored.
  const key = "part2";
  const cached = options.cachedBatches;
  if (cached && typeof cached === "object" && key in cached) {
    try {
      const value = cached[key];
      const items =
        value && typeof value === "object" && "items" in value
          ? value.items
          : value;
      results.push(...parseTranslations(JSON.stringify({ items }), answered));
    } catch {
      // An unreadable checkpoint cannot be reused.
    }
  }
  const remaining = answered.filter(
    (task) => !results.some((item) => item.id === task.id),
  );
  if (!remaining.length) return results;
  let source: BatchCheckpoint["source"];
  let items: TranslationEvaluation[];
  try {
    items = await generateStructured(
      {
        name: "part2_translations",
        runId: options.runId,
        batchKey: key,
        deadline,
        onAttempt: options.onAttempt,
        onCompleted: (receipt) => {
          source = { ...receipt, runId: options.runId };
        },
        prompt: translationEvaluationPrompt,
        input: {
          tasks: remaining.map((task) => ({
            ...task,
            text: plainSentence(task.text),
          })),
        },
        schema: translationSchemaFor(remaining),
      },
      (content) => {
        const valid = parseTranslations(content, remaining);
        if (!valid.length) throw new Error("Missing translation evaluations");
        return valid;
      },
    );
  } catch {
    // Provider exhaustion affects only unanswered evaluations, never Part 1
    // or previously validated translations. Persistence errors still surface.
    return results;
  }
  results.push(...items);
  if (options.checkpoint)
    await options.checkpoint({
      key,
      items: results.filter((item) =>
        answered.some((task) => task.id === item.id),
      ),
      source,
    });
  return results;
}

function plainSentence(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

// The existing UI supports Markdown, raw HTML and CORRECT[...] markers.
// Encode dynamic punctuation so student/model text cannot create any of these.
function literal(text: string) {
  return text.replace(/[!-/:-@\[-`{-~]/g, (char) => `&#${char.charCodeAt(0)};`);
}
function marker(kind: "CORRECT" | "INCORRECT", text: string) {
  return `${kind}[${literal(text.replace(/[\r\n]+/g, " "))}]`;
}

export function renderDiagnosticsFeedback(
  input: DiagnosticsInput,
  explanations: Explanation[],
  translations: TranslationEvaluation[],
) {
  const explanationMap = new Map(
    explanations.map((item) => [`${item.id}:${item.blankIndex}`, item]),
  );
  const translationMap = new Map(translations.map((item) => [item.id, item]));
  const blankCount = input.part1.reduce(
    (sum, task) => sum + task.checkResults.length,
    0,
  );
  const correctBlanks = input.part1.reduce(
    (sum, task) => sum + task.checkResults.filter(Boolean).length,
    0,
  );
  const skippedBlanks = input.part1.reduce(
    (sum, task) =>
      sum +
      task.correctAnswers.filter((_, i) => !task.userAnswers[i]?.trim()).length,
    0,
  );
  const correctTranslations = translations.filter(
    (item) => item.correct,
  ).length;
  const skippedTranslations = input.part2.filter(
    (task) => !task.userTranslation.trim(),
  ).length;
  const uncheckedTranslations = input.part2.filter(
    (task) => task.userTranslation.trim() && !translationMap.has(task.id),
  ).length;
  const evidence = new Map<
    string,
    { correct: number; incorrect: number; skipped: number }
  >();
  const addEvidence = (
    topic: string,
    status: "correct" | "incorrect" | "skipped",
  ) => {
    const counts = evidence.get(topic) ?? {
      correct: 0,
      incorrect: 0,
      skipped: 0,
    };
    counts[status]++;
    evidence.set(topic, counts);
  };
  for (const task of input.part1) {
    task.checkResults.forEach((correct, index) => {
      const topic = grammarRules[task.id]?.[index]?.topic;
      if (topic)
        addEvidence(
          topic,
          !task.userAnswers[index]?.trim()
            ? "skipped"
            : correct
              ? "correct"
              : "incorrect",
        );
    });
  }
  for (const task of input.part2) {
    const result = translationMap.get(task.id);
    if (!task.userTranslation.trim()) {
      for (const topic of task.topics) addEvidence(topic, "skipped");
    } else if (result?.topic) {
      // Only claim evidence for the topic actually evaluated, not every topic
      // listed in the question (a valid paraphrase may avoid some structures).
      addEvidence(result.topic, result.correct ? "correct" : "incorrect");
    }
  }
  const strong = [...evidence].filter(
    ([, value]) => value.correct > 0 && value.incorrect === 0,
  );
  const weak = [...evidence].filter(
    ([, value]) => value.incorrect > 0 && value.correct === 0,
  );
  const mixed = [...evidence].filter(
    ([, value]) => value.incorrect > 0 && value.correct > 0,
  );
  const unassessed = [...evidence].filter(
    ([, value]) => value.correct === 0 && value.incorrect === 0,
  );
  const reviewTopics = [...weak, ...mixed].map(([topic]) => topic);
  const evidenceLine = ([topic, counts]: (typeof strong)[number]) =>
    `- ${literal(topic)}: правильно — ${counts.correct}, ошибки — ${counts.incorrect}, пропуски — ${counts.skipped}.`;
  const lines = [
    ...(uncheckedTranslations
      ? [
          "**Проверка выполнена частично.** Часть 1 готова. Некоторые переводы пока не удалось проверить — это не ошибки и не пропуски. Ты можешь повторить проверку оставшихся переводов.",
          "",
        ]
      : []),
    "## Общий вывод",
    "",
    `В части 1 правильно заполнено ${correctBlanks} из ${blankCount} пропусков; без ответа — ${skippedBlanks}.`,
    `В части 2 правильных переводов: ${correctTranslations} из ${input.part2.length}; без ответа — ${skippedTranslations}; не удалось проверить — ${uncheckedTranslations}.`,
    "Статистика тем учитывает только доступные оценки с подходящей меткой темы; это не полная оценка владения каждой темой.",
    "Этот результат показывает, какие задания тебе удаются и что стоит повторить; он не определяет твой уровень CEFR.",
    "",
    "## Детальный разбор заданий",
    "",
    "### Часть 1",
    "",
  ];
  for (const task of input.part1) {
    lines.push(
      `Задание ${task.id}.`,
      "",
      "Оригинальное предложение:",
      literal(plainSentence(task.text)),
      "",
      "Твой ответ:",
      task.userAnswers.some((answer) => answer.trim())
        ? task.correctAnswers
            .map((_, i) =>
              literal(
                task.userAnswers[i]?.trim() ? task.userAnswers[i] : "пропуск",
              ),
            )
            .join("; ")
        : "Ответ пропущен.",
      "",
      "Результат:",
    );
    if (task.checkResults.every(Boolean)) {
      lines.push(
        marker("CORRECT", "Правильно"),
        "Ты правильно заполнил все пропуски.",
      );
    } else {
      lines.push(
        task.checkResults.some(
          (correct, index) => !correct && task.userAnswers[index]?.trim(),
        )
          ? marker("INCORRECT", "Ошибка")
          : "Есть пропуски без ответа.",
      );
      task.correctAnswers.forEach((answers, i) => {
        if (task.checkResults[i]) return;
        const explanation = explanationMap.get(`${task.id}:${i}`);
        if (!explanation) throw new Error("Missing validated explanation");
        lines.push(
          `Пропуск ${i + 1}: ${marker("INCORRECT", task.userAnswers[i]?.trim() ? task.userAnswers[i] : "пропуск")} → ${marker("CORRECT", answers[0]!)}`,
          `Тема: ${literal(explanation.topic)}. ${literal(explanation.explanation)}`,
        );
      });
      const sentence = plainSentence(task.text);
      const blanks = /_{2,}(?:\s*\([^)]*\))?/g;
      if (
        [...sentence.matchAll(blanks)].length === task.correctAnswers.length
      ) {
        let i = 0;
        const corrected = sentence.replace(blanks, () => {
          const index = i++;
          return task.checkResults[index]
            ? task.userAnswers[index]!
            : task.correctAnswers[index]![0]!;
        });
        lines.push("Исправленное предложение:", literal(corrected));
      }
    }
    lines.push("");
  }
  lines.push("### Часть 2", "");
  for (const task of input.part2) {
    const result = translationMap.get(task.id);
    lines.push(
      `Задание ${task.id}.`,
      "",
      "Предложение:",
      literal(plainSentence(task.text)),
      "",
      "Твой ответ:",
      task.userTranslation.trim()
        ? literal(task.userTranslation)
        : "Ответ пропущен.",
      "",
    );
    if (!result) {
      lines.push(
        "Не удалось проверить.",
        "Твой ответ сохранён. Оценка и исправление пока недоступны; повтори проверку позднее.",
        "",
      );
      continue;
    }
    if (result.correct) lines.push(marker("CORRECT", "Правильно"));
    else {
      if (task.userTranslation.trim())
        lines.push(marker("INCORRECT", "Ошибка"));
      lines.push("Правильный ответ:", literal(result.correctedTranslation!));
    }
    if (result.topic) lines.push(`Тема: ${literal(result.topic)}.`);
    // Correct answers need no generated teaching prose: a sound verdict must
    // not be accompanied by an invented tense/rule explanation.
    lines.push(
      result.correct
        ? "Твой перевод грамматически верен и передаёт смысл исходного предложения."
        : literal(result.explanation),
    );
    if (result.example) lines.push(`Пример: ${literal(result.example)}`);
    lines.push("");
  }
  lines.push(
    "## Сильные стороны",
    "",
    "Темы с правильными ответами и без обнаруженных ошибок в этой работе:",
    ...strong.map(evidenceLine),
  );
  if (!strong.length) lines.push("Пока недостаточно данных.");
  lines.push(
    "",
    "## Слабые стороны",
    "",
    "Темы с ошибками и пока без правильных ответов в этой работе:",
    ...weak.map(evidenceLine),
  );
  if (!weak.length) lines.push("Таких тем в этой работе нет.");
  lines.push("", "## Смешанные результаты", "", ...mixed.map(evidenceLine));
  if (!mixed.length)
    lines.push("Тем с сочетанием правильных и ошибочных ответов нет.");
  lines.push(
    "",
    "## Темы без оценки",
    "",
    "Пропуск не доказывает, что ты не знаешь правило.",
    ...unassessed.map(evidenceLine),
  );
  if (!unassessed.length)
    lines.push("Нет тем, представленных только пропущенными ответами.");
  lines.push(
    "",
    "## Итоговое заключение и рекомендации",
    "",
    reviewTopics.length
      ? `Повтори темы: ${reviewTopics.map(literal).join(", ")}. Сделай несколько упражнений на выбор формы и переведи 3–5 коротких предложений по каждой теме.`
      : "Продолжай практиковаться: составляй свои предложения и выполняй короткие переводы.",
    "Вернись к пропущенным заданиям, если они есть. Регулярная практика поможет тебе увереннее применять правила.",
  );
  return lines.join("\n");
}
