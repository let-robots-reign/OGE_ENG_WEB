import { render, cleanup } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { DiagnosticFeedback } from "@/app/_components/diagnostics/grammar/diagnostic-feedback";
import type * as DiagnosticsProvider from "@/server/api/lib/diagnostics-provider";
import {
  checkGrammar,
  extractPart1Mistakes,
  renderDiagnosticsFeedback,
  type BatchCheckpoint,
} from "@/server/api/lib/diagnostics";
import {
  diagnosticsSubmissionSchema,
  prepareDiagnostics,
  normalizeGrammarAnswer,
} from "@/server/api/lib/diagnostics-input";
import {
  parseTranslations,
  translationSchemaFor,
  type TranslationEvaluation,
} from "@/server/api/lib/diagnostics-schema";
import { grammarRules } from "@/server/api/lib/diagnostics-rules";
import {
  createStructuredGenerator,
  type StructuredRequest,
} from "@/server/api/lib/diagnostics-provider";
import { testStudentSubmission } from "../fixtures/diagnostics";

const mocks = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock("@/server/api/lib/diagnostics-provider", async (importOriginal) => ({
  ...(await importOriginal<typeof DiagnosticsProvider>()),
  generateStructured: mocks.generate,
}));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  mocks.generate.mockReset();
});

const submission = () => structuredClone(testStudentSubmission);
function evaluate(
  task: ReturnType<typeof prepareDiagnostics>["part2"][number],
): TranslationEvaluation {
  const correct = !!task.userTranslation.trim();
  return {
    id: task.id,
    correct,
    correctedTranslation: correct ? null : "A reference translation.",
    topic: task.topics[0] ?? null,
    explanation: "Обрати внимание на правило.",
    example: correct ? null : "This is an example.",
  };
}
function respond(request: StructuredRequest, parse: (text: string) => unknown) {
  const { tasks } = request.input as {
    tasks: ReturnType<typeof prepareDiagnostics>["part2"];
  };
  return parse(JSON.stringify({ items: tasks.map(evaluate).reverse() }));
}

describe("server-owned diagnostics", () => {
  it.each([
    "Do not touch",
    " do not touch ",
    "DO NOT TOUCH",
    "don’t touch",
    "do   not touch",
  ])("accepts normalized answer %s without changing its display", (answer) => {
    const input = submission();
    input.part1[0]!.userAnswers[0] = answer;
    const prepared = prepareDiagnostics(input);
    expect(prepared.part1[0]!.checkResults[0]).toBe(true);
    expect(prepared.part1[0]!.userAnswers[0]).toBe(answer);
  });
  it("rejects forged verdicts, keys, topics, extra IDs, wrong versions and oversized text", () => {
    const input = submission();
    for (const bad of [
      { ...input, version: "old" },
      {
        ...input,
        part1: [
          { ...input.part1[0], checkResults: [true, true] },
          ...input.part1.slice(1),
        ],
      },
      {
        ...input,
        part1: [
          { ...input.part1[0], correctAnswers: [["anything"]] },
          ...input.part1.slice(1),
        ],
      },
      {
        ...input,
        part2: [
          { ...input.part2[0], topics: ["Fake"] },
          ...input.part2.slice(1),
        ],
      },
      { ...input, part1: input.part1.slice(1) },
      { ...input, part1: input.part1.map((task) => ({ ...task, id: 1 })) },
      {
        ...input,
        part2: input.part2.map((task) => ({
          ...task,
          userTranslation: "a".repeat(1501),
        })),
      },
    ])
      expect(diagnosticsSubmissionSchema.safeParse(bad).success).toBe(false);
  });
  it("uses canonical question text, exact blank positions, and one fixed rule per blank", () => {
    const input = prepareDiagnostics(submission());
    expect(input.part1[4]!.text).toContain("use the superlative");
    expect(input.part1[9]!.text).toContain("use the plural");
    expect(input.part1[9]!.text).toContain("I promised I");
    for (const task of input.part1) {
      expect(grammarRules[task.id]).toHaveLength(task.correctAnswers.length);
      expect(task.text.match(/_{2,}/g)).toHaveLength(
        task.correctAnswers.length,
      );
    }
    expect(normalizeGrammarAnswer("  DON’T   TOUCH ")).toBe("don't touch");
  });
  it("sends no Part 1 answers to providers and renders all 31 tasks", async () => {
    mocks.generate.mockImplementation(respond);
    const prepared = prepareDiagnostics(submission());
    const result = await checkGrammar(prepared);
    expect(mocks.generate).toHaveBeenCalledTimes(1);
    for (const [request] of mocks.generate.mock.calls as [
      StructuredRequest,
    ][]) {
      expect(request.name).toBe("part2_translations");
      expect((request.input as { tasks: unknown[] }).tasks).toHaveLength(15);
      expect(request.input).not.toHaveProperty("mistakes");
    }
    expect(result.feedback.match(/Задание \d+\./g)).toHaveLength(31);
    expect(result.feedback).toContain("INCORRECT[party] → CORRECT[parties]");
    expect(result.feedback).toContain("В скобках указано множественное число");
    expect(result.feedback).not.toContain("нескольким вечеринкам");
    expect(result.feedback).not.toContain("продолжённый аспект");
  });
  it("does not turn skipped topics into weaknesses", async () => {
    const input = submission();
    input.part1.forEach((task) => {
      task.userAnswers = [];
    });
    input.part2.forEach((task) => {
      task.userTranslation = " ";
    });
    mocks.generate.mockImplementation(respond);
    const { feedback } = await checkGrammar(prepareDiagnostics(input));
    expect(feedback).not.toContain("INCORRECT[Ошибка]");
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(feedback).toContain("It is colder here than yesterday");
    expect(
      feedback
        .split("## Слабые стороны")[1]!
        .split("## Смешанные результаты")[0],
    ).toContain("Таких тем в этой работе нет");
    expect(feedback.split("## Темы без оценки")[1]).toContain(
      "Present Perfect",
    );
    expect(feedback).toContain("Пропуск не доказывает");
  });
  it("sends only answered translations and retains fixed skipped translations", async () => {
    const input = submission();
    input.part2[14]!.userTranslation = " ";
    mocks.generate.mockImplementation(respond);
    await checkGrammar(prepareDiagnostics(input));
    const batches = mocks.generate.mock.calls.map(
      ([request]) =>
        (request as StructuredRequest).input as { tasks: { id: number }[] },
    );
    expect(batches.map((batch) => batch.tasks.length)).toEqual([14]);
    expect(
      batches.flatMap((batch) => batch.tasks.map((task) => task.id)),
    ).not.toContain(15);
  });
  it("never renders generated grammar claims for accepted translations", () => {
    const input = prepareDiagnostics(submission());
    const explanations = extractPart1Mistakes(input.part1).map((item) => ({
      ...item,
      ...grammarRules[item.id]![item.blankIndex]!,
    }));
    const translations = input.part2.map((task) => ({
      ...evaluate(task),
      explanation: "Нереальное условие в прошлом — выдуманное объяснение.",
    }));
    const feedback = renderDiagnosticsFeedback(
      input,
      explanations,
      translations,
    );
    expect(feedback).not.toContain("выдуманное объяснение");
    expect(feedback).toContain("Твой перевод грамматически верен");
  });
  it("groups mixed evidence under one canonical topic, not strength and weakness", () => {
    const input = prepareDiagnostics(submission());
    const explanations = extractPart1Mistakes(input.part1).map((item) => ({
      ...item,
      ...grammarRules[item.id]![item.blankIndex]!,
    }));
    const translations = input.part2.map(evaluate);
    const feedback = renderDiagnosticsFeedback(
      input,
      explanations,
      translations,
    );
    expect(
      feedback
        .split("## Смешанные результаты")[1]!
        .split("## Темы без оценки")[0],
    ).toContain("Plural nouns");
    expect(
      feedback.split("## Сильные стороны")[1]!.split("## Слабые стороны")[0],
    ).not.toContain("Plural nouns");
    expect(
      feedback
        .split("## Слабые стороны")[1]!
        .split("## Смешанные результаты")[0],
    ).not.toContain("Plural nouns");
  });
  it("reuses a complete Part 2 checkpoint without another provider request", async () => {
    const checkpoints: Record<string, TranslationEvaluation[]> = {};
    const checkpoint = async (evaluation: BatchCheckpoint) => {
      checkpoints[evaluation.key] = evaluation.items;
    };
    const prepared = prepareDiagnostics(submission());
    mocks.generate.mockImplementation(respond);
    const initial = await checkGrammar(prepared, { checkpoint });
    expect(Object.keys(checkpoints)).toEqual(["part2"]);
    expect(checkpoints.part2).toHaveLength(15);
    mocks.generate.mockClear();
    expect(
      await checkGrammar(prepared, { cachedBatches: checkpoints, checkpoint }),
    ).toEqual(initial);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("does not checkpoint a failed Part 2 evaluation", async () => {
    const checkpoint = vi.fn();
    mocks.generate.mockRejectedValue(new Error("Provider unavailable"));
    const result = await checkGrammar(prepareDiagnostics(submission()), {
      checkpoint,
    });
    expect(result.complete).toBe(false);
    expect(result.feedback).toContain("Проверка выполнена частично");
    expect(result.feedback.match(/Не удалось проверить\./g)).toHaveLength(15);
    expect(result.feedback.split("### Часть 2")[1]).not.toContain(
      "INCORRECT[Ошибка]",
    );
    expect(result.feedback).toContain("INCORRECT[party] → CORRECT[parties]");
    expect(checkpoint).not.toHaveBeenCalled();
  });
  it("retries only missing translations in one request and preserves valid earlier verdicts", async () => {
    const input = prepareDiagnostics(submission());
    const cachedItems = input.part2.slice(0, 5).map(evaluate);
    mocks.generate.mockImplementation(respond);
    const checkpoint = vi.fn();
    const result = await checkGrammar(input, {
      cachedBatches: { part2: { items: cachedItems } },
      checkpoint,
    });
    expect(result.complete).toBe(true);
    expect(mocks.generate).toHaveBeenCalledTimes(1);
    expect(
      (mocks.generate.mock.calls[0]![0] as StructuredRequest).input,
    ).toMatchObject({ tasks: input.part2.slice(5) });
    expect(checkpoint.mock.calls[0]![0].items).toHaveLength(15);
  });
  it("keeps cached feedback when a retry fails", async () => {
    const input = prepareDiagnostics(submission());
    mocks.generate.mockRejectedValue(new Error("Unavailable"));
    const result = await checkGrammar(input, {
      cachedBatches: { part2: input.part2.slice(0, 5).map(evaluate) },
    });
    expect(result.complete).toBe(false);
    expect(result.feedback.match(/Не удалось проверить\./g)).toHaveLength(10);
    expect(
      result.feedback.split("### Часть 2")[1]!.match(/CORRECT\[Правильно\]/g),
    ).toHaveLength(5);
  });
  it("keeps unrelated items while omitting malformed, inconsistent, duplicate, and unknown IDs", () => {
    const tasks = prepareDiagnostics(submission()).part2;
    const valid = evaluate(tasks[0]!);
    const items = [
      valid,
      { ...evaluate(tasks[1]!), explanation: 99 },
      { ...evaluate(tasks[2]!), correct: false },
      evaluate(tasks[3]!),
      evaluate(tasks[3]!),
      { ...valid, id: 99 },
      { correct: true },
    ];
    expect(parseTranslations(JSON.stringify({ items }), tasks)).toEqual([
      valid,
    ]);
    expect(
      parseTranslations(JSON.stringify({ items: [valid] }), [
        { ...tasks[0]!, userTranslation: "" },
      ]),
    ).toEqual([]);
    expect(() => parseTranslations('{"items":[', tasks)).toThrow();
    expect(() => parseTranslations('{"unexpected":[]}', tasks)).toThrow();
  });
  it("drops invalid or missing topic labels without dropping sound evaluations", () => {
    const task = prepareDiagnostics(submission()).part2[0]!;
    const item = evaluate(task);
    for (const topic of ["Invented", null, 42, undefined]) {
      expect(
        parseTranslations(JSON.stringify({ items: [{ ...item, topic }] }), [
          task,
        ]),
      ).toEqual([{ ...item, topic: null }]);
    }
  });
  it("checkpoints a partial response and renders missing answers neutrally", async () => {
    const input = prepareDiagnostics(submission());
    input.part2[14]!.userTranslation = "";
    mocks.generate.mockImplementation(
      (request: StructuredRequest, parse: (content: string) => unknown) => {
        const tasks = (request.input as { tasks: typeof input.part2 }).tasks;
        return parse(
          JSON.stringify({ items: tasks.slice(0, 2).map(evaluate) }),
        );
      },
    );
    const checkpoint = vi.fn();
    const result = await checkGrammar(input, { checkpoint });
    expect(result.complete).toBe(false);
    expect(result.feedback).toContain(
      "без ответа — 1; не удалось проверить — 12",
    );
    expect(result.feedback).toContain("Ответ пропущен");
    expect(checkpoint.mock.calls[0]![0].items).toHaveLength(2);
  });
  it("requires supplied topics and batch IDs in the provider schema, including correct answers", () => {
    const tasks = prepareDiagnostics(submission()).part2.slice(5, 10);
    const properties =
      translationSchemaFor(tasks).properties.items.items.properties;
    expect(properties.topic).toEqual({
      type: "string",
      enum: [...new Set(tasks.flatMap((task) => task.topics))],
    });
    expect(properties.id).toEqual({ type: "integer", enum: [6, 7, 8, 9, 10] });
    expect(
      parseTranslations(
        JSON.stringify({ items: [{ ...evaluate(tasks[0]!), topic: null }] }),
        [tasks[0]!],
      )[0]?.topic,
    ).toBeNull();
  });
});

describe("safe rendering, including legacy or directly stored feedback", () => {
  it.each([
    '<iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe>',
    "<script>alert(1)</script><style>body{display:none}</style>",
    '<img src=x onerror="alert(1)"><svg onload="alert(1)"></svg>',
    '<a href="javascript:alert(1)">click</a><form action="/api">form</form>',
  ])("removes active HTML: %s", (feedback) => {
    const { container } = render(
      createElement(DiagnosticFeedback, { feedback }),
    );
    expect(
      container.querySelector("iframe,script,style,img,svg,a,form"),
    ).toBeNull();
  });
  it("keeps trusted formatting and markers but strips all other attributes", () => {
    const { container } = render(
      createElement(DiagnosticFeedback, {
        feedback:
          '## Заголовок\n\nCORRECT[yes] INCORRECT[no]\n\n<span class="fb-correct evil" style="color:red" onclick="alert(1)" id="bad">text</span>',
      }),
    );
    expect(container.querySelector("h2")?.textContent).toBe("Заголовок");
    expect(container.querySelector(".fb-correct")?.textContent).toBe("yes");
    expect(container.querySelector(".fb-incorrect")?.textContent).toBe("no");
    expect(container.querySelector("[style],[onclick],#bad,.evil")).toBeNull();
  });
});
const request: StructuredRequest = {
  name: "test",
  prompt: "",
  input: {},
  schema: {},
};
describe("provider scheduling", () => {
  it("aborts a slow primary and leaves time for fallback without leaking timers", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    let primarySignal: AbortSignal | undefined;
    const fallback = vi.fn().mockResolvedValue('{"ok":true}');
    const onAttempt = vi.fn().mockResolvedValue(undefined);
    const generate = createStructuredGenerator([
      {
        name: "primary",
        generate: ({ signal }) => {
          primarySignal = signal;
          return new Promise<string>(() => {});
        },
      },
      { name: "fallback", generate: fallback },
    ]);
    const result = generate({ ...request, onAttempt }, JSON.parse);

    await vi.advanceTimersByTimeAsync(29_999);
    expect(primarySignal?.aborted).toBe(false);
    expect(fallback).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    expect(await result).toEqual({ ok: true });
    expect(primarySignal?.aborted).toBe(true);
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        provider: "primary",
        outcome: "failed",
        failure: "deadline_exceeded",
      }),
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not start a provider after the shared deadline has expired", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(45_001);
    const provider = vi.fn();
    const generate = createStructuredGenerator([
      { name: "primary", generate: provider },
    ]);
    await expect(
      generate({ ...request, deadline: 45_000 }, JSON.parse),
    ).rejects.toThrow();
    expect(provider).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("records both failures without exposing provider bodies or credentials", async () => {
    const onAttempt = vi.fn().mockResolvedValue(undefined);
    const generate = createStructuredGenerator([
      {
        name: "Gemini",
        model: "gemini-3.6-flash",
        generate: async () => {
          throw Object.assign(
            new Error("SECRET_KEY and private student response"),
            { status: 429 },
          );
        },
      },
      {
        name: "Groq",
        model: "openai/gpt-oss-120b",
        generate: async () => "bad private json",
      },
    ]);
    await expect(
      generate({ ...request, onAttempt }, JSON.parse),
    ).rejects.toThrow();
    expect(onAttempt).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        provider: "Gemini",
        status: 429,
        failure: "rate_limited",
        outcome: "failed",
      }),
    );
    expect(onAttempt).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        provider: "Groq",
        failure: "invalid_json",
        outcome: "failed",
      }),
    );
    expect(JSON.stringify(onAttempt.mock.calls)).not.toMatch(
      /SECRET_KEY|private/,
    );
    onAttempt.mockClear();
    await expect(
      generate({ ...request, onAttempt }, JSON.parse),
    ).rejects.toThrow();
    expect(onAttempt).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        provider: "Gemini",
        outcome: "cooldown",
        retryAfterMs: expect.any(Number),
      }),
    );
  });

  it("does not retry a successful provider if recording its attempt fails", async () => {
    const fallback = vi.fn();
    const generate = createStructuredGenerator([
      { name: "primary", generate: async () => '{"ok":true}' },
      { name: "fallback", generate: fallback },
    ]);
    expect(
      await generate(
        {
          ...request,
          onAttempt: async () => {
            throw new Error("Database unavailable");
          },
        },
        JSON.parse,
      ),
    ).toEqual({ ok: true });
    expect(fallback).not.toHaveBeenCalled();
  });

  it("limits active calls to two and releases waiting work after failures", async () => {
    let active = 0,
      peak = 0;
    const generate = createStructuredGenerator([
      {
        name: "test",
        generate: async () => {
          active++;
          peak = Math.max(peak, active);
          await new Promise((resolve) => setTimeout(resolve, 5));
          active--;
          throw new Error("Unavailable");
        },
      },
    ]);
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => generate(request, JSON.parse)),
    );
    expect(peak).toBe(2);
    expect(results.every((result) => result.status === "rejected")).toBe(true);
  });

  it.each(["120", new Date(120000).toUTCString()])(
    "honors Retry-After %s without repeatedly hitting a limited provider",
    async (retryAfter) => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
      const primary = vi.fn().mockRejectedValue({
        status: 429,
        headers: new Headers({ "retry-after": retryAfter }),
      });
      const fallback = vi.fn().mockResolvedValue('{"ok":true}');
      const generate = createStructuredGenerator([
        { name: "primary", generate: primary },
        { name: "fallback", generate: fallback },
      ]);
      await generate(request, JSON.parse);
      await generate(request, JSON.parse);
      expect(primary).toHaveBeenCalledTimes(1);
      expect(fallback).toHaveBeenCalledTimes(2);
      vi.setSystemTime(120001);
      await generate(request, JSON.parse);
      expect(primary).toHaveBeenCalledTimes(2);
    },
  );

  it("falls back on validation errors and throws when no provider succeeds", async () => {
    const fallback = vi.fn().mockResolvedValue('{"ok":true}');
    const generate = createStructuredGenerator([
      { name: "primary", generate: async () => "bad json" },
      { name: "fallback", generate: fallback },
    ]);
    expect(await generate(request, JSON.parse)).toEqual({ ok: true });
    fallback.mockResolvedValue("also bad");
    await expect(generate(request, JSON.parse)).rejects.toThrow(
      "Попробуйте позднее",
    );
  });
});
