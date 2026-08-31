import { request, type FullConfig } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { loadEnvFile } from "node:process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import bcrypt from "bcryptjs";

// Explicit opt-in only. Normal live runs use an existing test-account session.
export default async function setup(config: FullConfig) {
  if (process.env.DIAGNOSTICS_CREATE_LOCAL_TEST_USER !== "1") return;
  if (!process.env.DATABASE_URL) loadEnvFile(".env");
  const url = process.env.DATABASE_URL!;
  const baseURL = config.projects[0]!.use.baseURL!;
  const local = (value: string) =>
    ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname);
  if (!local(url) || !local(baseURL))
    throw new Error("Temporary students may only be created on localhost.");

  const directory = path.resolve("tests/e2e/test-results/live-auth");
  await mkdir(directory, { recursive: true });
  const statePath = path.join(directory, "session.json");
  const database = postgres(url, { max: 1 });
  const id = randomUUID();
  const email = `diagnostics-test-${id}@example.com`;
  const password = randomUUID();
  const context = await request.newContext({ baseURL });
  const cleanup = async () => {
    try {
      // Only this run's generated account and its cascading results are removed.
      await database`delete from "user" where id=${id} and email=${email}`;
    } finally {
      await database.end();
      await context.dispose();
      await rm(statePath, { force: true });
    }
  };
  try {
    await database`insert into "user" (id, name, email, "hashedPassword", role)
      values (${id}, 'Test student', ${email}, ${await bcrypt.hash(password, 10)}, 'student')`;
    const csrf = await context.get("/api/auth/csrf");
    const { csrfToken } = (await csrf.json()) as { csrfToken: string };
    await context.post("/api/auth/callback/credentials", {
      form: { csrfToken, email, password, callbackUrl: baseURL },
      headers: { "X-Auth-Return-Redirect": "1" },
    });
    const sessionResponse = await context.get("/api/auth/session");
    const session = (await sessionResponse.json()) as {
      user?: { id?: string };
    };
    if (session.user?.id !== id)
      throw new Error("Real test-student sign-in failed");
    await context.storageState({ path: statePath });
    process.env.DIAGNOSTICS_TEST_STORAGE_STATE = statePath;
  } catch (error) {
    await cleanup();
    throw error;
  }
  return async () => {
    try {
      const runs =
        await database`select id, status, batches from diagnostics_run where "userId"=${id}`;
      const provenance = runs.map((run) => ({
        runId: run.id as string,
        status: run.status as string,
        attempts: (run.batches as Record<string, unknown>)._attempts ?? [],
        batches: Object.entries(
          run.batches as Record<string, { source?: unknown }>,
        )
          .filter(([key]) => key !== "_attempts")
          .map(([key, batch]) => ({ key, source: batch.source ?? null })),
      }));
      await writeFile(
        path.join(config.projects[0]!.outputDir, "provider-provenance.json"),
        JSON.stringify(provenance, null, 2),
      );
      console.info(
        "Live diagnostics provider provenance:",
        JSON.stringify(provenance),
      );
      for (const run of provenance.filter(
        (run) => run.status === "completed",
      )) {
        if (run.batches.length !== 1 || run.batches[0]?.key !== "part2")
          throw new Error(
            "Expected one complete Part 2 evaluation, not multiple batches",
          );
      }
    } finally {
      await cleanup();
    }
  };
}
