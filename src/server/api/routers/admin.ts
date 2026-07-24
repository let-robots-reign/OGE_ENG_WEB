import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  audioTasksFirst,
  readingTasksFirst,
  trainingTopics,
  userResults,
} from "@/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";

const diagnosticDetailsSchema = z.object({
  feedback: z.string(),
  userAnswers: z.any(),
});

export const audioTaskInputSchema = z.object({
  topicId: z.number({ required_error: "Выберите тему" }),
  audioUrl: z.string().min(1, "Укажите ссылку или загрузите файл"),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1, "Текст вопроса не может быть пустым"),
        options: z
          .array(z.string().min(1, "Текст варианта не может быть пустым"))
          .min(2, "Минимум 2 варианта ответа"),
      }),
    )
    .min(1, "Минимум 1 вопрос"),
  answers: z.array(z.number()),
  explanations: z.array(
    z.object({
      text: z.string().min(1, "Пояснение обязательно"),
      highlightedText: z.string().optional(),
    }),
  ),
});

export const readingTaskInputSchema = z.object({
  topicId: z.number({ required_error: "Выберите тему" }),
  texts: z
    .array(z.string().min(1, "Текст пассажа не может быть пустым"))
    .min(1, "Минимум 1 текст"),
  headings: z
    .array(z.string().min(1, "Текст заголовка не может быть пустым"))
    .min(1, "Минимум 1 заголовок"),
  answers: z.array(z.number().min(1, "Выберите заголовок")),
  explanations: z.array(
    z.object({
      text: z.string().min(1, "Пояснение обязательно"),
      highlightedText: z.string().optional(),
    }),
  ),
});

export const adminRouter = createTRPCRouter({
  getTrainingResults: adminProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.query.userResults.findMany({
      where: eq(userResults.activityType, "training"),
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: (userResults, { desc }) => [desc(userResults.createdAt)],
    });

    const topicIds = results.map((r) => r.activityId);
    if (topicIds.length === 0) return [];

    const topics = await ctx.db.query.trainingTopics.findMany({
      where: (trainingTopics, { inArray }) =>
        inArray(trainingTopics.id, topicIds),
    });

    return results.map((result) => {
      const topic = topics.find((t) => t.id === result.activityId);
      return {
        ...result,
        topic,
      };
    });
  }),

  getDiagnosticsResults: adminProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.query.userResults.findMany({
      where: eq(userResults.activityType, "diagnostics"),
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: (userResults, { desc }) => [desc(userResults.createdAt)],
    });

    return results.map((result) => ({
      ...result,
      details: diagnosticDetailsSchema.parse(result.details),
    }));
  }),

  getResultById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.userResults.findFirst({
        where: eq(userResults.id, input.id),
        with: {
          user: {
            columns: {
              email: true,
              name: true,
            },
          },
        },
      });

      if (!result) return null;

      return {
        ...result,
        details: diagnosticDetailsSchema.parse(result.details),
      };
    }),

  getAudioTopics: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.trainingTopics.findMany({
      where: eq(trainingTopics.category, "audio"),
      orderBy: (trainingTopics, { asc }) => [asc(trainingTopics.title)],
    });
  }),

  getAudioTasks: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        topicId: z.number().optional(),
        sortBy: z.enum(["id", "topicTitle"]).default("id"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, topicId, sortBy, sortOrder } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(audioTasksFirst.isDeleted, false)];
      if (topicId) {
        conditions.push(eq(audioTasksFirst.topicId, topicId));
      }

      let tasks = await ctx.db.query.audioTasksFirst.findMany({
        where: and(...conditions),
        with: {
          topic: true,
        },
        orderBy: (audioTasksFirst, { asc, desc }) =>
          sortOrder === "asc"
            ? [asc(audioTasksFirst.id)]
            : [desc(audioTasksFirst.id)],
      });

      if (search && search.trim() !== "") {
        const term = search.trim().toLowerCase();
        tasks = tasks.filter((t) => {
          const topicTitle = t.topic?.title?.toLowerCase() ?? "";
          const idStr = t.id.toString();
          const matchesQuestion = t.questions?.some((q) =>
            q.questionText.toLowerCase().includes(term),
          );
          return topicTitle.includes(term) || idStr.includes(term) || matchesQuestion;
        });
      }

      if (sortBy === "topicTitle") {
        tasks.sort((a, b) => {
          const titleA = a.topic?.title ?? "";
          const titleB = b.topic?.title ?? "";
          return sortOrder === "asc"
            ? titleA.localeCompare(titleB, "ru")
            : titleB.localeCompare(titleA, "ru");
        });
      }

      const totalCount = tasks.length;
      const paginatedTasks = tasks.slice(offset, offset + pageSize);

      return {
        items: paginatedTasks,
        totalCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      };
    }),

  getAudioTaskById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.query.audioTasksFirst.findFirst({
        where: and(
          eq(audioTasksFirst.id, input.id),
          eq(audioTasksFirst.isDeleted, false),
        ),
        with: {
          topic: true,
        },
      });

      if (!task) return null;
      return task;
    }),

  createAudioTask: adminProcedure
    .input(audioTaskInputSchema)
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(audioTasksFirst)
        .values({
          topicId: input.topicId,
          audioUrl: input.audioUrl,
          questions: input.questions,
          answers: input.answers,
          explanations: input.explanations,
          isDeleted: false,
        })
        .returning();

      return inserted;
    }),

  updateAudioTask: adminProcedure
    .input(
      audioTaskInputSchema.extend({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(audioTasksFirst)
        .set({
          topicId: input.topicId,
          audioUrl: input.audioUrl,
          questions: input.questions,
          answers: input.answers,
          explanations: input.explanations,
        })
        .where(eq(audioTasksFirst.id, input.id))
        .returning();

      return updated;
    }),

  deleteAudioTasks: adminProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(audioTasksFirst)
        .set({ isDeleted: true })
        .where(inArray(audioTasksFirst.id, input.ids));

      return { success: true, deletedCount: input.ids.length };
    }),

  getReadingTopics: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.trainingTopics.findMany({
      where: eq(trainingTopics.category, "reading"),
      orderBy: (trainingTopics, { asc }) => [asc(trainingTopics.title)],
    });
  }),

  getReadingTasks: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        topicId: z.number().optional(),
        sortBy: z.enum(["id", "topicTitle"]).default("id"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, topicId, sortBy, sortOrder } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(readingTasksFirst.isDeleted, false)];
      if (topicId) {
        conditions.push(eq(readingTasksFirst.topicId, topicId));
      }

      let tasks = await ctx.db.query.readingTasksFirst.findMany({
        where: and(...conditions),
        with: {
          topic: true,
        },
        orderBy: (readingTasksFirst, { asc, desc }) =>
          sortOrder === "asc"
            ? [asc(readingTasksFirst.id)]
            : [desc(readingTasksFirst.id)],
      });

      if (search && search.trim() !== "") {
        const term = search.trim().toLowerCase();
        tasks = tasks.filter((t) => {
          const topicTitle = t.topic?.title?.toLowerCase() ?? "";
          const idStr = t.id.toString();
          const matchesText = t.texts?.some((txt) =>
            txt.toLowerCase().includes(term),
          );
          const matchesHeading = t.headings?.some((h) =>
            h.toLowerCase().includes(term),
          );
          return (
            topicTitle.includes(term) ||
            idStr.includes(term) ||
            matchesText ||
            matchesHeading
          );
        });
      }

      if (sortBy === "topicTitle") {
        tasks.sort((a, b) => {
          const titleA = a.topic?.title ?? "";
          const titleB = b.topic?.title ?? "";
          return sortOrder === "asc"
            ? titleA.localeCompare(titleB, "ru")
            : titleB.localeCompare(titleA, "ru");
        });
      }

      const totalCount = tasks.length;
      const paginatedTasks = tasks.slice(offset, offset + pageSize);

      return {
        items: paginatedTasks,
        totalCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      };
    }),

  getReadingTaskById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.query.readingTasksFirst.findFirst({
        where: and(
          eq(readingTasksFirst.id, input.id),
          eq(readingTasksFirst.isDeleted, false),
        ),
        with: {
          topic: true,
        },
      });

      if (!task) return null;
      return task;
    }),

  createReadingTask: adminProcedure
    .input(readingTaskInputSchema)
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(readingTasksFirst)
        .values({
          topicId: input.topicId,
          texts: input.texts,
          headings: input.headings,
          answers: input.answers,
          explanations: input.explanations,
          isDeleted: false,
        })
        .returning();

      return inserted;
    }),

  updateReadingTask: adminProcedure
    .input(
      readingTaskInputSchema.extend({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(readingTasksFirst)
        .set({
          topicId: input.topicId,
          texts: input.texts,
          headings: input.headings,
          answers: input.answers,
          explanations: input.explanations,
        })
        .where(eq(readingTasksFirst.id, input.id))
        .returning();

      return updated;
    }),

  deleteReadingTasks: adminProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(readingTasksFirst)
        .set({ isDeleted: true })
        .where(inArray(readingTasksFirst.id, input.ids));

      return { success: true, deletedCount: input.ids.length };
    }),
});

