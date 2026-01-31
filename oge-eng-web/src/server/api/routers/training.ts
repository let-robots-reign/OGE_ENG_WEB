import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  readingTasksFirst,
  trainingTopics,
  uoeTasks,
} from "@/server/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const trainingRouter = createTRPCRouter({
  getTopicsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.trainingTopics.findMany({
        where: eq(trainingTopics.category, input.category),
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

      const where =
        topic.title === "По всем темам"
          ? undefined
          : eq(uoeTasks.topicId, topicId);

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
        return {
          id: userAnswer.id,
          isCorrect: correctTask?.answer === userAnswer.answer,
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

      const task = await ctx.db
        .select()
        .from(readingTasksFirst)
        .where(eq(readingTasksFirst.topicId, input.topicId))
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
});
