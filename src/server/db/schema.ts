import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => name);

export const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);
export const activityTypeEnum = pgEnum("activity_type", [
  "training",
  "mock_exam",
  "diagnostics",
]);

// --- AUTH TABLES ---

export const users = createTable(
  "user",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }),
    email: d.varchar({ length: 255 }).notNull(),
    hashedPassword: d.text(),
    emailVerified: d
      .timestamp({
        mode: "date",
        withTimezone: true,
      })
      .$defaultFn(() => new Date()),
    image: d.varchar({ length: 255 }),
    role: roleEnum("role"),
    telegramUsername: d.varchar({ length: 255 }),
    school: d.varchar({ length: 255 }),
    examPointsGoal: d.integer(),
    notificationsWeekly: d.boolean().default(true).notNull(),
    notificationsMarketing: d.boolean().default(false).notNull(),
  }),
  (t) => ({
    emailIdx: uniqueIndex("email_idx").on(t.email),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  userResults: many(userResults),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// --- APP TABLES ---

export const trainingTopics = createTable("training_topic", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  title: d.varchar({ length: 255 }).notNull(),
  category: d.varchar({ length: 100 }).notNull(),
  isActive: d.boolean().default(true).notNull(),
}));

export const trainingTopicsRelations = relations(
  trainingTopics,
  ({ many }) => ({
    audioTasks: many(audioTasks),
    readingTasks: many(readingTasks),
    uoeTasks: many(uoeTasks),
    writingTasks: many(writingTasks),
  }),
);

export interface AudioTaskQuestion {
  questionText: string;
  options: string[];
}

export interface AudioTaskExplanation {
  text: string;
  highlightedText?: string;
}

export type AudioTaskType = "multiple_choice" | "matching" | "gap_fill";

// The `questions` column holds a different shape per task type, which a single
// jsonb column cannot express. Consumers pair the two fields into this union
// once and then narrow on `taskType` instead of casting at every use site.
export type AudioTaskContent =
  | { taskType: "multiple_choice"; questions: AudioTaskQuestion[] }
  | { taskType: "matching"; questions: string[] }
  | { taskType: "gap_fill"; questions: string[] };

export const audioTasks = createTable("audio_task", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  audioUrl: d.varchar({ length: 255 }).notNull(),
  topicId: d
    .integer()
    .references(() => trainingTopics.id, { onDelete: "set null" }),
  taskType: d
    .varchar({ length: 255 })
    .$type<AudioTaskType>()
    .default("multiple_choice")
    .notNull(),
  isDeleted: d.boolean().default(false).notNull(),
  questions: d
    .jsonb("questions")
    .$type<AudioTaskQuestion[] | string[]>()
    .notNull(),
  answers: d.jsonb("answers").$type<(number | string | string[])[]>().notNull(),
  explanations: d
    .jsonb("explanations")
    .$type<AudioTaskExplanation[]>()
    .notNull(),
}));

export const audioTasksRelations = relations(audioTasks, ({ one }) => ({
  topic: one(trainingTopics, {
    fields: [audioTasks.topicId],
    references: [trainingTopics.id],
  }),
}));

export interface ReadingTaskExplanation {
  text: string;
  highlightedText?: string;
}

export type ReadingTaskType = "matching" | "true_false";

export type ReadingTaskContent =
  | { taskType: "matching"; texts: string[]; headings: string[] }
  | { taskType: "true_false"; texts: [string]; headings: string[] };

export const readingTasks = createTable("reading_task", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  topicId: d
    .integer()
    .references(() => trainingTopics.id, { onDelete: "set null" }),
  taskType: d
    .varchar({ length: 255 })
    .$type<ReadingTaskType>()
    .default("matching")
    .notNull(),
  isDeleted: d.boolean().default(false).notNull(),
  texts: d.jsonb("texts").$type<string[]>().notNull(),
  headings: d.jsonb("headings").$type<string[]>().notNull(),
  answers: d.jsonb("answers").$type<number[]>().notNull(),
  explanations: d
    .jsonb("explanations")
    .$type<ReadingTaskExplanation[]>()
    .notNull(),
}));

export const readingTasksRelations = relations(readingTasks, ({ one }) => ({
  topic: one(trainingTopics, {
    fields: [readingTasks.topicId],
    references: [trainingTopics.id],
  }),
}));

export const uoeTasks = createTable("uoe_task", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  task: d.text().notNull(),
  origin: d.text().notNull(),
  answer: d.text().notNull(),
  topicId: d
    .integer()
    .references(() => trainingTopics.id, { onDelete: "set null" }),
  isDeleted: d.boolean().default(false).notNull(),
}));

export const uoeTasksRelations = relations(uoeTasks, ({ one }) => ({
  topic: one(trainingTopics, {
    fields: [uoeTasks.topicId],
    references: [trainingTopics.id],
  }),
}));

export const writingTasks = createTable("writing_task", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  topic: d.varchar({ length: 255 }).notNull(),
  task: d.text().notNull(),
  answer: d.text().notNull(),
  isDeleted: d.boolean().default(false).notNull(),
  topicId: d.integer().references(() => trainingTopics.id, {
    onDelete: "set null",
  }),
}));

export const writingTasksRelations = relations(writingTasks, ({ one }) => ({
  topic: one(trainingTopics, {
    fields: [writingTasks.topicId],
    references: [trainingTopics.id],
  }),
}));

export const theoryArticles = createTable("theory_article", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  category: d.varchar({ length: 255 }).notNull(),
  title: d.varchar({ length: 255 }).notNull(),
  content: d.text().notNull(),
}));

export const userResults = createTable("user_result", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activityType: activityTypeEnum("activity_type").notNull(),
  activityId: d.integer().notNull(),
  result: d.varchar({ length: 255 }).notNull(),
  taskId: d.integer(),
  timeSpent: d.integer(),
  details: d.jsonb("details"),
  createdAt: d
    .timestamp({ withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
}));

export const userResultsRelations = relations(userResults, ({ one }) => ({
  user: one(users, {
    fields: [userResults.userId],
    references: [users.id],
  }),
}));
