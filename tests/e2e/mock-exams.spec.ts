import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  audioTasks,
  mockExams,
  readingTasks,
  trainingTopics,
  uoeTaskChainItems,
  uoeTaskChains,
  uoeTasks,
  users,
} from "@/server/db/schema";

const PASSWORD = "E2e-password-123";

function silentWav() {
  const sampleRate = 8_000;
  const dataLength = 800;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

type Seed = {
  admin: { id: string; email: string };
  student: { id: string; email: string; name: string };
  title: string;
  order: number;
  audioTaskIds: number[];
  readingTaskIds: number[];
  chainIds: number[];
  uoeTaskIds: number[];
  createdTopicIds: number[];
};

async function ensureTopic(
  title: string,
  category: string,
  createdTopicIds: number[],
  candidateId: number,
) {
  const existing = await db.query.trainingTopics.findFirst({
    where: and(
      eq(trainingTopics.title, title),
      eq(trainingTopics.category, category),
      eq(trainingTopics.isActive, true),
    ),
  });
  if (existing) return existing.id;

  const [created] = await db
    .insert(trainingTopics)
    .values({ id: candidateId, title, category, isActive: true })
    .returning({ id: trainingTopics.id });
  if (!created) throw new Error(`Could not create E2E topic: ${title}`);
  createdTopicIds.push(created.id);
  return created.id;
}

async function seedResources(): Promise<Seed> {
  const suffix = crypto.randomUUID();
  const shortSuffix = suffix.slice(0, 8);
  const idBase = 1_500_000_000 + Math.floor(Math.random() * 100_000_000);
  const createdTopicIds: number[] = [];
  const passwordHash = await bcrypt.hash(PASSWORD, 4);
  const admin = {
    id: `e2e-admin-${suffix}`,
    email: `e2e-admin-${suffix}@example.com`,
  };
  const student = {
    id: `e2e-student-${suffix}`,
    email: `e2e-student-${suffix}@example.com`,
    name: `E2E Student ${shortSuffix}`,
  };
  const seed: Seed = {
    admin,
    student,
    title: `E2E Вариант ${shortSuffix}`,
    order: idBase,
    audioTaskIds: [idBase + 100, idBase + 101, idBase + 102],
    readingTaskIds: [idBase + 200, idBase + 201],
    chainIds: [idBase + 400, idBase + 401],
    uoeTaskIds: Array.from({ length: 18 }, (_, index) => idBase + 300 + index),
    createdTopicIds,
  };

  try {
    await db.insert(users).values([
      {
        ...admin,
        name: `E2E Admin ${shortSuffix}`,
        hashedPassword: passwordHash,
        role: "admin",
      },
      {
        ...student,
        hashedPassword: passwordHash,
        role: "student",
      },
    ]);

    const topicIds = {
      audio14: await ensureTopic(
        "Задания 1-4",
        "audio",
        createdTopicIds,
        idBase + 1,
      ),
      audio5: await ensureTopic(
        "Задание 5",
        "audio",
        createdTopicIds,
        idBase + 2,
      ),
      audio611: await ensureTopic(
        "Задания 6-11",
        "audio",
        createdTopicIds,
        idBase + 3,
      ),
      reading12: await ensureTopic(
        "Задание 12",
        "reading",
        createdTopicIds,
        idBase + 4,
      ),
      reading1319: await ensureTopic(
        "Задания 13-19",
        "reading",
        createdTopicIds,
        idBase + 5,
      ),
      allTopics: await ensureTopic(
        "По всем темам",
        "use-of-english",
        createdTopicIds,
        idBase + 6,
      ),
      wordFormation: await ensureTopic(
        "Словообразование",
        "use-of-english",
        createdTopicIds,
        idBase + 7,
      ),
      grammar: await ensureTopic(
        `E2E Grammar ${shortSuffix}`,
        "use-of-english",
        createdTopicIds,
        idBase + 8,
      ),
    };

    const audioUrl = `/e2e/mock-exam-${shortSuffix}.mp3`;
    await db.insert(audioTasks).values([
      {
        id: seed.audioTaskIds[0],
        topicId: topicIds.audio14,
        audioUrl,
        taskType: "multiple_choice",
        questions: Array.from({ length: 4 }, (_, index) => ({
          questionText: `E2E listening question ${index + 1}`,
          options: [
            `E2E correct option ${index + 1}`,
            `E2E wrong option ${index + 1}`,
          ],
        })),
        answers: [1, 1, 1, 1],
        explanations: Array.from({ length: 4 }, (_, index) => ({
          text: `E2E listening explanation ${index + 1}`,
        })),
      },
      {
        id: seed.audioTaskIds[1],
        topicId: topicIds.audio5,
        audioUrl,
        taskType: "matching",
        questions: Array.from(
          { length: 6 },
          (_, index) => `E2E rubric ${index + 1}`,
        ),
        answers: [1, 2, 3, 4, 5],
        explanations: Array.from({ length: 5 }, (_, index) => ({
          text: `E2E matching explanation ${index + 1}`,
        })),
      },
      {
        id: seed.audioTaskIds[2],
        topicId: topicIds.audio611,
        audioUrl,
        taskType: "gap_fill",
        questions: Array.from(
          { length: 6 },
          (_, index) => `E2E field ${index + 1} __________`,
        ),
        answers: Array.from({ length: 6 }, (_, index) => `ANSWER${index + 1}`),
        explanations: Array.from({ length: 6 }, (_, index) => ({
          text: `E2E gap explanation ${index + 1}`,
        })),
      },
    ]);

    await db.insert(readingTasks).values([
      {
        id: seed.readingTaskIds[0],
        topicId: topicIds.reading12,
        taskType: "matching",
        texts: Array.from(
          { length: 7 },
          (_, index) => `E2E reading text ${index + 1}`,
        ),
        headings: Array.from(
          { length: 8 },
          (_, index) => `E2E heading ${index + 1}`,
        ),
        answers: [1, 2, 3, 4, 5, 6, 7],
        explanations: Array.from({ length: 7 }, (_, index) => ({
          text: `E2E reading explanation ${index + 1}`,
        })),
      },
      {
        id: seed.readingTaskIds[1],
        topicId: topicIds.reading1319,
        taskType: "true_false",
        texts: ["E2E true/false source text"],
        headings: Array.from(
          { length: 7 },
          (_, index) => `E2E statement ${index + 1}`,
        ),
        answers: [1, 1, 1, 1, 1, 1, 1],
        explanations: Array.from({ length: 7 }, (_, index) => ({
          text: `E2E statement explanation ${index + 1}`,
        })),
      },
    ]);

    const grammarTasks = await db
      .insert(uoeTasks)
      .values(
        Array.from({ length: 9 }, (_, index) => ({
          id: seed.uoeTaskIds[index]!,
          topicId: topicIds.grammar,
          task: `E2E grammar sentence ${index + 1} __________`,
          origin: `WORD${index + 1}`,
          answer: `FORM${index + 1}`,
        })),
      )
      .returning({ id: uoeTasks.id });
    const wordFormationTasks = await db
      .insert(uoeTasks)
      .values(
        Array.from({ length: 9 }, (_, index) => ({
          id: seed.uoeTaskIds[index + 9]!,
          topicId: topicIds.wordFormation,
          task: `E2E word formation sentence ${index + 1} __________`,
          origin: `SOURCE${index + 1}`,
          answer: `DERIVED${index + 1}`,
        })),
      )
      .returning({ id: uoeTasks.id });

    const [allTopicsChain] = await db
      .insert(uoeTaskChains)
      .values({ id: seed.chainIds[0], topicId: topicIds.allTopics })
      .returning({ id: uoeTaskChains.id });
    const [wordFormationChain] = await db
      .insert(uoeTaskChains)
      .values({ id: seed.chainIds[1], topicId: topicIds.wordFormation })
      .returning({ id: uoeTaskChains.id });
    if (!allTopicsChain || !wordFormationChain) {
      throw new Error("Could not create E2E UoE chains");
    }

    await db.insert(uoeTaskChainItems).values([
      ...grammarTasks.map((task, index) => ({
        chainId: allTopicsChain.id,
        taskId: task.id,
        position: index + 1,
      })),
      ...wordFormationTasks.map((task, index) => ({
        chainId: wordFormationChain.id,
        taskId: task.id,
        position: index + 1,
      })),
    ]);

    return seed;
  } catch (cause) {
    await cleanup(seed);
    throw cause;
  }
}

async function cleanup(seed: Seed) {
  // Deleting users first removes attempts/results, allowing the variant itself
  // to be deleted despite the attempt FK using ON DELETE RESTRICT.
  await db
    .delete(users)
    .where(inArray(users.id, [seed.admin.id, seed.student.id]));
  await db.delete(mockExams).where(eq(mockExams.title, seed.title));
  await db
    .delete(uoeTaskChains)
    .where(inArray(uoeTaskChains.id, seed.chainIds));
  await db.delete(uoeTasks).where(inArray(uoeTasks.id, seed.uoeTaskIds));
  await db.delete(audioTasks).where(inArray(audioTasks.id, seed.audioTaskIds));
  await db
    .delete(readingTasks)
    .where(inArray(readingTasks.id, seed.readingTaskIds));
  if (seed.createdTopicIds.length > 0) {
    await db
      .delete(trainingTopics)
      .where(inArray(trainingTopics.id, seed.createdTopicIds));
  }
}

async function signIn(page: Page, email: string) {
  await page.goto("/auth/signin");
  await page.getByPlaceholder("masha@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(PASSWORD);
  await page.locator("main").getByRole("button", { name: "Войти →" }).click();
  await page.waitForURL("/");
}

async function playActiveAudioTwice(page: Page, audioIndex: number) {
  await page
    .getByRole("button", { name: "Начать первое прослушивание" })
    .click();
  await expect(page.getByText("Прослушивание 1 из 2")).toBeVisible();

  await page.locator("audio").nth(audioIndex).dispatchEvent("ended");
  await expect(page.getByText("Повтор через 5 сек.")).toBeVisible();
  await expect(page.getByText("Прослушивание 2 из 2")).toBeVisible({
    timeout: 7_000,
  });

  await page.locator("audio").nth(audioIndex).dispatchEvent("ended");
  // Finished players from earlier sections remain mounted, so target the
  // latest status, which belongs to the section currently being exercised.
  await expect(page.getByText("Прослушивания завершены").last()).toBeVisible();
}

test.describe("Mock exams — complete admin and student journey", () => {
  let seed: Seed | undefined;
  let skipProject = false;

  test.beforeAll(async ({}, testInfo) => {
    skipProject = testInfo.project.name !== "chromium";
    if (!skipProject) seed = await seedResources();
  });

  test.afterAll(async () => {
    if (seed) await cleanup(seed);
  });

  test("admin creates a variant, student completes it and a later attempt times out", async ({
    browser,
  }, testInfo) => {
    test.skip(
      skipProject,
      `Covered once in chromium, not ${testInfo.project.name}`,
    );
    test.slow();
    // The first dev-server run compiles several admin/student routes on demand.
    // Keep locator assertions strict, but give the complete cross-role journey
    // enough time on cold CI workers.
    test.setTimeout(300_000);
    if (!seed) throw new Error("E2E seed was not created");

    const adminContext = await browser.newContext();
    const studentContext = await browser.newContext();
    adminContext.setDefaultTimeout(10_000);
    studentContext.setDefaultTimeout(10_000);
    const adminPage = await adminContext.newPage();
    const studentPage = await studentContext.newPage();

    try {
      await studentPage.route("**/e2e/mock-exam-*.mp3", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "audio/wav",
          body: silentWav(),
        });
      });
      await studentPage.addInitScript(() => {
        Object.defineProperty(window, "__mockExamPlayCount", {
          configurable: true,
          writable: true,
          value: 0,
        });
        Object.defineProperty(HTMLMediaElement.prototype, "play", {
          configurable: true,
          value() {
            const testWindow = window as typeof window & {
              __mockExamPlayCount: number;
            };
            testWindow.__mockExamPlayCount += 1;
            return Promise.resolve();
          },
        });
      });

      // Admin creates the seven-part variant through the real constructor UI.
      await signIn(adminPage, seed.admin.email);
      await adminPage.goto("/admin/mock-exams/create");
      await adminPage.getByLabel("Название").fill(seed.title);
      await adminPage.getByLabel("Порядок").fill(String(seed.order));
      const selectors = adminPage.locator("select");
      await expect(selectors).toHaveCount(7);
      const resourceIds = [
        ...seed.audioTaskIds,
        ...seed.readingTaskIds,
        ...seed.chainIds,
      ];
      for (const [index, resourceId] of resourceIds.entries()) {
        await selectors.nth(index).selectOption(String(resourceId));
      }
      await adminPage.getByRole("button", { name: "Сохранить" }).click();
      await adminPage.waitForURL("/admin/mock-exams");
      await expect(
        adminPage.getByText(seed.title, { exact: true }),
      ).toBeVisible();

      const exam = await db.query.mockExams.findFirst({
        where: eq(mockExams.title, seed.title),
      });
      if (!exam) throw new Error("The constructor did not create the variant");

      // Student sees the new variant immediately and starts a fresh attempt.
      await signIn(studentPage, seed.student.email);
      const homeCard = studentPage
        .locator("section#variants a")
        .filter({ hasText: seed.title });
      await expect(homeCard).toContainText("Не начат");
      await homeCard.click();
      await expect(
        studentPage.getByRole("heading", { name: seed.title }),
      ).toBeVisible();
      await studentPage
        .getByRole("button", { name: "Начать экзамен →" })
        .click();
      await expect(studentPage.getByText("120:00")).toBeVisible();

      // Each listening part owns an independent player: first play is explicit,
      // the second starts automatically after the real five-second gap.
      await playActiveAudioTwice(studentPage, 0);
      await studentPage
        .getByRole("button", { name: "E2E correct option 1" })
        .click();

      await studentPage
        .getByRole("button", { name: /^2\. Задание 5$/ })
        .click();
      await playActiveAudioTwice(studentPage, 1);
      await studentPage
        .getByRole("combobox", { name: "Рубрика для говорящего A" })
        .selectOption("1");

      await studentPage
        .getByRole("button", { name: /^3\. Задания 6–11$/ })
        .click();
      await playActiveAudioTwice(studentPage, 2);
      await studentPage
        .getByRole("textbox", { name: "Ответ на задание 6" })
        .fill("ANSWER1");

      expect(
        await studentPage.evaluate(
          () =>
            (window as typeof window & { __mockExamPlayCount: number })
              .__mockExamPlayCount,
        ),
      ).toBe(6);
      await expect(studentPage.locator("audio[controls]")).toHaveCount(0);

      // Visit and answer one item in every remaining exam part.
      await studentPage
        .getByRole("button", { name: /^4\. Задание 12$/ })
        .click();
      await studentPage.getByRole("button", { name: /E2E heading 1/ }).click();
      const firstReadingText = studentPage
        .locator("div.rounded-lg.border")
        .filter({ hasText: "E2E reading text 1" })
        .last();
      // Assigning the heading synchronously rerenders the clickable card. A
      // dispatched user event avoids Playwright waiting on the detached node.
      await firstReadingText.dispatchEvent("click");
      await expect(firstReadingText).toContainText("заголовок: №1");

      await studentPage
        .getByRole("button", { name: /^5\. Задания 13–19$/ })
        .click();
      const firstStatement = studentPage
        .locator("div.rounded-lg.border")
        .filter({ hasText: "E2E statement 1" })
        .last();
      await firstStatement.getByRole("button", { name: "True" }).click();

      await studentPage
        .getByRole("button", { name: /^6\. Задания 20-28$/ })
        .click();
      await studentPage.getByPlaceholder("WORD1").fill("FORM1");

      await studentPage
        .getByRole("button", { name: /^7\. Задания 29-34$/ })
        .click();
      await studentPage.getByPlaceholder("SOURCE1").fill("DERIVED1");

      // Manual completion persists one stable result with seven correct items.
      await studentPage.getByRole("button", { name: "Завершить" }).click();
      await expect(
        studentPage.getByRole("heading", { name: "Завершить вариант?" }),
      ).toBeVisible();
      await studentPage
        .locator(".modal")
        .getByRole("button", { name: "Завершить" })
        .click();
      await expect(
        studentPage.getByRole("heading", { name: "Разбор ответов" }),
      ).toBeVisible();
      await expect(
        studentPage.getByText("7/47", { exact: true }),
      ).toBeVisible();
      await expect(studentPage.getByText("Оценка 2")).toBeVisible();

      // Homepage shows the latest completed attempt for this variant.
      await studentPage.goto("/");
      const completedCard = studentPage
        .locator("section#variants a")
        .filter({ hasText: seed.title });
      await expect(completedCard).toContainText("Сдан");
      await expect(completedCard).toContainText(/7\s*\/\s*47/);

      // The student's profile links to the stable saved review.
      await studentPage.goto(`/profile/${seed.student.id}`);
      const historyRow = studentPage
        .locator("tbody tr")
        .filter({ hasText: seed.title });
      await expect(historyRow).toContainText("Вариант");
      await expect(historyRow).toContainText(/7\s*\/\s*47/);
      await historyRow.getByRole("link", { name: /E2E Вариант/ }).click();
      await expect(
        studentPage.getByRole("heading", { name: "Разбор ответов" }),
      ).toBeVisible();

      // The same attempt is available to admins in the dedicated results tab.
      await adminPage.goto("/admin?tab=mock-exams");
      const adminResultRow = adminPage
        .locator("tbody tr")
        .filter({ hasText: seed.title });
      await expect(adminResultRow).toContainText(seed.student.email);
      await expect(adminResultRow).toContainText(/7\s*\/\s*47/);
      await adminResultRow.getByRole("link", { name: "Просмотреть →" }).click();
      await expect(
        adminPage.getByRole("heading", { name: "Разбор ответов" }),
      ).toBeVisible();
      await expect(
        adminPage.getByText(seed.title, { exact: true }),
      ).toBeVisible();

      // A second attempt proves the two-hour boundary ends the exam without a
      // manual click. Playwright advances the browser clock; the application
      // still follows its real countdown and completion code paths.
      await studentPage.goto(`/mock-exams/${exam.id}`);
      await studentPage.clock.install();
      await studentPage
        .getByRole("button", { name: "Начать экзамен →" })
        .click();
      await expect(studentPage.getByText("120:00")).toBeVisible();
      await studentPage.clock.fastForward(7_201_000);
      await expect(
        studentPage.getByRole("heading", { name: "Разбор ответов" }),
      ).toBeVisible();
      await expect(
        studentPage.getByText("0/47", { exact: true }),
      ).toBeVisible();
      await expect(studentPage.getByText(/время истекло/)).toBeVisible();

      await studentPage.goto("/");
      await expect(completedCard).toContainText(/0\s*\/\s*47/);

      await studentPage.goto(`/profile/${seed.student.id}`);
      const studentAttempts = studentPage
        .locator("tbody tr")
        .filter({ hasText: seed.title });
      await expect(studentAttempts).toHaveCount(2);
      await expect(studentAttempts.first()).toContainText(/0\s*\/\s*47/);
      await studentAttempts
        .first()
        .getByRole("link", { name: /E2E Вариант/ })
        .click();
      await expect(studentPage.getByText(/время истекло/)).toBeVisible();

      await adminPage.goto("/admin?tab=mock-exams");
      const adminAttempts = adminPage
        .locator("tbody tr")
        .filter({ hasText: seed.title });
      await expect(adminAttempts).toHaveCount(2);
      await expect(adminAttempts.first()).toContainText(/0\s*\/\s*47/);
      await adminAttempts
        .first()
        .getByRole("link", { name: "Просмотреть →" })
        .click();
      await expect(adminPage.getByText(/время истекло/)).toBeVisible();
    } finally {
      await Promise.all([adminContext.close(), studentContext.close()]);
    }
  });
});
