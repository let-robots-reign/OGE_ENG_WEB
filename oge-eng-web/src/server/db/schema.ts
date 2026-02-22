import { relations } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => name);

// --- AUTH TABLES ---

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .$defaultFn(() => new Date()),
  image: d.varchar({ length: 255 }),
  role: d.varchar({ length: 50 }).default("user"),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  userActivities: many(userActivities),
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
    audioTasks: many(audioTasksFirst),
    readingTasks: many(readingTasksFirst),
    uoeTasks: many(uoeTasks),
  }),
);

export const audioTasksFirst = createTable("audio_task_first", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  task: d.text().notNull(),
  answer: d.text().notNull(),
  explanation: d.text().notNull(),
  audioUrl: d.varchar({ length: 255 }).notNull(),
  topicId: d
    .integer()
    .references(() => trainingTopics.id, { onDelete: "set null" }),
  isDeleted: d.boolean().default(false).notNull(),
}));

export const audioTasksFirstRelations = relations(
  audioTasksFirst,
  ({ one }) => ({
    topic: one(trainingTopics, {
      fields: [audioTasksFirst.topicId],
      references: [trainingTopics.id],
    }),
  }),
);

export const readingTasksFirst = createTable("reading_task_first", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  text: d.text().notNull(),
  task: d.text().notNull(),
  answer: d.text().notNull(),
  explanation: d.text().notNull(),
  topicId: d
    .integer()
    .references(() => trainingTopics.id, { onDelete: "set null" }),
  isDeleted: d.boolean().default(false).notNull(),
}));

export const readingTasksFirstRelations = relations(
  readingTasksFirst,
  ({ one }) => ({
    topic: one(trainingTopics, {
      fields: [readingTasksFirst.topicId],
      references: [trainingTopics.id],
    }),
  }),
);

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
}));

export const theoryArticles = createTable("theory_article", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  category: d.varchar({ length: 255 }).notNull(),
  title: d.varchar({ length: 255 }).notNull(),
  content: d.text().notNull(),
}));

export const userActivities = createTable("user_activity", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),
  task: d.text().notNull(),
  result: d.text().notNull(),
  experience: d.integer().notNull(),
  date: d.timestamp({ withTimezone: true }).$defaultFn(() => new Date()),
}));

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));
