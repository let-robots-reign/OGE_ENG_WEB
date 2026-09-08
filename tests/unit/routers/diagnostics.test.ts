/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  reserve: vi.fn(),
  finish: vi.fn(),
  partial: vi.fn(),
  pending: vi.fn(),
  fail: vi.fn(),
  checkpoint: vi.fn(),
  recordAttempt: vi.fn(),
  mockGeminiGenerate: vi.fn(),
  mockGroqCreate: vi.fn(),
}));

vi.mock("@/server/api/lib/diagnostics-storage", () => ({
  reserveDiagnostics: mocks.reserve,
  finishDiagnostics: mocks.finish,
  savePartialDiagnostics: mocks.partial,
  getPendingDiagnostics: mocks.pending,
  failDiagnostics: mocks.fail,
  checkpointDiagnostics: mocks.checkpoint,
  recordDiagnosticsAttempt: mocks.recordAttempt,
}));
vi.mock("@/server/db", () => ({
  db: {
    insert: vi.fn(),
    query: {
      userResults: {
        findFirst: vi.fn(),
      },
    },
  },
  userResults: {
    userId: "user_results_user_id",
  },
}));

vi.mock("@google/genai", () => ({
  FinishReason: { STOP: "STOP" },
  ThinkingLevel: { LOW: "LOW" },
  GoogleGenAI: class {
    models = {
      generateContent: mocks.mockGeminiGenerate,
    };
  },
}));

vi.mock("groq-sdk", () => ({
  default: class {
    chat = {
      completions: {
        create: mocks.mockGroqCreate,
      },
    };
  },
}));

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { diagnosticsRouter } from "@/server/api/routers/diagnostics";
import { createCallerFactory } from "@/server/api/trpc";
import { db } from "@/server/db";
import { part2Questions } from "@/shared/diagnostics-questions";
import { testStudentSubmission } from "../fixtures/diagnostics";

const createCaller = createCallerFactory(diagnosticsRouter);

describe("Diagnostics Router tRPC Procedures", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInput = structuredClone(testStudentSubmission);
  const session = {
    user: { id: "test-student", role: "student" as const },
    expires: "",
  };

  describe("hasCompletedDiagnostics", () => {
    it("should return false if no userResults record is found", async () => {
      vi.mocked(db.query.userResults.findFirst).mockResolvedValue(null as any);

      const caller = createCaller({
        db: db as any,
        session: {
          user: { id: "user-1", role: "student" as const },
          expires: "",
        },
        headers: new Headers(),
      });

      const res = await caller.hasCompletedDiagnostics();
      expect(res).toBe(false);
    });
  });

  describe("checkGrammar", () => {
    const caller = () =>
      createCaller({ db: db as any, session, headers: new Headers() });
    const evaluation = {
      id: 1,
      correct: true,
      correctedTranslation: null,
      topic: "Past Simple",
      explanation: "Ты правильно используешь Past Simple.",
      example: null,
    };
    const evaluations = mockInput.part2.map((task) => ({
      ...evaluation,
      id: task.id,
      topic: part2Questions.find((question) => question.id === task.id)!
        .topics[0],
    }));
    const json = JSON.stringify({ items: evaluations });
    const completion = (content = json, finish_reason = "stop") => ({
      choices: [{ finish_reason, message: { content } }],
    });
    const gemini = (content = json, finishReason = "STOP") => ({
      candidates: [{ finishReason, content: { parts: [{ text: content }] } }],
    });

    beforeEach(() => {
      mocks.reserve.mockReset().mockResolvedValue({
        id: "run-test",
        feedback: null,
        batches: {},
      });
      mocks.partial.mockReset().mockResolvedValue(undefined);
      mocks.finish.mockReset().mockResolvedValue(undefined);
      mocks.fail.mockReset().mockResolvedValue(undefined);
      mocks.checkpoint.mockReset().mockResolvedValue(undefined);
      mocks.mockGroqCreate.mockReset().mockResolvedValue(completion());
      mocks.mockGeminiGenerate.mockReset().mockResolvedValue(gemini());
    });

    it("uses Gemini 3.7 first with supported settings and preserves the feedback shape", async () => {
      const result = await caller().checkGrammar(mockInput);
      expect(Object.keys(result)).toEqual(["feedback"]);
      expect(result.feedback).toContain(
        "## Итоговое заключение и рекомендации",
      );
      expect(mocks.mockGeminiGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gemini-3.6-flash",
          config: expect.objectContaining({
            thinkingConfig: { thinkingLevel: "LOW" },
            responseMimeType: "application/json",
            responseJsonSchema: expect.any(Object),
          }),
        }),
      );
      const config = mocks.mockGeminiGenerate.mock.calls[0]![0].config;
      expect(config).not.toHaveProperty("temperature");
      expect(config.thinkingConfig).not.toHaveProperty("thinkingBudget");
      expect(mocks.mockGeminiGenerate).toHaveBeenCalledTimes(1);
      expect(mocks.mockGroqCreate).not.toHaveBeenCalled();
      expect(mocks.finish).toHaveBeenCalledTimes(1);
    });

    it.each([
      [json, "MAX_TOKENS"],
      [json, "SAFETY"],
      [json, "OTHER"],
      ["", "STOP"],
      ["not JSON", "STOP"],
      ['{"items":[]}', "STOP"],
      [JSON.stringify({ items: [evaluation, evaluation] }), "STOP"],
      [JSON.stringify({ items: [{ ...evaluation, id: 99 }] }), "STOP"],
      [JSON.stringify({ items: [{ ...evaluation, correct: false }] }), "STOP"],
    ])(
      "falls back for incomplete or invalid Gemini results (%s, %s)",
      async (content, reason) => {
        mocks.mockGeminiGenerate.mockResolvedValue(gemini(content, reason));
        const result = await caller().checkGrammar(mockInput);
        expect(result.feedback).toContain("CORRECT[Правильно]");
        expect(mocks.mockGroqCreate).toHaveBeenCalledTimes(1);
        expect(
          mocks.mockGeminiGenerate.mock.invocationCallOrder[0],
        ).toBeLessThan(mocks.mockGroqCreate.mock.invocationCallOrder[0]!);
      },
    );

    it("falls back when Gemini omits its finish reason", async () => {
      mocks.mockGeminiGenerate.mockResolvedValue({
        candidates: [{ content: { parts: [{ text: json }] } }],
      });
      await caller().checkGrammar(mockInput);
      expect(mocks.mockGroqCreate).toHaveBeenCalledTimes(1);
      expect(mocks.mockGeminiGenerate.mock.invocationCallOrder[0]).toBeLessThan(
        mocks.mockGroqCreate.mock.invocationCallOrder[0]!,
      );
    });

    it("returns partial feedback without completing diagnostics when both providers fail", async () => {
      mocks.mockGroqCreate.mockRejectedValue(new Error("Groq unavailable"));
      mocks.mockGeminiGenerate.mockRejectedValue(
        new Error("Gemini unavailable"),
      );
      const result = await caller().checkGrammar(mockInput);
      expect(Object.keys(result)).toEqual(["feedback"]);
      expect(result.feedback).toContain("Проверка выполнена частично");
      expect(mocks.partial).toHaveBeenCalledWith(
        db,
        "run-test",
        mockInput,
        result.feedback,
      );
      expect(mocks.finish).not.toHaveBeenCalled();
      expect(mocks.fail).not.toHaveBeenCalled();
      expect(mocks.mockGroqCreate).toHaveBeenCalledTimes(1);
      expect(mocks.mockGeminiGenerate).toHaveBeenCalledTimes(1);
    });

    it("saves partial feedback within 45 seconds when both SDK calls stall", async () => {
      vi.useFakeTimers();
      let providerStarted = 0;
      mocks.reserve.mockResolvedValue({
        id: "run-test",
        feedback: null,
        batches: { part2: { items: evaluations.slice(0, 5) } },
      });
      mocks.mockGeminiGenerate.mockImplementation(() => {
        providerStarted = Date.now();
        return new Promise(() => {});
      });
      mocks.mockGroqCreate.mockImplementation(() => new Promise(() => {}));

      const pending = caller().checkGrammar(mockInput);
      await vi.runAllTimersAsync();
      const result = await pending;

      expect(Date.now() - providerStarted).toBe(45_000);
      expect(result.feedback).toContain("Проверка выполнена частично");
      const translations = result.feedback.split("### Часть 2")[1]!;
      expect(translations.match(/CORRECT\[Правильно\]/g)).toHaveLength(5);
      expect(translations.match(/Не удалось проверить\./g)).toHaveLength(10);
      expect(result.feedback).toContain("INCORRECT[party] → CORRECT[parties]");
      expect(mocks.partial).toHaveBeenCalledWith(
        db,
        "run-test",
        mockInput,
        result.feedback,
      );
      expect(mocks.finish).not.toHaveBeenCalled();
      expect(mocks.mockGeminiGenerate).toHaveBeenCalledTimes(1);
      expect(mocks.mockGroqCreate).toHaveBeenCalledTimes(1);
      const geminiRequest = mocks.mockGeminiGenerate.mock.calls[0]![0] as {
        config: { httpOptions: { timeout: number }; abortSignal: AbortSignal };
      };
      const groqOptions = mocks.mockGroqCreate.mock.calls[0]![1] as {
        timeout: number;
        signal: AbortSignal;
      };
      expect(geminiRequest.config.httpOptions.timeout).toBe(30_000);
      expect(geminiRequest.config.abortSignal.aborted).toBe(true);
      expect(groqOptions.timeout).toBe(15_000);
      expect(groqOptions.signal.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    });

    it("retains valid items with unknown topics without calling fallback", async () => {
      mocks.mockGeminiGenerate.mockResolvedValue(
        gemini(
          JSON.stringify({
            items: evaluations.map((item) => ({
              ...item,
              topic: "Unrelated topic",
            })),
          }),
        ),
      );
      const result = await caller().checkGrammar(mockInput);
      expect(result.feedback).not.toContain("Unrelated topic");
      expect(mocks.finish).toHaveBeenCalledTimes(1);
      expect(mocks.mockGroqCreate).not.toHaveBeenCalled();
    });

    it("never displays truncated content even if it is parseable JSON", async () => {
      mocks.mockGeminiGenerate.mockResolvedValue(gemini(json, "MAX_TOKENS"));
      mocks.mockGroqCreate.mockResolvedValue(completion(json, "length"));
      const result = await caller().checkGrammar(mockInput);
      expect(result.feedback.match(/Не удалось проверить\./g)).toHaveLength(15);
      expect(mocks.finish).not.toHaveBeenCalled();
    });

    it("surfaces a storage failure instead of claiming partial answers were saved", async () => {
      mocks.mockGeminiGenerate.mockResolvedValue(gemini('{"items":[]}'));
      mocks.mockGroqCreate.mockResolvedValue(completion('{"items":[]}'));
      mocks.partial.mockRejectedValue(new Error("Database unavailable"));
      await expect(caller().checkGrammar(mockInput)).rejects.toThrow(
        "Database unavailable",
      );
      expect(mocks.fail).toHaveBeenCalledTimes(1);
    });

    it("joins Gemini text parts and excludes thinking", async () => {
      mocks.mockGeminiGenerate.mockResolvedValue({
        candidates: [
          {
            finishReason: "STOP",
            content: {
              parts: [
                { thought: true, text: "private reasoning" },
                { text: json.slice(0, 15) },
                { text: json.slice(15) },
              ],
            },
          },
        ],
      });
      await caller().checkGrammar(mockInput);
      expect(mocks.mockGroqCreate).not.toHaveBeenCalled();
    });

    it.each(["length", "content_filter", "tool_calls", undefined])(
      "rejects incomplete Groq fallback output (%s)",
      async (finish_reason) => {
        mocks.mockGeminiGenerate.mockRejectedValue(new Error("Unavailable"));
        mocks.mockGroqCreate.mockResolvedValue({
          choices: [{ finish_reason, message: { content: json } }],
        });
        const result = await caller().checkGrammar(mockInput);
        expect(result.feedback.match(/Не удалось проверить\./g)).toHaveLength(
          15,
        );
        expect(mocks.finish).not.toHaveBeenCalled();
      },
    );

    it("uses the existing Groq model after Gemini fails", async () => {
      mocks.mockGeminiGenerate.mockRejectedValue(new Error("Unavailable"));
      await caller().checkGrammar(mockInput);
      expect(mocks.mockGroqCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "openai/gpt-oss-120b",
          response_format: expect.objectContaining({ type: "json_schema" }),
        }),
        expect.objectContaining({ timeout: expect.any(Number) }),
      );
    });

    it("requires authentication before reserving quota or calling providers", async () => {
      const anonymous = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });
      await expect(anonymous.checkGrammar(mockInput)).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      expect(mocks.reserve).not.toHaveBeenCalled();
      expect(mocks.mockGroqCreate).not.toHaveBeenCalled();
      expect(mocks.mockGeminiGenerate).not.toHaveBeenCalled();
    });

    it("returns a saved report without another provider call or database result", async () => {
      mocks.reserve.mockResolvedValue({
        id: "saved",
        feedback: "Saved report",
        batches: {},
      });
      expect(await caller().checkGrammar(mockInput)).toEqual({
        feedback: "Saved report",
      });
      expect(mocks.mockGroqCreate).not.toHaveBeenCalled();
      expect(mocks.mockGeminiGenerate).not.toHaveBeenCalled();
      expect(mocks.finish).not.toHaveBeenCalled();
    });

    it("does not return success when saving the report fails", async () => {
      mocks.finish.mockRejectedValue(new Error("Database unavailable"));
      await expect(caller().checkGrammar(mockInput)).rejects.toThrow(
        "Database unavailable",
      );
      expect(mocks.fail).toHaveBeenCalledTimes(1);
    });

    it("rejects client-supplied verdicts before calling a provider", async () => {
      await expect(
        caller().checkGrammar({
          ...mockInput,
          part1: [
            {
              ...mockInput.part1[0]!,
              ...{ checkResults: [] },
            },
          ],
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(mocks.mockGroqCreate).not.toHaveBeenCalled();
      expect(mocks.mockGeminiGenerate).not.toHaveBeenCalled();
    });
  });
});
