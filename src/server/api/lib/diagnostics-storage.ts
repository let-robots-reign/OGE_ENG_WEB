import { createHash, randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { db } from "@/server/db";
import { diagnosticsRuns, userResults } from "@/server/db/schema";
import {
  diagnosticsSubmissionSchema,
  type DiagnosticsSubmission,
} from "./diagnostics-input";
import type { BatchCheckpoint } from "./diagnostics";
import type { ProviderAttempt } from "./diagnostics-provider";
import { env } from "@/env";

const rateLimit = () =>
  new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message:
      "Сейчас достигнут лимит проверок. Подожди немного или вернись к проверке позднее. Готовый результат сохранится в профиле.",
  });

export async function reserveDiagnostics(
  database: typeof db,
  userId: string,
  input: DiagnosticsSubmission,
) {
  const inputHash = createHash("sha256")
    .update(
      JSON.stringify({
        ...input,
        part1: [...input.part1].sort((a, b) => a.id - b.id),
        part2: [...input.part2].sort((a, b) => a.id - b.id),
      }),
    )
    .digest("hex");
  return database.transaction(async (tx) => {
    // A short, shared database lock makes reservation counts atomic across all
    // workers/instances. Never hold this lock during a provider request.
    await tx.execute(sql`select pg_advisory_xact_lock(9372104)`);
    const [previous] = await tx
      .select()
      .from(diagnosticsRuns)
      .where(
        and(
          eq(diagnosticsRuns.userId, userId),
          eq(diagnosticsRuns.inputHash, inputHash),
          sql`${diagnosticsRuns.createdAt} > now() - interval '24 hours'`,
        ),
      )
      .orderBy(desc(diagnosticsRuns.createdAt))
      .limit(1);
    if (previous?.status === "completed" && previous.feedback) {
      return {
        id: previous.id,
        feedback: previous.feedback,
        batches: previous.batches,
      };
    }
    const [counts] = await tx
      .select({
        total: sql<number>`count(*)::int`,
        user: sql<number>`count(*) filter (where ${diagnosticsRuns.userId} = ${userId})::int`,
        active: sql<number>`count(*) filter (where ${diagnosticsRuns.status} = 'running' and ${diagnosticsRuns.expiresAt} > now())::int`,
        userBusy: sql<number>`count(*) filter (where ${diagnosticsRuns.userId} = ${userId} and ((${diagnosticsRuns.status} = 'running' and ${diagnosticsRuns.expiresAt} > now()) or ${diagnosticsRuns.createdAt} > now() - interval '60 seconds'))::int`,
      })
      .from(diagnosticsRuns)
      .where(sql`${diagnosticsRuns.createdAt} > now() - interval '24 hours'`);
    if (
      !counts ||
      counts.total >= env.DIAGNOSTICS_DAILY_LIMIT ||
      counts.user >= 3 ||
      counts.active >= 2 ||
      counts.userBusy > 0
    )
      throw rateLimit();
    const id = randomUUID();
    const batches = previous?.batches ?? {};
    await tx.insert(diagnosticsRuns).values({
      id,
      userId,
      inputHash,
      status: "running",
      batches,
      expiresAt: new Date(Date.now() + 300_000),
    });
    return { id, feedback: null, batches };
  });
}

export async function checkpointDiagnostics(
  database: typeof db,
  id: string,
  batch: BatchCheckpoint,
) {
  // The legacy JSON column holds validated Part 2 items under "part2".
  // Preserve it if report persistence fails after the provider has succeeded.
  await database
    .update(diagnosticsRuns)
    .set({
      batches: sql`${diagnosticsRuns.batches} || ${JSON.stringify({ [batch.key]: { items: batch.items, source: batch.source } })}::jsonb`,
    })
    .where(eq(diagnosticsRuns.id, id));
}

export async function recordDiagnosticsAttempt(
  database: typeof db,
  id: string,
  attempt: ProviderAttempt,
) {
  await database
    .update(diagnosticsRuns)
    .set({
      batches: sql`jsonb_set(${diagnosticsRuns.batches}, '{_attempts}', coalesce(${diagnosticsRuns.batches}->'_attempts', '[]'::jsonb) || ${JSON.stringify([attempt])}::jsonb, true)`,
    })
    .where(eq(diagnosticsRuns.id, id));
}

export async function finishDiagnostics(
  database: typeof db,
  id: string,
  userId: string,
  input: DiagnosticsSubmission,
  feedback: string,
) {
  await database.transaction(async (tx) => {
    await tx.insert(userResults).values({
      userId,
      activityId: 1,
      activityType: "diagnostics",
      result: "",
      details: {
        version: input.version,
        runId: id,
        feedback,
        userAnswers: {
          part1: Object.fromEntries(
            input.part1.map((task) => [task.id, task.userAnswers]),
          ),
          part2: Object.fromEntries(
            input.part2.map((task) => [task.id, task.userTranslation]),
          ),
        },
      },
    });
    await tx
      .update(diagnosticsRuns)
      .set({ status: "completed", feedback })
      .where(eq(diagnosticsRuns.id, id));
  });
}

export async function failDiagnostics(database: typeof db, id: string) {
  await database
    .update(diagnosticsRuns)
    .set({ status: "failed" })
    .where(eq(diagnosticsRuns.id, id));
}

// Partial reports stay outside user_result: they must not award completion,
// lock students out of diagnostics, or be returned as a completed cache hit.
export async function savePartialDiagnostics(
  database: typeof db,
  id: string,
  input: DiagnosticsSubmission,
  feedback: string,
) {
  await database
    .update(diagnosticsRuns)
    .set({
      status: "partial",
      feedback,
      batches: sql`${diagnosticsRuns.batches} || ${JSON.stringify({ _submission: input })}::jsonb`,
    })
    .where(eq(diagnosticsRuns.id, id));
}

export async function getPendingDiagnostics(
  database: typeof db,
  userId: string,
) {
  const [row] = await database
    .select()
    .from(diagnosticsRuns)
    .where(
      and(
        eq(diagnosticsRuns.userId, userId),
        sql`${diagnosticsRuns.status} in ('partial', 'completed')`,
      ),
    )
    .orderBy(desc(diagnosticsRuns.createdAt))
    .limit(1);
  if (row?.status !== "partial" || !row.feedback) return null;
  const batches = row.batches as Record<string, unknown>;
  const parsed = diagnosticsSubmissionSchema.safeParse(batches._submission);
  if (!parsed.success) return null; // An obsolete question version cannot resume.
  return { feedback: row.feedback, submission: parsed.data };
}
