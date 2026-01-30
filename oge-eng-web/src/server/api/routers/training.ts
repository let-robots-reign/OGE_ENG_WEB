import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { trainingTopics, uoeTasks } from "@/server/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

export const trainingRouter = createTRPCRouter({
  getTopicsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.trainingTopics.findMany({
        where: eq(trainingTopics.category, input.category),
      });
    }),

  getUoeTraining: publicProcedure
    .input(z.object({ topicId: z.number(), batchSize: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const { topicId, batchSize } = input;

      // Dynamically find the ID for the "all topics" category to avoid hard-coding
      const allTopicsEntry = await ctx.db.query.trainingTopics.findFirst({
        where: eq(trainingTopics.title, "По всем темам"),
        columns: {
          id: true,
        },
      });

      const where =
        topicId === allTopicsEntry?.id
          ? undefined
          : eq(uoeTasks.topicId, topicId);

      const tasks = await ctx.db
        .select()
        .from(uoeTasks)
        .where(where)
        .orderBy(sql`RANDOM()`)
        .limit(batchSize);

      return tasks.map(({ answer: _answer, ...task }) => task);
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

      return {
        results,
        correctCount,
        total: answers.length,
      };
    }),
});
