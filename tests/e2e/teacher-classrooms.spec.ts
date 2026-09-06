import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { classrooms, users } from "@/server/db/schema";

const PASSWORD = "E2e-password-123";

type Seed = {
  teacher: { id: string; email: string };
  student: { id: string; email: string; name: string };
  className: string;
};

async function seed(): Promise<Seed> {
  const suffix = crypto.randomUUID();
  const short = suffix.slice(0, 8);
  const passwordHash = await bcrypt.hash(PASSWORD, 4);
  const s: Seed = {
    teacher: {
      id: `e2e-teacher-${suffix}`,
      email: `e2e-teacher-${suffix}@example.com`,
    },
    student: {
      id: `e2e-cls-student-${suffix}`,
      email: `e2e-cls-student-${suffix}@example.com`,
      name: `E2E Учащийся ${short}`,
    },
    className: `E2E Класс ${short}`,
  };
  await db.insert(users).values([
    {
      id: s.teacher.id,
      email: s.teacher.email,
      name: `E2E Учитель ${short}`,
      hashedPassword: passwordHash,
      role: "teacher",
    },
    {
      id: s.student.id,
      email: s.student.email,
      name: s.student.name,
      hashedPassword: passwordHash,
      role: "student",
    },
  ]);
  return s;
}

async function cleanup(s: Seed) {
  // Classrooms cascade-delete their memberships.
  await db.delete(classrooms).where(eq(classrooms.teacherId, s.teacher.id));
  await db.delete(users).where(eq(users.id, s.teacher.id));
  await db.delete(users).where(eq(users.id, s.student.id));
}

async function signIn(page: Page, email: string) {
  await page.goto("/auth/signin");
  await page.getByPlaceholder("masha@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(PASSWORD);
  await page.locator("main").getByRole("button", { name: "Войти →" }).click();
  await page.waitForURL("/");
}

test.describe("Teacher classes — create, invite, join, see the student", () => {
  let s: Seed;

  test.beforeAll(async () => {
    s = await seed();
  });

  test.afterAll(async () => {
    if (s) await cleanup(s);
  });

  test("full flow: teacher creates a class, student joins by link, teacher sees them", async ({
    browser,
  }) => {
    const teacherCtx = await browser.newContext();
    const studentCtx = await browser.newContext();
    const teacherPage = await teacherCtx.newPage();
    const studentPage = await studentCtx.newPage();

    try {
      // --- Teacher: the "Классы" nav is visible and the cabinet loads ---
      await signIn(teacherPage, s.teacher.email);
      await expect(
        teacherPage.getByRole("link", { name: "Классы" }),
      ).toBeVisible();

      await teacherPage.goto("/teacher");
      await expect(
        teacherPage.getByRole("heading", { name: "Мои классы" }),
      ).toBeVisible();

      // --- Teacher: create a class via the modal ---
      await teacherPage
        .getByRole("button", { name: "Создать класс" })
        .first()
        .click();
      await teacherPage
        .getByPlaceholder("9 «А» · Школа 42")
        .fill(s.className);
      const dialog = teacherPage.getByRole("dialog");
      await dialog.getByRole("button", { name: "Создать класс" }).click();

      // Success panel shows the invite link.
      await expect(dialog.getByText("Класс создан")).toBeVisible();

      // Read the persisted class (id + invite token) authoritatively.
      const room = await db.query.classrooms.findFirst({
        where: eq(classrooms.teacherId, s.teacher.id),
      });
      expect(room?.name).toBe(s.className);
      const token = room!.inviteToken;

      // --- Student: open the invite, accept the privacy note, join ---
      await signIn(studentPage, s.student.email);
      await studentPage.goto(`/classes/join/${token}`);
      await expect(
        studentPage.getByRole("heading", { name: s.className }),
      ).toBeVisible();
      await studentPage
        .getByRole("button", { name: "Вступить в класс" })
        .click();

      // Lands on the profile with the "Мой класс" block.
      await studentPage.waitForURL(/\/profile\//);
      await expect(studentPage.getByText("Мой класс")).toBeVisible();
      await expect(
        studentPage.getByText(s.className, { exact: false }).first(),
      ).toBeVisible();

      // --- Teacher: the student now appears in the roster ---
      await teacherPage.goto(`/teacher/classrooms/${room!.id}`);
      await expect(teacherPage.getByText(s.student.email)).toBeVisible();
      await expect(
        teacherPage.getByRole("link", { name: /Прогресс/ }).first(),
      ).toBeVisible();
    } finally {
      await teacherCtx.close();
      await studentCtx.close();
    }
  });
});
