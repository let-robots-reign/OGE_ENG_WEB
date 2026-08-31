import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { and, eq } from "drizzle-orm";
import { userResults } from "@/server/db/schema";
import {
  diagnosticsSubmissionSchema,
  prepareDiagnostics,
} from "@/server/api/lib/diagnostics-input";
import {
  reserveDiagnostics,
  savePartialDiagnostics,
  getPendingDiagnostics,
  checkpointDiagnostics,
  finishDiagnostics,
  failDiagnostics,
  recordDiagnosticsAttempt,
} from "@/server/api/lib/diagnostics-storage";
import { checkGrammar } from "@/server/api/lib/diagnostics";

export const diagnosticsRouter = createTRPCRouter({
  hasCompletedDiagnostics: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.userResults.findFirst({
      where: and(
        eq(userResults.userId, ctx.session.user.id),
        eq(userResults.activityType, "diagnostics"),
      ),
    });
    return !!result;
  }),

  // Returns the user's most recent diagnostics feedback so they can revisit it.
  getDiagnosticsResult: protectedProcedure.query(async ({ ctx }) => {
    const row = await ctx.db.query.userResults.findFirst({
      where: and(
        eq(userResults.userId, ctx.session.user.id),
        eq(userResults.activityType, "diagnostics"),
      ),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });

    if (!row) return null;

    const details = row.details as { feedback?: string } | null;
    return {
      feedback: details?.feedback ?? "",
      createdAt: row.createdAt,
    };
  }),

  getPendingDiagnostics: protectedProcedure.query(({ ctx }) =>
    getPendingDiagnostics(ctx.db, ctx.session.user.id),
  ),

  checkGrammar: protectedProcedure
    .input(diagnosticsSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const reservation = await reserveDiagnostics(
        ctx.db,
        ctx.session.user.id,
        input,
      );
      if (reservation.feedback) return { feedback: reservation.feedback };
      try {
        const result = await checkGrammar(prepareDiagnostics(input), {
          runId: reservation.id,
          cachedBatches: reservation.batches,
          onAttempt: (attempt) =>
            recordDiagnosticsAttempt(ctx.db, reservation.id, attempt),
          checkpoint: (batch) =>
            checkpointDiagnostics(ctx.db, reservation.id, batch),
        });
        if (result.complete)
          await finishDiagnostics(
            ctx.db,
            reservation.id,
            ctx.session.user.id,
            input,
            result.feedback,
          );
        else
          await savePartialDiagnostics(
            ctx.db,
            reservation.id,
            input,
            result.feedback,
          );
        // Preserve the public response; completion/resume state has its own query.
        return { feedback: result.feedback };
      } catch (error) {
        await failDiagnostics(ctx.db, reservation.id).catch(() => {
          console.error("Diagnostics reservation cleanup failed", {
            runId: reservation.id,
          });
        });
        throw error;
      }
    }),
});
