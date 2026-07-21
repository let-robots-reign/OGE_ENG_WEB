import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  activityTypeEnum,
  audioTasksFirst,
  readingTasksFirst,
  trainingTopics,
  uoeTasks,
  userResults,
  writingTasks,
} from "@/server/db/schema";
import { shuffle } from "@/app/_utils/shuffle";
import { and, eq, inArray, isNotNull, notInArray, sql, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const trainingRouter = createTRPCRouter({
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
            id: audioTasksFirst.id,
            topicId: audioTasksFirst.topicId,
          })
          .from(audioTasksFirst)
          .where(
            and(
              eq(audioTasksFirst.isDeleted, false),
              inArray(audioTasksFirst.topicId, topicIds),
            ),
          );

        return getProgressForTasks(tasks);
      }

      if (input.category === "reading") {
        const tasks = await ctx.db
          .select({
            id: readingTasksFirst.id,
            topicId: readingTasksFirst.topicId,
          })
          .from(readingTasksFirst)
          .where(
            and(
              eq(readingTasksFirst.isDeleted, false),
              inArray(readingTasksFirst.topicId, topicIds),
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

  logResult: protectedProcedure
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

      let topicCondition;

      if (topic.title === "По всем темам") {
        // "По всем темам" includes only grammar, not word formation
        const wordFormationTopic = await ctx.db.query.trainingTopics.findFirst({
          where: eq(trainingTopics.title, "Словообразование"),
          columns: { id: true },
        });
        if (wordFormationTopic) {
          topicCondition = ne(uoeTasks.topicId, wordFormationTopic.id);
        }
      } else {
        topicCondition = eq(uoeTasks.topicId, topicId);
      }

      const where = topicCondition
        ? and(topicCondition, eq(uoeTasks.isDeleted, false))
        : eq(uoeTasks.isDeleted, false);

      const tasks = await ctx.db
        .select()
        .from(uoeTasks)
        .where(where)
        .orderBy(sql`RANDOM()`)
        .limit(batchSize);

      return {
        tasks: tasks.map(({ answer: _answer, ...task }) => task),
        topicTitle: topic.title,
      };
    }),

  checkUoeTraining: publicProcedure
    .input(
      z.object({
        answers: z.array(z.object({ id: z.number(), answer: z.string() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { answers } = input;
      const ids = answers.map((a) => a.id);
      const correctTasks = await ctx.db.query.uoeTasks.findMany({
        where: inArray(uoeTasks.id, ids),
      });
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

      if (topic?.title !== "Задание 12") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This procedure is only for 'Задание 12'.",
        });
      }

      const baseWhere = and(
        eq(readingTasksFirst.topicId, input.topicId),
        eq(readingTasksFirst.isDeleted, false),
      );

      const userId = ctx.session?.user?.id;

      let task;
      if (userId) {
        task = await ctx.db
          .select()
          .from(readingTasksFirst)
          .where(
            and(
              baseWhere,
              notInArray(
                readingTasksFirst.id,
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
        .select()
        .from(readingTasksFirst)
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { answer, explanation, ...rest } = task;

      return {
        task: {
          ...rest,
          headings: task.task.split("\n"),
          texts: task.text.split("\n"),
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
      const task = await ctx.db.query.readingTasksFirst.findFirst({
        where: eq(readingTasksFirst.id, input.id),
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found for checking.",
        });
      }

      const correctAnswers = task.answer.split(" ").map(Number);

      const results = input.answers.map(
        (userAnswer, i) => userAnswer === correctAnswers[i],
      );
      const correctCount = results.filter(Boolean).length;

      return {
        correctAnswers,
        results,
        correctCount,
        total: correctAnswers.length,
        explanation: task.explanation,
      };
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
        eq(audioTasksFirst.topicId, input.topicId),
        eq(audioTasksFirst.isDeleted, false),
      );

      const userId = ctx.session?.user?.id;

      let task;
      if (userId) {
        task = await ctx.db
          .select()
          .from(audioTasksFirst)
          .where(
            and(
              baseWhere,
              notInArray(
                audioTasksFirst.id,
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
        .select()
        .from(audioTasksFirst)
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { answer, explanation, ...rest } = task;

      const questions = task.task.split("\n").map((q) => {
        const [question, ...options] = q.split("/option/");
        return { question, options };
      });

      return {
        task: {
          ...rest,
          questions,
        },
        topicTitle: topic.title,
      };
    }),

  checkListeningTraining: publicProcedure
    .input(
      z.object({
        id: z.number(),
        answers: z.array(z.number().nullable()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.query.audioTasksFirst.findFirst({
        where: eq(audioTasksFirst.id, input.id),
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found for checking.",
        });
      }

      const correctAnswers = task.answer.split(" ").map(Number);

      const results = input.answers.map(
        (userAnswer, i) => userAnswer === correctAnswers[i],
      );
      const correctCount = results.filter(Boolean).length;

      return {
        correctAnswers,
        results,
        correctCount,
        total: correctAnswers.length,
        explanation: task.explanation.split("---"),
      };
    }),
});
