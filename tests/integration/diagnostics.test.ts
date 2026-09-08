import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql } from "drizzle-orm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import * as schema from "@/server/db/schema";
import {
  reserveDiagnostics,
  savePartialDiagnostics,
  getPendingDiagnostics,
  checkpointDiagnostics,
  finishDiagnostics,
  failDiagnostics,
  recordDiagnosticsAttempt,
} from "@/server/api/lib/diagnostics-storage";
import { testStudentSubmission } from "../unit/fixtures/diagnostics";

vi.mock("@/env", () => ({ env: { DIAGNOSTICS_DAILY_LIMIT: 100 } }));

const url = process.env.DATABASE_URL!;
if (
  !url ||
  !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)
) {
  throw new Error(
    "These integration tests require a local PostgreSQL DATABASE_URL.",
  );
}
const namespace = `diagnostics_test_${randomUUID().replaceAll("-", "")}`;
const admin = postgres(url, { max: 1 });
const client = postgres(url, {
  max: 5,
  connection: { search_path: namespace },
});
const database = drizzle(client, { schema });
let created = false;

beforeAll(async () => {
  await admin.unsafe(`CREATE SCHEMA "${namespace}"`);
  created = true;
  await client.unsafe('CREATE TABLE "user" (id varchar(255) PRIMARY KEY)');
  const migration = (
    await readFile("drizzle/0017_diagnostics_runs.sql", "utf8")
  ).replace('REFERENCES "public"."user"', `REFERENCES "${namespace}"."user"`);
  await client.unsafe(migration);
  await client.unsafe(`CREATE TABLE user_result (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "userId" varchar(255) REFERENCES "user"(id), activity_type text NOT NULL,
    "activityId" integer NOT NULL, result varchar(255) NOT NULL,
    "taskId" integer, "timeSpent" integer, "attemptKey" varchar(255) UNIQUE, details jsonb,
    "createdAt" timestamptz NOT NULL DEFAULT now()
  )`);
  await client.unsafe(
    `INSERT INTO "user" VALUES ('student-a'), ('student-b'), ('student-c')`,
  );
});
beforeEach(async () => {
  await client.unsafe("TRUNCATE diagnostics_run, user_result");
});
afterAll(async () => {
  await client.end();
  if (created) await admin.unsafe(`DROP SCHEMA "${namespace}" CASCADE`);
  await admin.end();
});

const input = testStudentSubmission;
describe("shared database reservations and saved reports", () => {
  it("preserves failure history and the evaluation checkpoint without overwriting either", async () => {
    const run = await reserveDiagnostics(database, "student-a", input);
    const attempt = {
      provider: "Gemini",
      model: "gemini-3.6-flash",
      runId: run.id,
      outcome: "failed" as const,
      elapsedMs: 100,
      status: 429,
      failure: "rate_limited",
    };
    await recordDiagnosticsAttempt(database, run.id, attempt);
    await checkpointDiagnostics(database, run.id, { key: "part2", items: [] });
    await recordDiagnosticsAttempt(database, run.id, {
      ...attempt,
      provider: "Groq",
      model: "openai/gpt-oss-120b",
    });
    await failDiagnostics(database, run.id);
    const [row] = await database.select().from(schema.diagnosticsRuns);
    expect(row?.batches).toEqual({
      part2: { items: [] },
      _attempts: [
        attempt,
        { ...attempt, provider: "Groq", model: "openai/gpt-oss-120b" },
      ],
    });
  });

  it("persists partial progress without completion, preserves it on retry, and hides it after completion", async () => {
    const run = await reserveDiagnostics(database, "student-a", input);
    await checkpointDiagnostics(database, run.id, { key: "part2", items: [] });
    await savePartialDiagnostics(database, run.id, input, "Partial report");
    expect(await database.select().from(schema.userResults)).toHaveLength(0);
    expect(
      (await database.select().from(schema.diagnosticsRuns))[0]?.status,
    ).toBe("partial");
    expect(await getPendingDiagnostics(database, "student-a")).toEqual({
      feedback: "Partial report",
      submission: input,
    });
    expect(await getPendingDiagnostics(database, "student-b")).toBeNull();
    // Partial reports remain subject to the same cooldown, not a completed cache hit.
    await expect(
      reserveDiagnostics(database, "student-a", input),
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    await database
      .update(schema.diagnosticsRuns)
      .set({ createdAt: sql`now() - interval '2 minutes'` })
      .where(eq(schema.diagnosticsRuns.id, run.id));
    const retry = await reserveDiagnostics(database, "student-a", input);
    expect(retry.feedback).toBeNull();
    expect(retry.batches).toMatchObject({ part2: { items: [] } });
    // A failed retry does not make the last partial report disappear on reload.
    await failDiagnostics(database, retry.id);
    expect((await getPendingDiagnostics(database, "student-a"))?.feedback).toBe(
      "Partial report",
    );
    await finishDiagnostics(
      database,
      retry.id,
      "student-a",
      input,
      "Complete report",
    );
    expect(await getPendingDiagnostics(database, "student-a")).toBeNull();
    expect(await database.select().from(schema.userResults)).toHaveLength(1);
    expect(
      (await reserveDiagnostics(database, "student-a", input)).feedback,
    ).toBe("Complete report");
  });

  it("does not reuse old checkpoints if the student changes an answer", async () => {
    const run = await reserveDiagnostics(database, "student-a", input);
    await checkpointDiagnostics(database, run.id, { key: "part2", items: [] });
    await savePartialDiagnostics(database, run.id, input, "Partial report");
    await database
      .update(schema.diagnosticsRuns)
      .set({ createdAt: sql`now() - interval '2 minutes'` })
      .where(eq(schema.diagnosticsRuns.id, run.id));
    const changed = structuredClone(input);
    changed.part2[0]!.userTranslation = "A different answer.";
    expect(
      (await reserveDiagnostics(database, "student-a", changed)).batches,
    ).toEqual({});
  });

  it("allows only one concurrent reservation for the same student", async () => {
    const results = await Promise.allSettled([
      reserveDiagnostics(database, "student-a", input),
      reserveDiagnostics(database, "student-a", input),
    ]);
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.find((result) => result.status === "rejected"),
    ).toMatchObject({ reason: { code: "TOO_MANY_REQUESTS" } });
    expect(await database.select().from(schema.diagnosticsRuns)).toHaveLength(
      1,
    );
  });
  it("caps all workers at two active reports", async () => {
    const results = await Promise.allSettled(
      ["student-a", "student-b", "student-c"].map((id) =>
        reserveDiagnostics(database, id, input),
      ),
    );
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(2);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
  });
  it("counts failed attempts toward user and global rolling quotas", async () => {
    const rows = Array.from({ length: 3 }, () => ({
      id: randomUUID(),
      userId: "student-a",
      inputHash: "seed",
      status: "failed",
      createdAt: new Date(Date.now() - 120_000),
      expiresAt: new Date(),
    }));
    await database.insert(schema.diagnosticsRuns).values(rows);
    await expect(
      reserveDiagnostics(database, "student-a", input),
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    await database
      .insert(schema.diagnosticsRuns)
      .values(
        Array.from({ length: 97 }, () => ({ ...rows[0]!, id: randomUUID() })),
      );
    await expect(
      reserveDiagnostics(database, "student-b", input),
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
  it("allows a new attempt after expired leases and the quota window", async () => {
    await database.insert(schema.diagnosticsRuns).values({
      id: randomUUID(),
      userId: "student-a",
      inputHash: "seed",
      status: "running",
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(
      (await reserveDiagnostics(database, "student-a", input)).feedback,
    ).toBeNull();
  });
  it("saves results atomically and reuses an identical completed report", async () => {
    const run = await reserveDiagnostics(database, "student-a", input);
    await finishDiagnostics(
      database,
      run.id,
      "student-a",
      input,
      "Verified report",
    );
    const cached = await reserveDiagnostics(database, "student-a", {
      ...input,
      part1: [...input.part1].reverse(),
    });
    expect(cached).toMatchObject({ id: run.id, feedback: "Verified report" });
    expect(await database.select().from(schema.userResults)).toHaveLength(1);
    expect(await database.select().from(schema.diagnosticsRuns)).toHaveLength(
      1,
    );
  });
  it("preserves validated checkpoints across failed attempts", async () => {
    const run = await reserveDiagnostics(database, "student-a", input);
    await checkpointDiagnostics(database, run.id, {
      key: "1,2,3,4,5",
      items: [],
      source: {
        provider: "Groq",
        model: "openai/gpt-oss-120b",
        elapsedMs: 123,
        runId: run.id,
      },
    });
    await failDiagnostics(database, run.id);
    await database
      .update(schema.diagnosticsRuns)
      .set({ createdAt: sql`now() - interval '2 minutes'` })
      .where(eq(schema.diagnosticsRuns.id, run.id));
    const retry = await reserveDiagnostics(database, "student-a", input);
    expect(retry.batches).toEqual({
      "1,2,3,4,5": {
        items: [],
        source: {
          provider: "Groq",
          model: "openai/gpt-oss-120b",
          elapsedMs: 123,
          runId: run.id,
        },
      },
    });
    expect(retry.id).not.toBe(run.id);
  });
  it("rolls back completion if the result cannot be stored", async () => {
    const run = await reserveDiagnostics(database, "student-a", input);
    await expect(
      finishDiagnostics(database, run.id, "missing-user", input, "Never saved"),
    ).rejects.toThrow();
    expect(await database.select().from(schema.userResults)).toHaveLength(0);
    expect(
      (await database.select().from(schema.diagnosticsRuns))[0]?.status,
    ).toBe("running");
  });
});
