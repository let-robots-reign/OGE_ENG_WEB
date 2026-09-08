import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  getActivity,
  getRecentActivity,
  getStreak,
  getSubjectProgress,
} from "@/server/api/lib/progress";

export const userRouter = createTRPCRouter({
  /** DB-authoritative identity for the profile header (avoids JWT staleness). */
  getProfileHeader: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
        telegramUsername: true,
        school: true,
        examPointsGoal: true,
        notificationsWeekly: true,
        notificationsMarketing: true,
      },
    });
    return (
      user ?? {
        name: ctx.session.user.name ?? null,
        email: ctx.session.user.email ?? "",
        image: ctx.session.user.image ?? null,
        emailVerified: null,
        role: ctx.session.user.role ?? null,
        telegramUsername: null,
        school: null,
        examPointsGoal: null,
        notificationsWeekly: true,
        notificationsMarketing: false,
      }
    );
  }),

  getStreak: protectedProcedure
    .input(z.object({ timeZone: z.string() }))
    .query(({ ctx, input }) =>
      getStreak(ctx.db, ctx.session.user.id, input.timeZone),
    ),

  /** Streak + best streak + per-day activity heatmap for the last `weeks` weeks. */
  getActivity: protectedProcedure
    .input(
      z.object({
        timeZone: z.string(),
        weeks: z.number().int().min(1).max(53).default(16),
      }),
    )
    .query(({ ctx, input }) =>
      getActivity(ctx.db, ctx.session.user.id, input.timeZone, input.weeks),
    ),

  /** Progress per exam section: tasks done / available + average score. */
  getSubjectProgress: protectedProcedure.query(({ ctx }) =>
    getSubjectProgress(ctx.db, ctx.session.user.id),
  ),

  /** Most recent activity rows, shaped for the history table. */
  getRecentActivity: protectedProcedure
    .input(
      z.object({ limit: z.number().int().min(1).max(50).default(8) }).default({
        limit: 8,
      }),
    )
    .query(({ ctx, input }) =>
      getRecentActivity(ctx.db, ctx.session.user.id, input.limit),
    ),

  /** Update editable identity fields. */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(255),
        email: z.string().trim().email().max(255),
        telegramUsername: z.string().trim().max(255).nullable(),
        school: z.string().trim().max(255).nullable(),
        examPointsGoal: z.number().int().min(0).max(35).nullable(),
        notificationsWeekly: z.boolean(),
        notificationsMarketing: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.query.users.findFirst({
        where: and(eq(users.email, input.email), ne(users.id, userId)),
        columns: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Этот e-mail уже используется.",
        });
      }

      await ctx.db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          telegramUsername: input.telegramUsername,
          school: input.school,
          examPointsGoal: input.examPointsGoal,
          notificationsWeekly: input.notificationsWeekly,
          notificationsMarketing: input.notificationsMarketing,
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),
});
