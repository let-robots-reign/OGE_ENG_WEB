import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  audioTasks,
  readingTasks,
  trainingTopics,
  uoeTaskChainItems,
  uoeTaskChains,
  uoeTasks,
  userResults,
} from "@/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const UOE_CHAIN_LENGTH = 9;

export const uoeChainTaskIdsSchema = z
  .array(z.number().int().positive())
  .length(
    UOE_CHAIN_LENGTH,
    `Цепочка должна содержать ровно ${UOE_CHAIN_LENGTH} заданий`,
  )
  .superRefine((taskIds, ctx) => {
    if (new Set(taskIds).size !== taskIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Задания в цепочке не должны повторяться",
      });
    }
  });

type ChainCandidateTask = {
  id: number;
  isDeleted: boolean;
  topic: {
    title: string;
    category: string;
    isActive: boolean;
  } | null;
};

function validateChainCandidateTasks(
  tasks: ChainCandidateTask[],
  taskIds: number[],
) {
  if (tasks.length !== taskIds.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Одно или несколько заданий цепочки не найдены",
    });
  }

  const invalidTaskIds = tasks
    .filter(
      (task) =>
        task.isDeleted ||
        !task.topic ||
        !task.topic.isActive ||
        task.topic.category !== "use-of-english" ||
        task.topic.title === "Словообразование",
    )
    .map((task) => task.id);

  if (invalidTaskIds.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Недопустимые задания для цепочки: ${invalidTaskIds.map((id) => `#${id}`).join(", ")}`,
    });
  }
}

const diagnosticDetailsSchema = z.object({
  feedback: z.string(),
  userAnswers: z.any(),
});

export const uoeTaskInputSchema = z.object({
  topicId: z.number({ required_error: "Выберите тему" }),
  task: z.string().min(1, "Введите предложение / задание"),
  origin: z.string().min(1, "Введите начальное слово"),
  answer: z.string().min(1, "Введите правильный ответ"),
});

const audioTaskBaseSchema = z.object({
  topicId: z.number({ required_error: "Выберите тему" }),
  audioUrl: z.string().min(1, "Укажите ссылку или загрузите файл"),
  explanations: z.array(
    z.object({
      text: z.string().min(1, "Пояснение обязательно"),
      highlightedText: z.string().optional(),
    }),
  ),
});

const multipleChoiceInputSchema = audioTaskBaseSchema.extend({
  taskType: z.literal("multiple_choice"),
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
  answers: z.array(z.number().int().min(1)),
});

const matchingInputSchema = audioTaskBaseSchema.extend({
  taskType: z.literal("matching"),
  questions: z
    .array(z.string().min(1, "Текст рубрики не может быть пустым"))
    .min(1, "Минимум 1 рубрика"),
  answers: z
    .array(z.number().int().min(1))
    .min(1, "Укажите ответы для спикеров"),
});

const gapFillInputSchema = audioTaskBaseSchema.extend({
  taskType: z.literal("gap_fill"),
  questions: z
    .array(z.string().min(1, "Шаблон предложения не может быть пустым"))
    .min(1, "Минимум 1 предложение"),
  answers: z.array(
    z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  ),
});

export const audioTaskInputSchema = z
  .discriminatedUnion("taskType", [
    multipleChoiceInputSchema,
    matchingInputSchema,
    gapFillInputSchema,
  ])
  .superRefine((input, ctx) => {
    if (input.answers.length !== input.explanations.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["explanations"],
        message: "Количество пояснений должно совпадать с количеством ответов",
      });
    }

    if (
      input.taskType !== "matching" &&
      input.questions.length !== input.answers.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answers"],
        message: "Количество ответов должно совпадать с количеством вопросов",
      });
    }

    if (input.taskType === "multiple_choice") {
      input.answers.forEach((answer, index) => {
        const optionCount = input.questions[index]?.options.length ?? 0;
        if (answer > optionCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["answers", index],
            message:
              "Правильный ответ должен указывать на существующий вариант",
          });
        }
      });
    }

    if (input.taskType === "matching") {
      if (input.questions.length !== input.answers.length + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions"],
          message: "Должна быть одна лишняя рубрика",
        });
      }
      if (new Set(input.answers).size !== input.answers.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["answers"],
          message: "Каждая рубрика может использоваться только один раз",
        });
      }
      input.answers.forEach((answer, index) => {
        if (answer > input.questions.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["answers", index],
            message: "Ответ должен указывать на существующую рубрику",
          });
        }
      });
    }
  });

const readingTaskBaseSchema = z.object({
  topicId: z.number({ required_error: "Выберите тему" }),
  explanations: z.array(
    z.object({
      text: z.string().min(1, "Пояснение обязательно"),
      highlightedText: z.string().optional(),
    }),
  ),
});

const readingMatchingInputSchema = readingTaskBaseSchema.extend({
  taskType: z.literal("matching"),
  texts: z
    .array(z.string().min(1, "Текст пассажа не может быть пустым"))
    .min(1, "Минимум 1 текст"),
  headings: z
    .array(z.string().min(1, "Текст заголовка не может быть пустым"))
    .min(1, "Минимум 1 заголовок"),
  answers: z.array(z.number().int().min(1, "Выберите заголовок")),
});

const readingTrueFalseInputSchema = readingTaskBaseSchema.extend({
  taskType: z.literal("true_false"),
  texts: z
    .array(z.string().min(1, "Текст не может быть пустым"))
    .length(1, "Должен быть ровно 1 текст"),
  headings: z
    .array(z.string().min(1, "Утверждение не может быть пустым"))
    .min(1, "Минимум 1 утверждение"),
  answers: z.array(z.number().int().min(1).max(3)),
});

export const readingTaskInputSchema = z
  .discriminatedUnion("taskType", [
    readingMatchingInputSchema,
    readingTrueFalseInputSchema,
  ])
  .superRefine((input, ctx) => {
    if (input.answers.length !== input.explanations.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["explanations"],
        message: "Количество пояснений должно совпадать с количеством ответов",
      });
    }

    const expectedAnswerCount =
      input.taskType === "matching"
        ? input.texts.length
        : input.headings.length;
    if (input.answers.length !== expectedAnswerCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answers"],
        message: "Количество ответов не совпадает с количеством заданий",
      });
    }

    if (input.taskType === "matching") {
      if (input.headings.length !== input.texts.length + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["headings"],
          message: "Должен быть ровно один лишний заголовок",
        });
      }
      if (new Set(input.answers).size !== input.answers.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["answers"],
          message: "Каждый заголовок может использоваться только один раз",
        });
      }
      input.answers.forEach((answer, index) => {
        if (answer > input.headings.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["answers", index],
            message: "Ответ должен указывать на существующий заголовок",
          });
        }
      });
    }
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
      orderBy: (trainingTopics, { asc }) => [asc(trainingTopics.id)],
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

      const conditions = [eq(audioTasks.isDeleted, false)];
      if (topicId) {
        conditions.push(eq(audioTasks.topicId, topicId));
      }

      let tasks = await ctx.db.query.audioTasks.findMany({
        where: and(...conditions),
        with: {
          topic: true,
        },
        orderBy: (audioTasks, { asc, desc }) =>
          sortOrder === "asc" ? [asc(audioTasks.id)] : [desc(audioTasks.id)],
      });

      if (search && search.trim() !== "") {
        const term = search.trim().toLowerCase();
        tasks = tasks.filter((t) => {
          const topicTitle = t.topic?.title?.toLowerCase() ?? "";
          const idStr = t.id.toString();
          const matchesQuestion = t.questions?.some((q) => {
            const text = typeof q === "string" ? q : q.questionText;
            return text?.toLowerCase().includes(term);
          });
          return (
            topicTitle.includes(term) || idStr.includes(term) || matchesQuestion
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

  getAudioTaskById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.query.audioTasks.findFirst({
        where: and(
          eq(audioTasks.id, input.id),
          eq(audioTasks.isDeleted, false),
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
        .insert(audioTasks)
        .values({
          topicId: input.topicId,
          audioUrl: input.audioUrl,
          taskType: input.taskType,
          questions: input.questions,
          answers: input.answers,
          explanations: input.explanations,
          isDeleted: false,
        })
        .returning();

      return inserted;
    }),

  updateAudioTask: adminProcedure
    .input(z.intersection(z.object({ id: z.number() }), audioTaskInputSchema))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(audioTasks)
        .set({
          topicId: input.topicId,
          audioUrl: input.audioUrl,
          taskType: input.taskType,
          questions: input.questions,
          answers: input.answers,
          explanations: input.explanations,
        })
        .where(eq(audioTasks.id, input.id))
        .returning();

      return updated;
    }),

  deleteAudioTasks: adminProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(audioTasks)
        .set({ isDeleted: true })
        .where(inArray(audioTasks.id, input.ids));

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

      const conditions = [eq(readingTasks.isDeleted, false)];
      if (topicId) {
        conditions.push(eq(readingTasks.topicId, topicId));
      }

      let tasks = await ctx.db.query.readingTasks.findMany({
        where: and(...conditions),
        with: {
          topic: true,
        },
        orderBy: (readingTasks, { asc, desc }) =>
          sortOrder === "asc"
            ? [asc(readingTasks.id)]
            : [desc(readingTasks.id)],
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
      const task = await ctx.db.query.readingTasks.findFirst({
        where: and(
          eq(readingTasks.id, input.id),
          eq(readingTasks.isDeleted, false),
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
        .insert(readingTasks)
        .values({
          topicId: input.topicId,
          taskType: input.taskType,
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
    .input(z.intersection(z.object({ id: z.number() }), readingTaskInputSchema))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(readingTasks)
        .set({
          topicId: input.topicId,
          taskType: input.taskType,
          texts: input.texts,
          headings: input.headings,
          answers: input.answers,
          explanations: input.explanations,
        })
        .where(eq(readingTasks.id, input.id))
        .returning();

      return updated;
    }),

  deleteReadingTasks: adminProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(readingTasks)
        .set({ isDeleted: true })
        .where(inArray(readingTasks.id, input.ids));

      return { success: true, deletedCount: input.ids.length };
    }),

  getUoeTopics: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.trainingTopics.findMany({
      where: eq(trainingTopics.category, "use-of-english"),
      orderBy: (topics, { asc }) => [asc(topics.title)],
    });
  }),

  getUoeChainCatalog: adminProcedure
    .input(
      z.object({
        search: z.string().default(""),
        topicId: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tasks = await ctx.db.query.uoeTasks.findMany({
        where: and(
          eq(uoeTasks.isDeleted, false),
          input.topicId !== undefined
            ? eq(uoeTasks.topicId, input.topicId)
            : undefined,
        ),
        with: { topic: true },
        orderBy: (table, { desc }) => [desc(table.id)],
      });
      const search = input.search.trim().toLowerCase();

      return tasks
        .filter((task) => {
          const topic = task.topic;
          if (
            !topic?.isActive ||
            topic.category !== "use-of-english" ||
            topic.title === "Словообразование"
          ) {
            return false;
          }

          if (!search) return true;
          return [
            String(task.id),
            task.task,
            task.origin,
            task.answer,
            topic.title,
          ].some((value) => value.toLowerCase().includes(search));
        })
        .slice(0, input.limit);
    }),

  getUoeTaskChains: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.uoeTaskChains.findMany({
      where: eq(uoeTaskChains.isDeleted, false),
      with: {
        items: {
          orderBy: (items, { asc }) => [asc(items.position)],
          with: { task: { with: { topic: true } } },
        },
      },
      orderBy: (chains, { desc }) => [desc(chains.id)],
    });
  }),

  getUoeTaskChainById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const chain = await ctx.db.query.uoeTaskChains.findFirst({
        where: and(
          eq(uoeTaskChains.id, input.id),
          eq(uoeTaskChains.isDeleted, false),
        ),
        with: {
          items: {
            orderBy: (items, { asc }) => [asc(items.position)],
            with: { task: { with: { topic: true } } },
          },
        },
      });

      return chain ?? null;
    }),

  createUoeTaskChain: adminProcedure
    .input(z.object({ taskIds: uoeChainTaskIdsSchema }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const tasks = await tx.query.uoeTasks.findMany({
          where: inArray(uoeTasks.id, input.taskIds),
          with: { topic: true },
        });
        validateChainCandidateTasks(tasks, input.taskIds);

        const [chain] = await tx
          .insert(uoeTaskChains)
          .values({ isDeleted: false })
          .returning();
        if (!chain) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Не удалось создать цепочку",
          });
        }

        await tx.insert(uoeTaskChainItems).values(
          input.taskIds.map((taskId, index) => ({
            chainId: chain.id,
            taskId,
            position: index + 1,
          })),
        );

        return { id: chain.id };
      });
    }),

  updateUoeTaskChain: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        taskIds: uoeChainTaskIdsSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const chain = await tx.query.uoeTaskChains.findFirst({
          where: and(
            eq(uoeTaskChains.id, input.id),
            eq(uoeTaskChains.isDeleted, false),
          ),
          columns: { id: true },
        });
        if (!chain) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Цепочка не найдена",
          });
        }

        const tasks = await tx.query.uoeTasks.findMany({
          where: inArray(uoeTasks.id, input.taskIds),
          with: { topic: true },
        });
        validateChainCandidateTasks(tasks, input.taskIds);

        await tx
          .delete(uoeTaskChainItems)
          .where(eq(uoeTaskChainItems.chainId, input.id));
        await tx.insert(uoeTaskChainItems).values(
          input.taskIds.map((taskId, index) => ({
            chainId: input.id,
            taskId,
            position: index + 1,
          })),
        );

        return { id: input.id };
      });
    }),

  deleteUoeTaskChain: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .update(uoeTaskChains)
        .set({ isDeleted: true })
        .where(
          and(
            eq(uoeTaskChains.id, input.id),
            eq(uoeTaskChains.isDeleted, false),
          ),
        )
        .returning({ id: uoeTaskChains.id });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Цепочка не найдена",
        });
      }

      return { success: true, id: deleted.id };
    }),

  getUoeTasks: adminProcedure
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

      let tasks = await ctx.db.query.uoeTasks.findMany({
        where: and(
          eq(uoeTasks.isDeleted, false),
          topicId !== undefined ? eq(uoeTasks.topicId, topicId) : undefined,
        ),
        with: {
          topic: true,
        },
        orderBy: (tasksTable, { asc, desc }) => [
          sortOrder === "asc"
            ? asc(tasksTable[sortBy === "topicTitle" ? "id" : sortBy])
            : desc(tasksTable[sortBy === "topicTitle" ? "id" : sortBy]),
        ],
      });

      if (search && search.trim() !== "") {
        const term = search.toLowerCase().trim();
        tasks = tasks.filter((t) => {
          const topicTitle = t.topic?.title?.toLowerCase() ?? "";
          const idStr = t.id.toString();
          const taskStr = t.task.toLowerCase();
          const originStr = t.origin.toLowerCase();
          const answerStr = t.answer.toLowerCase();
          return (
            topicTitle.includes(term) ||
            idStr.includes(term) ||
            taskStr.includes(term) ||
            originStr.includes(term) ||
            answerStr.includes(term)
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

  getUoeTaskById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.query.uoeTasks.findFirst({
        where: and(eq(uoeTasks.id, input.id), eq(uoeTasks.isDeleted, false)),
        with: {
          topic: true,
        },
      });

      if (!task) return null;
      return task;
    }),

  createUoeTask: adminProcedure
    .input(uoeTaskInputSchema)
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(uoeTasks)
        .values({
          topicId: input.topicId,
          task: input.task.trim(),
          origin: input.origin.trim().toUpperCase(),
          answer: input.answer.trim().toUpperCase(),
          isDeleted: false,
        })
        .returning();

      return inserted;
    }),

  updateUoeTask: adminProcedure
    .input(
      uoeTaskInputSchema.extend({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const topic = await tx.query.trainingTopics.findFirst({
          where: eq(trainingTopics.id, input.topicId),
        });
        if (!topic) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Выбранная тема не найдена",
          });
        }

        const makesLinkedTaskInvalid =
          !topic.isActive ||
          topic.category !== "use-of-english" ||
          topic.title === "Словообразование";
        if (makesLinkedTaskInvalid) {
          const linkedChains = await tx
            .select({ chainId: uoeTaskChainItems.chainId })
            .from(uoeTaskChainItems)
            .innerJoin(
              uoeTaskChains,
              eq(uoeTaskChains.id, uoeTaskChainItems.chainId),
            )
            .where(
              and(
                eq(uoeTaskChainItems.taskId, input.id),
                eq(uoeTaskChains.isDeleted, false),
              ),
            );

          if (linkedChains.length > 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: `Задание #${input.id} используется в цепочках ${linkedChains
                .map(({ chainId }) => `#${chainId}`)
                .join(", ")} и не может быть перенесено в выбранную тему`,
            });
          }
        }

        const [updated] = await tx
          .update(uoeTasks)
          .set({
            topicId: input.topicId,
            task: input.task.trim(),
            origin: input.origin.trim().toUpperCase(),
            answer: input.answer.trim().toUpperCase(),
          })
          .where(eq(uoeTasks.id, input.id))
          .returning();

        return updated;
      });
    }),

  deleteUoeTasks: adminProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const links = await tx
          .select({
            taskId: uoeTaskChainItems.taskId,
            chainId: uoeTaskChainItems.chainId,
          })
          .from(uoeTaskChainItems)
          .innerJoin(
            uoeTaskChains,
            eq(uoeTaskChains.id, uoeTaskChainItems.chainId),
          )
          .where(
            and(
              inArray(uoeTaskChainItems.taskId, input.ids),
              eq(uoeTaskChains.isDeleted, false),
            ),
          );

        if (links.length > 0) {
          const taskIds = [...new Set(links.map(({ taskId }) => taskId))];
          const chainIds = [...new Set(links.map(({ chainId }) => chainId))];
          throw new TRPCError({
            code: "CONFLICT",
            message: `Нельзя удалить задания ${taskIds
              .map((id) => `#${id}`)
              .join(", ")}: они используются в цепочках ${chainIds
              .map((id) => `#${id}`)
              .join(", ")}. Сначала удалите задания из этих цепочек.`,
          });
        }

        await tx
          .update(uoeTasks)
          .set({ isDeleted: true })
          .where(inArray(uoeTasks.id, input.ids));

        return { success: true, deletedCount: input.ids.length };
      });
    }),
});
