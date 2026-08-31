import { z } from "zod";

const part1TaskSchema = z
  .object({
    id: z.number().int(),
    text: z.string(),
    userAnswers: z.array(z.string()),
    correctAnswers: z.array(z.array(z.string().trim().min(1)).min(1)).min(1),
    checkResults: z.array(z.boolean()),
  })
  .superRefine((task, ctx) => {
    if (
      task.checkResults.length !== task.correctAnswers.length ||
      task.userAnswers.length > task.correctAnswers.length ||
      task.checkResults.some(
        (correct, i) => correct && !task.userAnswers[i]?.trim(),
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Inconsistent Part 1 blank arrays",
      });
    }
  });

export const diagnosticsInputSchema = z
  .object({
    part1: z.array(part1TaskSchema),
    part2: z.array(
      z.object({
        id: z.number().int(),
        text: z.string(),
        userTranslation: z.string(),
        topics: z.array(z.string().trim().min(1)),
      }),
    ),
  })
  .superRefine((input, ctx) => {
    for (const part of ["part1", "part2"] as const) {
      if (
        new Set(input[part].map((task) => task.id)).size !== input[part].length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [part],
          message: "Duplicate task IDs",
        });
      }
    }
  });

export type DiagnosticsInput = z.infer<typeof diagnosticsInputSchema>;
export type Part1Mistake = {
  id: number;
  blankIndex: number;
  text: string;
  userAnswer: string;
  expectedAnswer: string;
};

const prose = z.string().trim().min(1).max(1500);
export const translationsSchema = z
  .object({
    items: z.array(
      z
        .object({
          id: z.number().int(),
          correct: z.boolean(),
          correctedTranslation: prose.nullable(),
          topic: prose.nullable(),
          explanation: prose,
          example: prose.nullable(),
        })
        .strict(),
    ),
  })
  .strict();
export type Explanation = {
  id: number;
  blankIndex: number;
  topic: string;
  explanation: string;
};
export type TranslationEvaluation = z.infer<
  typeof translationsSchema
>["items"][number];

// Provider schemas use the common JSON Schema subset; Zod and coverage checks
// below enforce additional application constraints after generation.
function itemsSchema(properties: Record<string, unknown>) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties,
          required: Object.keys(properties),
        },
      },
    },
  };
}
const string = { type: "string" };
const nullableString = { type: ["string", "null"] };
export const translationsJsonSchema = itemsSchema({
  id: { type: "integer" },
  correct: { type: "boolean" },
  correctedTranslation: nullableString,
  topic: nullableString,
  explanation: string,
  example: nullableString,
});

export function translationSchemaFor(tasks: DiagnosticsInput["part2"]) {
  const topics = [...new Set(tasks.flatMap((task) => task.topics))];
  const allowNull = tasks.some((task) => !task.topics.length);
  return itemsSchema({
    ...translationsJsonSchema.properties.items.items.properties,
    id: { type: "integer", enum: tasks.map((task) => task.id) },
    topic: {
      type: allowNull ? ["string", "null"] : "string",
      enum: allowNull ? [...topics, null] : topics,
    },
  });
}

export function parseTranslations(
  content: string,
  expected: DiagnosticsInput["part2"],
) {
  // Only complete JSON envelopes are readable. Validate each item separately:
  // a bad answer must not discard unrelated, usable evaluations.
  const { items } = z
    .object({ items: z.array(z.unknown()) })
    .strict()
    .parse(JSON.parse(content));
  const tasks = new Map(expected.map((task) => [task.id, task]));
  const ids = items.map((item) =>
    z.object({ id: z.number().int() }).safeParse(item),
  );
  const counts = new Map<number, number>();
  for (const id of ids) {
    if (id.success) counts.set(id.data.id, (counts.get(id.data.id) ?? 0) + 1);
  }
  const valid: TranslationEvaluation[] = [];
  for (const raw of items) {
    const identity = z.object({ id: z.number().int() }).safeParse(raw);
    if (!identity.success || counts.get(identity.data.id) !== 1) continue;
    const task = tasks.get(identity.data.id);
    if (!task) continue;
    const record = raw as Record<string, unknown>;
    // Topic metadata does not determine the verdict. Unknown/missing labels
    // are omitted from both the displayed task and topic statistics.
    const topic =
      typeof record.topic === "string" && task.topics.includes(record.topic)
        ? record.topic
        : null;
    const parsed = translationsSchema.shape.items.element.safeParse({
      ...record,
      topic,
    });
    if (!parsed.success) continue;
    const item = parsed.data;
    if (
      (!task.userTranslation.trim() && item.correct) ||
      (!item.correct && (!item.correctedTranslation || !item.example)) ||
      (item.correct &&
        (item.correctedTranslation !== null || item.example !== null))
    )
      continue;
    valid.push(item);
  }
  return valid;
}
