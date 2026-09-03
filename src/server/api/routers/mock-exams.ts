import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNull, lt } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type { createTRPCContext } from "@/server/api/trpc";
import {
  mockExamAttempts,
  mockExamSlotEnum,
  mockExams,
  userResults,
  type MockExamAnswer,
  type MockExamSnapshot,
} from "@/server/db/schema";
import {
  gradeMockExam,
  isMockExamResultDetails,
  MOCK_EXAM_SECONDS,
  MOCK_EXAM_SLOT_META,
  MOCK_EXAM_SLOT_ORDER,
  toStudentSnapshot,
} from "@/server/api/lib/mock-exams";

const answerSchema = z.union([z.number(), z.string().max(200)]).nullable();

async function loadSnapshot(
  db: Awaited<ReturnType<typeof createTRPCContext>>["db"],
  mockExamId: number,
): Promise<MockExamSnapshot> {
  const exam = await db.query.mockExams.findFirst({
    where: eq(mockExams.id, mockExamId),
    with: {
      parts: {
        with: {
          audioTask: { with: { topic: true } },
          readingTask: { with: { topic: true } },
          uoeTaskChain: {
            with: {
              topic: true,
              items: {
                with: { task: true },
                orderBy: (items, { asc }) => [asc(items.position)],
              },
            },
          },
        },
      },
    },
  });

  if (!exam) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Вариант не найден" });
  }

  const partBySlot = new Map(exam.parts.map((part) => [part.slot, part]));
  const parts = MOCK_EXAM_SLOT_ORDER.map((slot) => {
    const part = partBySlot.get(slot);
    const meta = MOCK_EXAM_SLOT_META[slot];
    if (!part) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `В варианте не заполнена часть «${meta.label}»`,
      });
    }

    if (meta.kind === "audio") {
      const task = part.audioTask;
      if (
        !task ||
        task.isDeleted ||
        !task.topic?.isActive ||
        task.topic.title !== meta.topicTitle
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Задание части «${meta.label}» недоступно`,
        });
      }
      return {
        slot,
        label: meta.label,
        kind: meta.kind,
        topicTitle: task.topic.title,
        resourceId: task.id,
        taskType: task.taskType,
        total: task.answers.length,
        audioUrl: task.audioUrl,
        questions: task.questions,
        correctAnswers: task.answers,
        explanations: task.explanations,
      };
    }

    if (meta.kind === "reading") {
      const task = part.readingTask;
      if (
        !task ||
        task.isDeleted ||
        !task.topic?.isActive ||
        task.topic.title !== meta.topicTitle
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Задание части «${meta.label}» недоступно`,
        });
      }
      return {
        slot,
        label: meta.label,
        kind: meta.kind,
        topicTitle: task.topic.title,
        resourceId: task.id,
        taskType: task.taskType,
        total: task.answers.length,
        texts: task.texts,
        headings: task.headings,
        correctAnswers: task.answers,
        explanations: task.explanations,
      };
    }

    const chain = part.uoeTaskChain;
    if (
      !chain ||
      chain.isDeleted ||
      !chain.topic?.isActive ||
      chain.topic.title !== meta.topicTitle ||
      chain.items.length === 0 ||
      chain.items.some((item) => item.task.isDeleted)
    ) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `Цепочка части «${meta.label}» недоступна`,
      });
    }
    return {
      slot,
      label: meta.label,
      kind: meta.kind,
      topicTitle: chain.topic.title,
      resourceId: chain.id,
      total: chain.items.length,
      tasks: chain.items.map(({ task }) => ({
        id: task.id,
        task: task.task,
        origin: task.origin,
        answer: task.answer,
      })),
    };
  });

  return {
    version: 1,
    mockExam: { id: exam.id, title: exam.title, order: exam.order },
    parts,
  };
}

export const mockExamsRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const exams = await ctx.db.query.mockExams.findMany({
      orderBy: (exam, { asc }) => [asc(exam.order), asc(exam.id)],
    });
    const examIds = exams.map((exam) => exam.id);
    const results =
      ctx.session?.user && examIds.length
        ? await ctx.db.query.userResults.findMany({
            where: and(
              eq(userResults.userId, ctx.session.user.id),
              eq(userResults.activityType, "mock_exam"),
              inArray(userResults.activityId, examIds),
            ),
            orderBy: (result, { desc }) => [desc(result.createdAt)],
          })
        : [];
    const latestByExam = new Map<number, (typeof results)[number]>();
    results.forEach((result) => {
      if (!latestByExam.has(result.activityId)) {
        latestByExam.set(result.activityId, result);
      }
    });

    return exams.map((exam) => {
      const latest = latestByExam.get(exam.id);
      const details = isMockExamResultDetails(latest?.details)
        ? latest.details
        : null;
      return {
        id: exam.id,
        title: exam.title,
        order: exam.order,
        latestResult: latest
          ? {
              id: latest.id,
              correct: details?.correctCount ?? null,
              total: details?.total ?? null,
              percentage: details?.percentage ?? null,
              grade: details?.grade ?? null,
              createdAt: latest.createdAt,
            }
          : null,
      };
    });
  }),

  getSummary: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const exam = await ctx.db.query.mockExams.findFirst({
        where: eq(mockExams.id, input.id),
        with: { parts: true },
      });
      if (!exam) return null;
      const slots = new Set(exam.parts.map((part) => part.slot));
      return {
        id: exam.id,
        title: exam.title,
        isReady: MOCK_EXAM_SLOT_ORDER.every((slot) => slots.has(slot)),
        parts: MOCK_EXAM_SLOT_ORDER.map((slot) => ({
          slot,
          label: MOCK_EXAM_SLOT_META[slot].label,
          kind: MOCK_EXAM_SLOT_META[slot].kind,
        })),
      };
    }),

  start: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      await ctx.db
        .delete(mockExamAttempts)
        .where(
          and(
            eq(mockExamAttempts.userId, ctx.session.user.id),
            isNull(mockExamAttempts.completedAt),
            lt(mockExamAttempts.expiresAt, now),
          ),
        );
      const snapshot = await loadSnapshot(ctx.db, input.id);
      const [attempt] = await ctx.db
        .insert(mockExamAttempts)
        .values({
          userId: ctx.session.user.id,
          mockExamId: input.id,
          snapshot,
          startedAt: now,
          expiresAt: new Date(now.getTime() + MOCK_EXAM_SECONDS * 1000),
        })
        .returning();
      if (!attempt) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось начать вариант",
        });
      }
      return {
        attemptKey: attempt.id,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        ...toStudentSnapshot(snapshot),
      };
    }),

  complete: protectedProcedure
    .input(
      z.object({
        attemptKey: z.string().uuid(),
        timedOut: z.boolean(),
        answers: z
          .array(
            z.object({
              slot: z.enum(mockExamSlotEnum.enumValues),
              values: z.array(answerSchema).max(30),
            }),
          )
          .length(MOCK_EXAM_SLOT_ORDER.length),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.userResults.findFirst({
        where: and(
          eq(userResults.userId, ctx.session.user.id),
          eq(userResults.attemptKey, input.attemptKey),
        ),
      });
      if (existing && isMockExamResultDetails(existing.details)) {
        return { resultId: existing.id, details: existing.details };
      }

      const attempt = await ctx.db.query.mockExamAttempts.findFirst({
        where: and(
          eq(mockExamAttempts.id, input.attemptKey),
          eq(mockExamAttempts.userId, ctx.session.user.id),
        ),
      });
      if (!attempt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Попытка не найдена",
        });
      }

      const submittedSlots = new Set(
        input.answers.map((answer) => answer.slot),
      );
      if (
        submittedSlots.size !== MOCK_EXAM_SLOT_ORDER.length ||
        !MOCK_EXAM_SLOT_ORDER.every((slot) => submittedSlots.has(slot))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ответы должны содержать все семь частей варианта",
        });
      }
      for (const part of attempt.snapshot.parts) {
        const submitted = input.answers.find(
          (answer) => answer.slot === part.slot,
        );
        const expectsText =
          part.kind === "uoe" ||
          (part.kind === "audio" && part.taskType === "gap_fill");
        const hasInvalidValue =
          submitted?.values.some(
            (value) =>
              value !== null &&
              (expectsText
                ? typeof value !== "string"
                : typeof value !== "number"),
          ) ?? true;
        if (submitted?.values.length !== part.total || hasInvalidValue) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Некорректные ответы для части «${part.label}»`,
          });
        }
      }

      const now = new Date();
      const expired = now >= attempt.expiresAt;
      const timedOut = input.timedOut || expired;
      const elapsed = Math.max(
        0,
        Math.ceil((now.getTime() - attempt.startedAt.getTime()) / 1000),
      );
      const timeSpent = timedOut
        ? MOCK_EXAM_SECONDS
        : Math.min(MOCK_EXAM_SECONDS, elapsed);
      const details = gradeMockExam(
        attempt.snapshot,
        input.answers as Array<{
          slot: (typeof mockExamSlotEnum.enumValues)[number];
          values: MockExamAnswer[];
        }>,
        { attemptKey: input.attemptKey, timeSpent, timedOut },
      );

      const saved = await ctx.db.transaction(async (tx) => {
        const [claimed] = await tx
          .update(mockExamAttempts)
          .set({ completedAt: now })
          .where(
            and(
              eq(mockExamAttempts.id, attempt.id),
              eq(mockExamAttempts.userId, ctx.session.user.id),
              isNull(mockExamAttempts.completedAt),
            ),
          )
          .returning({ id: mockExamAttempts.id });
        if (!claimed) return null;

        const [result] = await tx
          .insert(userResults)
          .values({
            userId: ctx.session.user.id,
            activityId: attempt.mockExamId,
            activityType: "mock_exam",
            result: `${details.correctCount}/${details.total}`,
            timeSpent,
            attemptKey: attempt.id,
            details,
          })
          .returning({ id: userResults.id });
        return result ?? null;
      });

      if (!saved) {
        const repeated = await ctx.db.query.userResults.findFirst({
          where: eq(userResults.attemptKey, input.attemptKey),
        });
        if (repeated && isMockExamResultDetails(repeated.details)) {
          return { resultId: repeated.id, details: repeated.details };
        }
        throw new TRPCError({
          code: "CONFLICT",
          message: "Попытка уже завершена",
        });
      }

      return { resultId: saved.id, details };
    }),

  getResult: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.userResults.findFirst({
        where: and(
          eq(userResults.id, input.id),
          eq(userResults.activityType, "mock_exam"),
        ),
      });
      if (!result || !isMockExamResultDetails(result.details)) return null;
      if (
        result.userId !== ctx.session.user.id &&
        ctx.session.user.role !== "admin"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return {
        id: result.id,
        createdAt: result.createdAt,
        details: result.details,
      };
    }),
});
