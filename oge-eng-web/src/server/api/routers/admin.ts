import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { userResults } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const diagnosticDetailsSchema = z.object({
  feedback: z.string(),
  userAnswers: z.any(),
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
});
