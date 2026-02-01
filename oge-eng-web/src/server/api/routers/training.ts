import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  readingTasksFirst,
  trainingTopics,
  uoeTasks,
  writingTasks,
} from "@/server/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

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

  // --- Writing ---
  getWritingTraining: publicProcedure.query(async ({ ctx }) => {
    const allTasks = await ctx.db.select().from(writingTasks);

    function getSubtasksByTopic(
      topic: string,
      withOptions: true,
    ): { id: number; task: string; topic: string; options: string[] }[];
    function getSubtasksByTopic(
      topic: string,
      withOptions?: false,
    ): { id: number; task: string; topic: string }[];

    function getSubtasksByTopic(topic: string, withOptions = false) {
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
      const structureCorrectParts = structureTask?.answer.split("\r\n");
      const structureTaskParts = structureTask?.task.split("\r\n");
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
        const correct = task?.answer.split("\r\n");
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
          const options = task?.task.split("\r\n").slice(1);
          const correctIndex = Number(task?.answer) - 1;
          total++;
          const isCorrect = userAnswer.answer === options?.[correctIndex];
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
});
