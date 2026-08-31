import { z } from "zod";
import {
  DIAGNOSTICS_VERSION,
  part1Questions,
  part2Questions,
} from "@/shared/diagnostics-questions";
import { grammarQuestions } from "./diagnostics-questions";
import type { DiagnosticsInput } from "./diagnostics-schema";

export const diagnosticsSubmissionSchema = z
  .object({
    version: z.literal(DIAGNOSTICS_VERSION, {
      errorMap: () => ({
        message:
          "Версия диагностики изменилась. Обнови страницу и попробуй снова.",
      }),
    }),
    part1: z
      .array(
        z
          .object({
            id: z.number().int(),
            userAnswers: z.array(z.string().max(120)).max(4),
          })
          .strict(),
      )
      .length(part1Questions.length),
    part2: z
      .array(
        z
          .object({
            id: z.number().int(),
            userTranslation: z.string().max(1500),
          })
          .strict(),
      )
      .length(part2Questions.length),
  })
  .strict()
  .superRefine((input, ctx) => {
    for (const [key, questions] of [
      ["part1", part1Questions],
      ["part2", part2Questions],
    ] as const) {
      const ids = new Set(input[key].map((task) => task.id));
      if (
        ids.size !== questions.length ||
        questions.some((task) => !ids.has(task.id))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: "Неверный список заданий. Обнови страницу.",
        });
      }
    }
    for (const task of input.part1) {
      const question = grammarQuestions.find(
        (question) => question.id === task.id,
      );
      if (
        question &&
        task.userAnswers.length > question.correctAnswers.length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["part1"],
          message: "Слишком много ответов для задания.",
        });
      }
    }
  });
export type DiagnosticsSubmission = z.infer<typeof diagnosticsSubmissionSchema>;
export const normalizeGrammarAnswer = (answer: string) =>
  answer
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");

export function prepareDiagnostics(
  submission: DiagnosticsSubmission,
): DiagnosticsInput {
  const input = diagnosticsSubmissionSchema.parse(submission);
  return {
    part1: grammarQuestions.map((question) => {
      const answers = input.part1.find(
        (task) => task.id === question.id,
      )!.userAnswers;
      return {
        ...question,
        // Preserve exactly what was typed for display; normalize only for comparison.
        userAnswers: question.correctAnswers.map(
          (_, index) => answers[index] ?? "",
        ),
        checkResults: question.correctAnswers.map((accepted, index) => {
          const answer = normalizeGrammarAnswer(answers[index] ?? "");
          return (
            !!answer &&
            accepted.some((value) => normalizeGrammarAnswer(value) === answer)
          );
        }),
      };
    }),
    part2: part2Questions.map((question) => ({
      ...question,
      text: question.text.replace(/\*\*/g, ""),
      userTranslation: input.part2.find((task) => task.id === question.id)!
        .userTranslation,
    })),
  };
}
