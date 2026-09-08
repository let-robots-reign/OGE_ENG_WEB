import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import superjson from "superjson";
import { z } from "zod";
import { testStudentSubmission } from "../unit/fixtures/diagnostics";

// Use only a dedicated test-account session. The server now saves its results.
const testStudent = structuredClone(testStudentSubmission);
const skippedGrammar = testStudent.part1.find((task) => task.id === 16)!;
skippedGrammar.userAnswers = [];
testStudent.part2.find((task) => task.id === 15)!.userTranslation = "   ";
const allIncorrect = process.env.DIAGNOSTICS_LIVE_ALL_INCORRECT === "1";
if (allIncorrect) {
  const answers = [
    "This people is my friends. Look they!",
    "The cat didn't caught mouses last week.",
    "Have they ever buy tickets by themself? Yes. My brother said they had spend too much money on cinema tickets in Thursday.",
    "We will goes to park if it will sunny tomorrow.",
    "If I would have more free time, I will does sports.",
    "Those cookies was bake by my grandmother.",
    "My mother friend said she would came later.",
    "This is the most bad film I have ever saw.",
    "I would like add a few sugar. Sorry, we has very few left.",
    "We is going move to a new house next year.",
    "He miss the bus because he had oversleep.",
    "There is very little apples in fridge.",
    "He usually work from home, but today he meeting colleagues from other countrys at office.",
    "I wish I have a comfortabler room.",
    "It is more cold here than yesterday. Really? I will closed the window.",
  ];
  testStudent.part2.forEach((task, index) => {
    task.userTranslation = answers[index]!;
  });
}

const responseSchema = z.object({
  result: z.object({
    data: z.object({
      json: z.object({ feedback: z.string().min(1) }).strict(),
    }),
  }),
});

function taskSections(part: string) {
  return new Map(
    [
      ...part.matchAll(
        /^Задание (\d+)\.\n([\s\S]*?)(?=^Задание \d+\.|^## |$(?![\s\S]))/gm,
      ),
    ].map((match) => [Number(match[1]), match[2]!]),
  );
}

test("real providers return complete feedback for a test student", async ({
  request,
}, testInfo) => {
  expect(
    process.env.DIAGNOSTICS_TEST_STORAGE_STATE,
    "Set DIAGNOSTICS_TEST_STORAGE_STATE to a Playwright storage-state file for a dedicated test student (real authentication required).",
  ).toBeTruthy();
  const inputPath = testInfo.outputPath("test-student-answers.json");
  await writeFile(inputPath, JSON.stringify(testStudent, null, 2), "utf8");
  await testInfo.attach("test-student-answers", {
    path: inputPath,
    contentType: "application/json",
  });

  const started = Date.now();
  // This is the same HTTP procedure used by the UI. No route interception,
  // provider mocks, direct service calls, or replacement server are involved.
  const response = await request.post("/api/trpc/diagnostics.checkGrammar", {
    data: superjson.serialize(testStudent),
    timeout: 60_000,
    maxRetries: 0,
  });
  const requestPath = testInfo.outputPath("live-request.json");
  await writeFile(
    requestPath,
    JSON.stringify(
      {
        status: response.status(),
        elapsedMs: Date.now() - started,
        part1Tasks: testStudent.part1.length,
        part2Tasks: testStudent.part2.length,
      },
      null,
      2,
    ),
    "utf8",
  );
  await testInfo.attach("live-request", {
    path: requestPath,
    contentType: "application/json",
  });
  const body: unknown = await response.json();
  const failure = z
    .object({
      error: z.object({
        json: z.object({
          message: z.string(),
          code: z.number(),
        }),
      }),
    })
    .safeParse(body);
  expect(
    response.status(),
    failure.success
      ? `The live grading endpoint failed: ${failure.data.error.json.message}`
      : "The live grading endpoint must return HTTP 200",
  ).toBe(200);
  const { result } = responseSchema.parse(body);
  const { feedback } = result.data.json;

  // Save before assertions so even a grading regression leaves reviewable output.
  const feedbackPath = testInfo.outputPath("test-student-feedback.md");
  await writeFile(feedbackPath, feedback, "utf8");
  await testInfo.attach("test-student-feedback", {
    path: feedbackPath,
    contentType: "text/markdown",
  });

  for (const heading of [
    "## Общий вывод",
    "## Детальный разбор заданий",
    "### Часть 1",
    "### Часть 2",
    "## Сильные стороны",
    "## Слабые стороны",
    "## Итоговое заключение и рекомендации",
  ]) {
    expect(feedback.split(heading)).toHaveLength(2);
  }
  expect(feedback.trim()).toMatch(
    /Регулярная практика поможет тебе увереннее применять правила\.$/,
  );
  expect(feedback).not.toMatch(/<\/?(?:p|b|script|img)\b/i);

  // Dynamic punctuation is entity-encoded by the renderer; compare the text
  // students see (including topics containing slashes or parentheses).
  const displayText = feedback.replace(/&#(\d+);/g, (_, code: string) =>
    String.fromCodePoint(Number(code)),
  );
  const [firstPart, secondPart] = displayText.split("### Часть 2");
  const part1 = taskSections(firstPart!);
  const part2 = taskSections(secondPart!);
  // Check the raw ID lists too: a Map alone would conceal duplicates.
  for (const [section, tasks] of [
    [firstPart!, testStudent.part1],
    [secondPart!, testStudent.part2],
  ] as const) {
    expect(
      [...section.matchAll(/^Задание (\d+)\./gm)].map((match) =>
        Number(match[1]),
      ),
    ).toEqual(tasks.map((task) => task.id));
  }
  for (const task of testStudent.part1) {
    const section = part1.get(task.id)!;
    if (![5, 8, 10, 14, 16].includes(task.id)) {
      expect(section).toContain("CORRECT[Правильно]");
      expect(section).not.toContain("INCORRECT[");
    } else if (task.id === 16) {
      expect(section).toContain("Есть пропуски без ответа.");
      expect(section).not.toContain("INCORRECT[Ошибка]");
    } else {
      expect(section).toContain("INCORRECT[Ошибка]");
      // expect(section).toContain("Тема:");
    }
  }
  expect(part1.get(5)).toContain(
    "INCORRECT[the famous] → CORRECT[the most famous]",
  );
  expect(part1.get(8)).toContain(
    "INCORRECT[have been] → CORRECT[have finished]",
  );
  expect(part1.get(10)).toContain("INCORRECT[party] → CORRECT[parties]");
  expect(part1.get(14)).toContain("INCORRECT[see] → CORRECT[seeing]");
  expect(part1.get(16)).toContain("Ответ пропущен.");
  expect(part1.get(16)?.match(/INCORRECT\[пропуск\]/g)).toHaveLength(3);

  // Assert a few unambiguous judgments, not exact AI prose or an overall score.
  expect(part2.get(1)).toContain("INCORRECT[Ошибка]");
  expect(part2.get(1)).toContain("Правильный ответ:");
  expect(part2.get(1)).toContain("Пример:");
  if (!allIncorrect)
    expect(part2.get(1)).toContain("Тема: Demonstrative pronouns.");
  expect(part2.get(3)).toContain("INCORRECT[Ошибка]");
  for (const id of allIncorrect
    ? []
    : [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]) {
    // 6 intentionally uses an acceptable active -> passive paraphrase.
    expect(part2.get(id), `Translation ${id} should be accepted`).toContain(
      "CORRECT[Правильно]",
    );
    expect(part2.get(id)).toContain(
      "Твой перевод грамматически верен и передаёт смысл исходного предложения.",
    );
  }
  for (const task of testStudent.part2) {
    const section = part2.get(task.id)!;
    if (allIncorrect) {
      expect(section, `Translation ${task.id} must be rejected`).toContain(
        "INCORRECT[Ошибка]",
      );
      expect(section).not.toContain("CORRECT[Правильно]");
    }
    // expect(section).toContain("Тема:");
    if (section.includes("INCORRECT[Ошибка]") || !task.userTranslation.trim()) {
      expect(section).toMatch(/Правильный ответ:\n\S/);
      expect(section).toMatch(/Пример: \S/);
    }
  }
  if (!allIncorrect) {
    expect(part2.get(15)).toContain("Ответ пропущен.");
    expect(part2.get(15)).toContain("It is colder here than yesterday.");
  }
  expect(part2.get(15)).not.toContain("CORRECT[Правильно]");

  const savedResponse = await request.get(
    "/api/trpc/diagnostics.getDiagnosticsResult",
  );
  expect(savedResponse.status()).toBe(200);
  const saved = (await savedResponse.json()) as {
    result: { data: { json: { feedback: string } } };
  };
  expect(saved.result.data.json.feedback).toBe(feedback);

  // An immediate identical retry must return the saved report, even during the
  // user cooldown, without a new result or provider request.
  const cachedResponse = await request.post(
    "/api/trpc/diagnostics.checkGrammar",
    {
      data: superjson.serialize(testStudent),
    },
  );
  expect(cachedResponse.status()).toBe(200);
  expect(
    responseSchema.parse(await cachedResponse.json()).result.data.json.feedback,
  ).toBe(feedback);
});
