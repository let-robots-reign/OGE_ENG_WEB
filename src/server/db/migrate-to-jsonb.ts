/* eslint-disable */
// @ts-nocheck
import { db } from "./index";
import { audioTasksFirst, readingTasksFirst } from "./schema";
import { eq } from "drizzle-orm";

async function runMigration() {
  console.log("Starting data migration to JSONB...");

  // 1. Migrate audioTasksFirst
  const audioTasks = await db.select().from(audioTasksFirst);
  console.log(`Found ${audioTasks.length} audio tasks to migrate.`);

  for (const task of audioTasks) {
    try {
      const questions = task.task.split("\n").map((q) => {
        const [questionText, ...options] = q.split("/option/");
        return {
          questionText: questionText?.trim() ?? "",
          options: options.map(o => o.trim()).filter(Boolean),
        };
      }).filter(q => q.questionText || q.options.length > 0);

      const answers = task.answer.split(" ").map(Number);

      const explanations = task.explanation.split("---").map((exp) => {
        const match = /\|(.*?)\|/.exec(exp);
        return {
          text: exp.replace(/\|/g, "").trim(),
          highlightedText: match ? match[1]?.trim() : undefined,
        };
      });

      await db
        .update(audioTasksFirst)
        .set({
          questionsJson: questions,
          answersJson: answers,
          explanationsJson: explanations,
        })
        .where(eq(audioTasksFirst.id, task.id));
      
      console.log(`Migrated audio task ID: ${task.id}`);
    } catch (error) {
      console.error(`Failed to migrate audio task ID: ${task.id}`, error);
    }
  }

  // 2. Migrate readingTasksFirst
  const readingTasks = await db.select().from(readingTasksFirst);
  console.log(`Found ${readingTasks.length} reading tasks to migrate.`);

  for (const task of readingTasks) {
    try {
      const texts = task.text
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);

      const headings = task.task
        .split("\n")
        .map((h) => h.trim())
        .filter((h) => h !== "Выберите вопрос" && h !== "")
        .map((h) => h.replace(/^\s*\d+\.\s*/, "").trim()); // Убираем префикс "1. "

      const answers = task.answer.split(" ").map(Number);

      const explanations = task.explanation.split("\n---").map((exp) => {
        const match = /\|(.*?)\|/.exec(exp);
        return {
          text: exp.replace(/\|/g, "").trim(),
          highlightedText: match ? match[1]?.trim() : undefined,
        };
      });

      await db
        .update(readingTasksFirst)
        .set({
          textsJson: texts,
          headingsJson: headings,
          answersJson: answers,
          explanationsJson: explanations,
        })
        .where(eq(readingTasksFirst.id, task.id));

      console.log(`Migrated reading task ID: ${task.id}`);
    } catch (error) {
      console.error(`Failed to migrate reading task ID: ${task.id}`, error);
    }
  }

  console.log("Data migration to JSONB completed successfully!");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
