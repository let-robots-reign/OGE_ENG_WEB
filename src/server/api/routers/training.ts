import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  activityTypeEnum,
  audioTasks,
  readingTasks,
  trainingTopics,
  uoeTaskChains,
  uoeTasks,
  userResults,
  writingTasks,
} from "@/server/db/schema";
import { shuffle } from "@/app/_utils/shuffle";
import { isGapFillAnswerCorrect } from "@/app/_utils/gapFill";
import { and, eq, inArray, isNotNull, notInArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

type AudioTask = typeof audioTasks.$inferSelect;
type ReadingTask = typeof readingTasks.$inferSelect;
type ExamAnswer = number | string | null;

type UoeTaskChainForValidation = {
  items: Array<{
    position: number;
    task: {
      isDeleted: boolean;
      topic: {
        category: string;
        isActive: boolean;
        title: string;
      } | null;
    };
  }>;
};

function filterValidTasksChain<T extends UoeTaskChainForValidation>(
  chains: T[],
) {
  return chains.filter(
    (chain) =>
      chain.items.length === 9 &&
      chain.items.every((item, index) => {
        const topic = item.task.topic;

        return (
          item.position === index + 1 &&
          !item.task.isDeleted &&
          topic !== null &&
          topic.isActive &&
          topic.category === "use-of-english" &&
          topic.title !== "Словообразование"
        );
      }),
  );
}

function toPublicUoeTask(task: typeof uoeTasks.$inferSelect) {
  return {
    id: task.id,
    task: task.task,
    origin: task.origin,
    topicId: task.topicId,
    isDeleted: task.isDeleted,
  };
}

function gradeAudioTask(task: AudioTask, answers: ExamAnswer[]) {
  const correctAnswers = task.answers ?? [];
  const results =
    task.taskType === "gap_fill"
      ? correctAnswers.map((rawCorrect, i) =>
          isGapFillAnswerCorrect(answers[i], rawCorrect),
        )
      : correctAnswers.map((correct, i) => {
          const userAnswer = answers[i];
          if (userAnswer === null || userAnswer === undefined) return false;
          return Number(userAnswer) === Number(correct);
        });

  return {
    correctAnswers,
    results,
    correctCount: results.filter(Boolean).length,
    total: correctAnswers.length,
    explanation: task.explanations ?? [],
  };
}

function gradeReadingTask(task: ReadingTask, answers: ExamAnswer[]) {
  const correctAnswers = task.answers ?? [];
  const results = answers.map(
    (answer, i) => typeof answer === "number" && answer === correctAnswers[i],
  );

  return {
    correctAnswers,
    results,
    correctCount: results.filter(Boolean).length,
    total: correctAnswers.length,
    explanation: task.explanations ?? [],
  };
}

const examCategorySchema = z.enum(["audio", "reading"]);
const examAnswersSchema = z
  .array(z.union([z.number(), z.string().max(100)]).nullable())
  .max(20);

const EXAM_TOPIC_ORDER: Record<"audio" | "reading", readonly string[]> = {
  audio: ["Задания 1-4", "Задание 5", "Задания 6-11"],
  reading: ["Задание 12", "Задания 13-19"],
};

export const trainingRouter = createTRPCRouter({
  getExamSection: publicProcedure
    .input(z.object({ category: examCategorySchema }))
    .query(async ({ ctx, input }) => {
      const topics = await ctx.db.query.trainingTopics.findMany({
        where: and(
          eq(trainingTopics.category, input.category),
          eq(trainingTopics.isActive, true),
        ),
      });
      const topicOrder = new Map(
        EXAM_TOPIC_ORDER[input.category].map((title, index) => [title, index]),
      );
      topics.sort((left, right) => {
        const leftOrder = topicOrder.get(left.title) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder =
          topicOrder.get(right.title) ?? Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder || left.id - right.id;
      });

      const steps = await Promise.all(
        topics.map(async (topic) => {
          if (input.category === "audio") {
            const task = await ctx.db
              .select({
                id: audioTasks.id,
                audioUrl: audioTasks.audioUrl,
                topicId: audioTasks.topicId,
                taskType: audioTasks.taskType,
                questions: audioTasks.questions,
                total:
                  sql<number>`jsonb_array_length(${audioTasks.answers})`.mapWith(
                    Number,
                  ),
              })
              .from(audioTasks)
              .where(
                and(
                  eq(audioTasks.topicId, topic.id),
                  eq(audioTasks.isDeleted, false),
                ),
              )
              .orderBy(sql`RANDOM()`)
              .limit(1)
              .then((rows) => rows[0]);

            return task
              ? {
                  topicTitle: topic.title,
                  task: { ...task, questions: task.questions ?? [] },
                }
              : null;
          }

          const task = await ctx.db
            .select({
              id: readingTasks.id,
              topicId: readingTasks.topicId,
              taskType: readingTasks.taskType,
              texts: readingTasks.texts,
              headings: readingTasks.headings,
              total:
                sql<number>`jsonb_array_length(${readingTasks.answers})`.mapWith(
                  Number,
                ),
            })
            .from(readingTasks)
            .where(
              and(
                eq(readingTasks.topicId, topic.id),
                eq(readingTasks.isDeleted, false),
              ),
            )
            .orderBy(sql`RANDOM()`)
            .limit(1)
            .then((rows) => rows[0]);

          return task
            ? {
                topicTitle: topic.title,
                task: {
                  ...task,
                  texts: task.texts ?? [],
                  headings: task.headings ?? [],
                },
              }
            : null;
        }),
      );

      const availableSteps = steps.filter((step) => step !== null);
      if (
        availableSteps.length === 0 ||
        availableSteps.length !== topics.length
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "A complete exam section could not be formed.",
        });
      }

      return { category: input.category, steps: availableSteps };
    }),

  checkExamSection: publicProcedure
    .input(
      z.object({
        category: examCategorySchema,
        steps: z
          .array(z.object({ taskId: z.number(), answers: examAnswersSchema }))
          .min(1)
          .max(10),
        timeSpent: z.number().int().min(0).max(1800),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const taskIds = input.steps.map((step) => step.taskId);

      if (new Set(taskIds).size !== taskIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Duplicate exam tasks are not allowed.",
        });
      }

      const tasks =
        input.category === "audio"
          ? await ctx.db.query.audioTasks.findMany({
              where: and(
                inArray(audioTasks.id, taskIds),
                eq(audioTasks.isDeleted, false),
              ),
            })
          : await ctx.db.query.readingTasks.findMany({
              where: and(
                inArray(readingTasks.id, taskIds),
                eq(readingTasks.isDeleted, false),
              ),
            });

      if (tasks.length !== taskIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more exam tasks could not be found.",
        });
      }

      const stepResults = input.steps.map((step) => {
        const task = tasks.find((candidate) => candidate.id === step.taskId);
        if (!task) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exam task not found for checking.",
          });
        }

        const grade =
          input.category === "audio"
            ? gradeAudioTask(task as AudioTask, step.answers)
            : gradeReadingTask(task as ReadingTask, step.answers);

        return { taskId: step.taskId, ...grade };
      });

      return {
        steps: stepResults,
        correctCount: stepResults.reduce(
          (sum, step) => sum + step.correctCount,
          0,
        ),
        total: stepResults.reduce((sum, step) => sum + step.total, 0),
        timeSpent: input.timeSpent,
      };
    }),

  getTopicsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      const topics = await ctx.db.query.trainingTopics.findMany({
        where: eq(trainingTopics.category, input.category),
      });

      const userId = ctx.session?.user?.id;
      if (!userId || topics.length === 0) {
        return topics.map((t) => ({
          ...t,
          progress: null,
          score: null,
        }));
      }

      const topicIds = topics.map((t) => t.id);

      const getProgressForTasks = async (
        activeTasks: { id: number; topicId: number | null }[],
      ) => {
        const activeTasksByTopic = new Map<number, Set<number>>();
        for (const task of activeTasks) {
          if (task.topicId !== null) {
            if (!activeTasksByTopic.has(task.topicId)) {
              activeTasksByTopic.set(task.topicId, new Set());
            }
            activeTasksByTopic.get(task.topicId)!.add(task.id);
          }
        }

        // Fetch completed tasks by user for these topics
        const completedResults = await ctx.db
          .select({
            activityId: userResults.activityId,
            taskId: userResults.taskId,
          })
          .from(userResults)
          .where(
            and(
              eq(userResults.userId, userId),
              eq(userResults.activityType, "training"),
              inArray(userResults.activityId, topicIds),
              isNotNull(userResults.taskId),
            ),
          );

        const completedTasksByTopic = new Map<number, Set<number>>();
        for (const res of completedResults) {
          const topicId = res.activityId;
          const taskId = res.taskId!;
          if (!completedTasksByTopic.has(topicId)) {
            completedTasksByTopic.set(topicId, new Set());
          }
          if (activeTasksByTopic.get(topicId)?.has(taskId)) {
            completedTasksByTopic.get(topicId)!.add(taskId);
          }
        }

        return topics.map((t) => {
          const totalCount = activeTasksByTopic.get(t.id)?.size ?? 0;
          const completedCount = completedTasksByTopic.get(t.id)?.size ?? 0;
          const progress = totalCount > 0 ? completedCount / totalCount : 0;
          return {
            ...t,
            progress,
            score: null,
          };
        });
      };

      if (input.category === "audio") {
        const tasks = await ctx.db
          .select({
            id: audioTasks.id,
            topicId: audioTasks.topicId,
          })
          .from(audioTasks)
          .where(
            and(
              eq(audioTasks.isDeleted, false),
              inArray(audioTasks.topicId, topicIds),
            ),
          );

        return getProgressForTasks(tasks);
      }

      if (input.category === "reading") {
        const tasks = await ctx.db
          .select({
            id: readingTasks.id,
            topicId: readingTasks.topicId,
          })
          .from(readingTasks)
          .where(
            and(
              eq(readingTasks.isDeleted, false),
              inArray(readingTasks.topicId, topicIds),
            ),
          );

        return getProgressForTasks(tasks);
      }

      if (input.category === "use-of-english") {
        const results = await ctx.db
          .select({
            activityId: userResults.activityId,
            result: userResults.result,
          })
          .from(userResults)
          .where(
            and(
              eq(userResults.userId, userId),
              eq(userResults.activityType, "training"),
              inArray(userResults.activityId, topicIds),
            ),
          );

        const scoresByTopic = new Map<number, number[]>();
        for (const res of results) {
          const topicId = res.activityId;
          const parts = res.result.split("/");
          if (parts.length === 2 && parts[0] !== undefined) {
            const correctCount = parseInt(parts[0], 10);
            if (!isNaN(correctCount)) {
              if (!scoresByTopic.has(topicId)) {
                scoresByTopic.set(topicId, []);
              }
              scoresByTopic.get(topicId)!.push(correctCount);
            }
          }
        }

        return topics.map((t) => {
          const scores = scoresByTopic.get(t.id);
          let averageScore: number | null = null;
          if (scores && scores.length > 0) {
            const sum = scores.reduce((a, b) => a + b, 0);
            const avg = sum / scores.length;
            averageScore = Math.round(avg * 10) / 10;
          }
          return {
            ...t,
            progress: null,
            score: averageScore,
          };
        });
      }

      return topics.map((t) => ({
        ...t,
        progress: null,
        score: null,
      }));
    }),

  getTopicByTopicTitle: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return (
        (await ctx.db.query.trainingTopics.findFirst({
          where: eq(trainingTopics.title, input),
        })) ?? null
      );
    }),

  submitAnswers: protectedProcedure
    .input(
      z.object({
        activityId: z.number(),
        activityType: z.enum(activityTypeEnum.enumValues),
        result: z.string(),
        taskId: z.number().optional(),
        timeSpent: z.number().optional(),
        details: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userResults).values({
        userId: ctx.session.user.id,
        activityId: input.activityId,
        activityType: input.activityType,
        result: input.result,
        taskId: input.taskId,
        timeSpent: input.timeSpent,
        details: input.details,
      });
    }),

  // --- Use of English ---
  getUoeTraining: publicProcedure
    .input(z.object({ topicId: z.number(), batchSize: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const { topicId, batchSize } = input;

      const topic = await ctx.db.query.trainingTopics.findFirst({
        where: eq(trainingTopics.id, topicId),
        columns: { id: true, title: true },
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found.",
        });
      }

      if (topic.title === "По всем темам") {
        const chains = await ctx.db.query.uoeTaskChains.findMany({
          where: eq(uoeTaskChains.isDeleted, false),
          with: {
            items: {
              orderBy: (items, { asc }) => [asc(items.position)],
              with: { task: { with: { topic: true } } },
            },
          },
        });

        const validChains = filterValidTasksChain(chains);

        if (validChains.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Пока нет доступных цепочек заданий",
          });
        }

        const chain =
          validChains[Math.floor(Math.random() * validChains.length)]!;
        return {
          chainId: chain.id,
          tasks: chain.items.map(({ task }) => toPublicUoeTask(task)),
          topicTitle: topic.title,
        };
      }

      const tasks = await ctx.db
        .select()
        .from(uoeTasks)
        .where(
          and(eq(uoeTasks.topicId, topicId), eq(uoeTasks.isDeleted, false)),
        )
        .orderBy(sql`RANDOM()`)
        .limit(batchSize);

      return {
        chainId: null,
        tasks: tasks.map(toPublicUoeTask),
        topicTitle: topic.title,
      };
    }),

  checkUoeTraining: publicProcedure
    .input(
      z.object({
        chainId: z.number().int().positive().optional(),
        answers: z.array(z.object({ id: z.number(), answer: z.string() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { answers, chainId } = input;
      const ids = answers.map((a) => a.id);

      if (new Set(ids).size !== ids.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ответы не должны содержать повторяющиеся задания",
        });
      }

      if (chainId !== undefined) {
        const chain = await ctx.db.query.uoeTaskChains.findFirst({
          where: and(
            eq(uoeTaskChains.id, chainId),
            eq(uoeTaskChains.isDeleted, false),
          ),
          with: { items: true },
        });
        const expectedIds = chain?.items.map((item) => item.taskId) ?? [];
        const submittedIds = new Set(ids);
        const matchesChain =
          expectedIds.length === 9 &&
          ids.length === expectedIds.length &&
          expectedIds.every((id) => submittedIds.has(id));

        if (!matchesChain) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Набор ответов не соответствует выбранной цепочке",
          });
        }
      }

      const correctTasks = await ctx.db.query.uoeTasks.findMany({
        where: and(inArray(uoeTasks.id, ids), eq(uoeTasks.isDeleted, false)),
      });
      if (correctTasks.length !== ids.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Одно или несколько заданий не найдены",
        });
      }
      const results = answers.map((userAnswer) => {
        const correctTask = correctTasks.find((t) => t.id === userAnswer.id);
        const acceptedAnswers = correctTask?.answer.split("/") ?? [];
        return {
          id: userAnswer.id,
          isCorrect: acceptedAnswers.includes(userAnswer.answer),
          correctAnswer: correctTask?.answer,
        };
      });
      const correctCount = results.filter((r) => r.isCorrect).length;
      return { results, correctCount, total: answers.length };
    }),

  // --- Reading ---
  getReadingTraining: publicProcedure
    .input(z.object({ topicId: z.number() }))
    .query(async ({ ctx, input }) => {
      const topic = await ctx.db.query.trainingTopics.findFirst({
        where: eq(trainingTopics.id, input.topicId),
        columns: { title: true },
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found.",
        });
      }

      const baseWhere = and(
        eq(readingTasks.topicId, input.topicId),
        eq(readingTasks.isDeleted, false),
      );

      const userId = ctx.session?.user?.id;

      let task;
      if (userId) {
        task = await ctx.db
          .select()
          .from(readingTasks)
          .where(
            and(
              baseWhere,
              notInArray(
                readingTasks.id,
                ctx.db
                  .select({ id: userResults.taskId })
                  .from(userResults)
                  .where(
                    and(
                      eq(userResults.userId, userId),
                      eq(userResults.activityId, input.topicId),
                      eq(userResults.activityType, "training"),
                      isNotNull(userResults.taskId),
                    ),
                  ),
              ),
            ),
          )
          .orderBy(sql`RANDOM()`)
          .limit(1)
          .then((res) => res[0]);
      }

      task ??= await ctx.db
        .select()
        .from(readingTasks)
        .where(baseWhere)
        .orderBy(sql`RANDOM()`)
        .limit(1)
        .then((res) => res[0]);

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found for the given topic.",
        });
      }

      if (task.taskType === "true_false") {
        return {
          task: {
            id: task.id,
            topicId: task.topicId,
            taskType: "true_false" as const,
            text: (task.texts ?? [])[0] ?? "",
            statements: task.headings ?? [],
            total: (task.answers ?? []).length,
          },
          topicTitle: topic.title,
        };
      }

      return {
        task: {
          id: task.id,
          topicId: task.topicId,
          taskType: "matching" as const,
          isDeleted: task.isDeleted,
          headings: task.headings ?? [],
          texts: task.texts ?? [],
          answers: task.answers ?? [],
          explanations: task.explanations ?? [],
        },
        topicTitle: topic.title,
      };
    }),

  checkReadingTraining: publicProcedure
    .input(
      z.object({
        id: z.number(),
        answers: z.array(z.number().nullable()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.readingTasks.findFirst({
        where: eq(readingTasks.id, input.id),
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found for checking.",
        });
      }

      return gradeReadingTask(task, input.answers);
    }),

  // --- Writing ---
  getWritingTraining: publicProcedure.query(async ({ ctx }) => {
    const allTasks = await ctx.db
      .select()
      .from(writingTasks)
      .where(eq(writingTasks.isDeleted, false));

    function getSubtasksByTopic(
      topic: string,
      withOptions: true,
    ): { id: number; task: string; topic: string; options: string[] }[];
    function getSubtasksByTopic(
      topic: string,
      withOptions?: false,
    ): { id: number; task: string; topic: string }[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getSubtasksByTopic(topic: string, withOptions = false): any[] {
      const tasks = allTasks.filter((task) => task.topic === topic);
      if (withOptions) {
        return tasks.map((task) => {
          const { answer, ...rest } = task;
          const options = answer.split(answer.includes("\n") ? "\n" : " ");

          shuffle(options);
          return { ...rest, options };
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return tasks.map(({ answer, ...task }) => task);
    }

    const task = {
      structure: getSubtasksByTopic("structure"),
      cliches: getSubtasksByTopic("cliche", true),
      linkers: getSubtasksByTopic("linkers", true),
      fullAnswers: getSubtasksByTopic("full_answers").map((t) => {
        const parts = t.task.split("\n");
        return {
          ...t,
          question: parts[0] ?? "",
          options: parts.slice(1),
        };
      }),
    };

    return {
      task,
      topicTitle: "Письмо",
    };
  }),

  checkWritingTraining: publicProcedure
    .input(
      z.object({
        answers: z.object({
          structure: z.object({ id: z.number(), answer: z.array(z.number()) }),
          cliches: z.array(
            z.object({ id: z.number(), answer: z.array(z.string()) }),
          ),
          linkers: z.array(
            z.object({ id: z.number(), answer: z.array(z.string()) }),
          ),
          fullAnswers: z.array(
            z.object({ id: z.number(), answer: z.string() }),
          ),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const allIds = [
        input.answers.structure.id,
        ...input.answers.cliches.map((a) => a.id),
        ...input.answers.linkers.map((a) => a.id),
        ...input.answers.fullAnswers.map((a) => a.id),
      ];

      const correctTasks = await ctx.db.query.writingTasks.findMany({
        where: inArray(writingTasks.id, allIds),
      });

      const getTask = (id: number) => correctTasks.find((t) => t.id === id);

      let correctCount = 0;
      let total = 0;

      // Check structure
      const structureTask = getTask(input.answers.structure.id);
      const structureCorrectParts = structureTask?.answer.split("\n");
      const structureTaskParts = structureTask?.task.split("\n");
      const structureCorrectness = input.answers.structure.answer.map(
        (userAnswer, i) => {
          const isCorrect =
            structureTaskParts?.[userAnswer - 1] === structureCorrectParts?.[i];
          if (isCorrect) correctCount++;
          return isCorrect;
        },
      );
      total += structureCorrectParts?.length ?? 0;

      // Check cliches
      const clichesCorrectness = input.answers.cliches.map((userAnswer) => {
        const task = getTask(userAnswer.id);
        const correct = task?.answer.split(" ");
        total += correct?.length ?? 0;
        return userAnswer.answer.map((ans, i) => {
          const isCorrect = ans === correct?.[i];
          if (isCorrect) correctCount++;
          return isCorrect;
        });
      });

      // Check linkers
      const linkersCorrectness = input.answers.linkers.map((userAnswer) => {
        const task = getTask(userAnswer.id);
        const correct = task?.answer.split("\n");
        total += correct?.length ?? 0;
        return userAnswer.answer.map((ans, i) => {
          const isCorrect = ans === correct?.[i];
          if (isCorrect) correctCount++;
          return isCorrect;
        });
      });

      // Check full answers
      const fullAnswersCorrectness = input.answers.fullAnswers.map(
        (userAnswer) => {
          const task = getTask(userAnswer.id);
          const options = task?.task.split("\n").slice(1);
          const correctIndex = Number(task?.answer) - 1;
          const correctAnswerText = options?.[correctIndex];
          total++;
          const isCorrect = userAnswer.answer === correctAnswerText;
          if (isCorrect) correctCount++;
          return isCorrect;
        },
      );

      return {
        correctCount,
        total,
        structureCorrectness,
        clichesCorrectness,
        linkersCorrectness,
        fullAnswersCorrectness,
      };
    }),

  // --- Listening ---
  getListeningTraining: publicProcedure
    .input(z.object({ topicId: z.number() }))
    .query(async ({ ctx, input }) => {
      const topic = await ctx.db.query.trainingTopics.findFirst({
        where: eq(trainingTopics.id, input.topicId),
        columns: { title: true },
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Topic not found.",
        });
      }

      const baseWhere = and(
        eq(audioTasks.topicId, input.topicId),
        eq(audioTasks.isDeleted, false),
      );

      // Everything the runner needs to render the task — deliberately without
      // `answers`/`explanations`, which would hand the student the answer key.
      // `total` is the answer count, taken in SQL so the answers stay in the DB.
      const taskColumns = {
        id: audioTasks.id,
        audioUrl: audioTasks.audioUrl,
        topicId: audioTasks.topicId,
        taskType: audioTasks.taskType,
        questions: audioTasks.questions,
        total: sql<number>`jsonb_array_length(${audioTasks.answers})`.mapWith(
          Number,
        ),
      };

      const userId = ctx.session?.user?.id;

      let task;
      if (userId) {
        task = await ctx.db
          .select(taskColumns)
          .from(audioTasks)
          .where(
            and(
              baseWhere,
              notInArray(
                audioTasks.id,
                ctx.db
                  .select({ id: userResults.taskId })
                  .from(userResults)
                  .where(
                    and(
                      eq(userResults.userId, userId),
                      eq(userResults.activityId, input.topicId),
                      eq(userResults.activityType, "training"),
                      isNotNull(userResults.taskId),
                    ),
                  ),
              ),
            ),
          )
          .orderBy(sql`RANDOM()`)
          .limit(1)
          .then((res) => res[0]);
      }

      // Fallback: unauthenticated, or every task has been completed
      task ??= await ctx.db
        .select(taskColumns)
        .from(audioTasks)
        .where(baseWhere)
        .orderBy(sql`RANDOM()`)
        .limit(1)
        .then((res) => res[0]);

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found for the given topic.",
        });
      }

      return {
        task: {
          ...task,
          questions: task.questions ?? [],
        },
        topicTitle: topic.title,
      };
    }),

  checkListeningTraining: publicProcedure
    .input(
      z.object({
        id: z.number(),
        answers: z
          .array(z.union([z.number(), z.string().max(100)]).nullable())
          .max(20),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.audioTasks.findFirst({
        where: eq(audioTasks.id, input.id),
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found for checking.",
        });
      }

      return gradeAudioTask(task, input.answers);
    }),
});
