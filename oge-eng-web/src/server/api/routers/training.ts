import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { trainingTopics } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const trainingRouter = createTRPCRouter({
  getTopicsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.trainingTopics.findMany({
        where: eq(trainingTopics.category, input.category),
      });
    }),
});
