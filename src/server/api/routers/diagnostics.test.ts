/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockCerebrasCreate: vi.fn(),
  mockGeminiGenerate: vi.fn(),
  mockGroqCreate: vi.fn(),
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

vi.mock("@cerebras/cerebras_cloud_sdk", () => ({
  Cerebras: class {
    chat = {
      completions: {
        create: mocks.mockCerebrasCreate,
      },
    };
  },
}));

vi.mock("@google/genai", () => ({
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

import { describe, it, expect, beforeEach } from "vitest";
import { diagnosticsRouter } from "./diagnostics";
import { createCallerFactory } from "@/server/api/trpc";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";

const createCaller = createCallerFactory(diagnosticsRouter);

describe("Diagnostics Router tRPC Procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInput = {
    part1: [
      {
        id: 1,
        text: "_____________ (not / touch) the dog!",
        userAnswers: ["Do not touch"],
        correctAnswers: [["do not touch", "don't touch"]],
        checkResults: [true],
      },
    ],
    part2: [
      {
        id: 1,
        text: "Translate this",
        userTranslation: "translated text",
        topics: ["Past Simple"],
      },
    ],
  };

  describe("hasCompletedDiagnostics", () => {
    it("should return false if no userResults record is found", async () => {
      vi.mocked(db.query.userResults.findFirst).mockResolvedValue(null as any);

      const caller = createCaller({
        db: db as any,
        session: { user: { id: "user-1", role: "student" }, expires: "" },
        headers: new Headers(),
      });

      const res = await caller.hasCompletedDiagnostics();
      expect(res).toBe(false);
    });
  });

  describe("checkGrammar", () => {
    it("should return feedback from Cerebras on success", async () => {
      mocks.mockCerebrasCreate.mockResolvedValue({
        choices: [{ message: { content: "Cerebras feedback text" } }],
      });

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.checkGrammar(mockInput);
      expect(res).toEqual({ feedback: "Cerebras feedback text" });
      expect(mocks.mockCerebrasCreate).toHaveBeenCalled();
    });

    it("should fallback to Gemini if Cerebras fails", async () => {
      mocks.mockCerebrasCreate.mockRejectedValue(new Error("Cerebras Down"));
      mocks.mockGeminiGenerate.mockResolvedValue({
        candidates: [
          { content: { parts: [{ text: "Gemini fallback feedback" }] } },
        ],
      });

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.checkGrammar(mockInput);
      expect(res).toEqual({ feedback: "Gemini fallback feedback" });
      expect(mocks.mockCerebrasCreate).toHaveBeenCalled();
      expect(mocks.mockGeminiGenerate).toHaveBeenCalled();
    });

    it("should fallback to Gemini if Cerebras returns empty choice content", async () => {
      mocks.mockCerebrasCreate.mockResolvedValue({
        choices: [{ message: { content: "" } }],
      });
      mocks.mockGeminiGenerate.mockResolvedValue({
        candidates: [{ content: { parts: [{ text: "Fallback feedback" }] } }],
      });

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.checkGrammar(mockInput);
      expect(res).toEqual({ feedback: "Fallback feedback" });
      expect(mocks.mockCerebrasCreate).toHaveBeenCalled();
      expect(mocks.mockGeminiGenerate).toHaveBeenCalled();
    });

    it("should fallback to Groq if both Cerebras and Gemini fail", async () => {
      mocks.mockCerebrasCreate.mockRejectedValue(new Error("Cerebras Down"));
      mocks.mockGeminiGenerate.mockRejectedValue(new Error("Gemini Down"));
      mocks.mockGroqCreate.mockResolvedValue({
        choices: [{ message: { content: "Groq fallback feedback" } }],
      });

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      const res = await caller.checkGrammar(mockInput);
      expect(res).toEqual({ feedback: "Groq fallback feedback" });
      expect(mocks.mockCerebrasCreate).toHaveBeenCalled();
      expect(mocks.mockGeminiGenerate).toHaveBeenCalled();
      expect(mocks.mockGroqCreate).toHaveBeenCalled();
    });

    it("should throw error if all three AI clients (Cerebras, Gemini, Groq) fail", async () => {
      mocks.mockCerebrasCreate.mockRejectedValue(new Error("Cerebras Down"));
      mocks.mockGeminiGenerate.mockRejectedValue(new Error("Gemini Down"));
      mocks.mockGroqCreate.mockRejectedValue(new Error("Groq Down"));

      const caller = createCaller({
        db: db as any,
        session: null,
        headers: new Headers(),
      });

      try {
        await caller.checkGrammar(mockInput);
        expect.fail("Should have thrown TRPCError");
      } catch (e: any) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e.code).toBe("INTERNAL_SERVER_ERROR");
        expect(e.message).toBe(
          "Произошла ошибка во время анализа диагностики. Попробуйте позднее.",
        );
      }
    });
  });
});
