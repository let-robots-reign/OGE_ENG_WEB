import { relations, sql } from "drizzle-orm";
import {
  check,
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
  "training_exam_mode",
  "mock_exam",
  "diagnostics",
]);
export const mockExamSlotEnum = pgEnum("mock_exam_slot", [
  "audio_1_4",
  "audio_5",
  "audio_6_11",
  "reading_12",
  "reading_13_19",
  "uoe_all_topics",
  "uoe_word_formation",
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

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  userResults: many(userResults),
  mockExamAttempts: many(mockExamAttempts),
  // Classes this user teaches (only meaningful for `teacher`/`admin`).
  ownedClassrooms: many(classrooms),
  // The single class this user has joined as a student, if any.
  classroomMembership: one(classroomMembers, {
    fields: [users.id],
    references: [classroomMembers.userId],
  }),
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
    uoeTaskChains: many(uoeTaskChains),
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

export const audioTasksRelations = relations(audioTasks, ({ one, many }) => ({
  topic: one(trainingTopics, {
    fields: [audioTasks.topicId],
    references: [trainingTopics.id],
  }),
  mockExamParts: many(mockExamParts),
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

export const readingTasksRelations = relations(
  readingTasks,
  ({ one, many }) => ({
    topic: one(trainingTopics, {
      fields: [readingTasks.topicId],
      references: [trainingTopics.id],
    }),
    mockExamParts: many(mockExamParts),
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

export const uoeTasksRelations = relations(uoeTasks, ({ one, many }) => ({
  topic: one(trainingTopics, {
    fields: [uoeTasks.topicId],
    references: [trainingTopics.id],
  }),
  chainItems: many(uoeTaskChainItems),
}));

export const uoeTaskChains = createTable("uoe_task_chain", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  topicId: d
    .integer()
    .notNull()
    .references(() => trainingTopics.id, { onDelete: "restrict" }),
  isDeleted: d.boolean().default(false).notNull(),
}));

export const uoeTaskChainItems = createTable(
  "uoe_task_chain_item",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    chainId: d
      .integer()
      .notNull()
      .references(() => uoeTaskChains.id, { onDelete: "cascade" }),
    taskId: d
      .integer()
      .notNull()
      .references(() => uoeTasks.id, { onDelete: "restrict" }),
    position: d.integer().notNull(),
  }),
  (t) => [
    uniqueIndex("uoe_chain_item_position_idx").on(t.chainId, t.position),
    uniqueIndex("uoe_chain_item_task_idx").on(t.chainId, t.taskId),
    index("uoe_chain_item_chain_id_idx").on(t.chainId),
    index("uoe_chain_item_task_id_idx").on(t.taskId),
    check("uoe_chain_item_position_check", sql`${t.position} between 1 and 9`),
  ],
);

export const uoeTaskChainsRelations = relations(
  uoeTaskChains,
  ({ one, many }) => ({
    topic: one(trainingTopics, {
      fields: [uoeTaskChains.topicId],
      references: [trainingTopics.id],
    }),
    items: many(uoeTaskChainItems),
    mockExamParts: many(mockExamParts),
  }),
);

export const uoeTaskChainItemsRelations = relations(
  uoeTaskChainItems,
  ({ one }) => ({
    chain: one(uoeTaskChains, {
      fields: [uoeTaskChainItems.chainId],
      references: [uoeTaskChains.id],
    }),
    task: one(uoeTasks, {
      fields: [uoeTaskChainItems.taskId],
      references: [uoeTasks.id],
    }),
  }),
);

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

export type MockExamSlot = (typeof mockExamSlotEnum.enumValues)[number];
export type MockExamAnswer = number | string | null;

export interface MockExamSnapshotPart {
  slot: MockExamSlot;
  label: string;
  kind: "audio" | "reading" | "uoe";
  topicTitle: string;
  resourceId: number;
  taskType?: AudioTaskType | ReadingTaskType;
  total: number;
  audioUrl?: string;
  questions?: AudioTaskQuestion[] | string[];
  texts?: string[];
  headings?: string[];
  correctAnswers?: (number | string | string[])[];
  explanations?: Array<{ text: string; highlightedText?: string }>;
  tasks?: Array<{
    id: number;
    task: string;
    origin: string;
    answer: string;
  }>;
}

export interface MockExamSnapshot {
  version: 1;
  mockExam: { id: number; title: string; order: number };
  parts: MockExamSnapshotPart[];
}

export interface MockExamResultItem {
  label: string;
  title: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  highlightedText?: string;
  origin?: string;
}

export interface MockExamResultDetails {
  version: 1;
  attemptKey: string;
  mockExam: { id: number; title: string };
  correctCount: number;
  total: number;
  percentage: number;
  grade: 2 | 3 | 4 | 5;
  timeSpent: number;
  timedOut: boolean;
  parts: Array<{
    slot: MockExamSlot;
    label: string;
    kind: "audio" | "reading" | "uoe";
    resourceId: number;
    correctCount: number;
    total: number;
    items: MockExamResultItem[];
  }>;
}

export const mockExams = createTable(
  "mock_exam",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 255 }).notNull(),
    order: d.integer().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  }),
  (t) => [
    uniqueIndex("mock_exam_title_idx").on(t.title),
    uniqueIndex("mock_exam_order_idx").on(t.order),
  ],
);

export const mockExamParts = createTable(
  "mock_exam_part",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    mockExamId: d
      .integer()
      .notNull()
      .references(() => mockExams.id, { onDelete: "cascade" }),
    slot: mockExamSlotEnum("slot").notNull(),
    audioTaskId: d
      .integer()
      .references(() => audioTasks.id, { onDelete: "restrict" }),
    readingTaskId: d
      .integer()
      .references(() => readingTasks.id, { onDelete: "restrict" }),
    uoeTaskChainId: d
      .integer()
      .references(() => uoeTaskChains.id, { onDelete: "restrict" }),
  }),
  (t) => [
    uniqueIndex("mock_exam_part_slot_idx").on(t.mockExamId, t.slot),
    index("mock_exam_part_audio_task_idx").on(t.audioTaskId),
    index("mock_exam_part_reading_task_idx").on(t.readingTaskId),
    index("mock_exam_part_uoe_chain_idx").on(t.uoeTaskChainId),
    check(
      "mock_exam_part_resource_check",
      sql`num_nonnulls(${t.audioTaskId}, ${t.readingTaskId}, ${t.uoeTaskChainId}) = 1`,
    ),
    check(
      "mock_exam_part_slot_resource_check",
      sql`(
        (${t.slot} in ('audio_1_4', 'audio_5', 'audio_6_11') and ${t.audioTaskId} is not null)
        or (${t.slot} in ('reading_12', 'reading_13_19') and ${t.readingTaskId} is not null)
        or (${t.slot} in ('uoe_all_topics', 'uoe_word_formation') and ${t.uoeTaskChainId} is not null)
      )`,
    ),
  ],
);

export const mockExamAttempts = createTable(
  "mock_exam_attempt",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mockExamId: d
      .integer()
      .notNull()
      .references(() => mockExams.id, { onDelete: "restrict" }),
    snapshot: d.jsonb("snapshot").$type<MockExamSnapshot>().notNull(),
    startedAt: d
      .timestamp({ withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    completedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("mock_exam_attempt_user_idx").on(t.userId),
    index("mock_exam_attempt_expiry_idx").on(t.expiresAt),
  ],
);

export const mockExamsRelations = relations(mockExams, ({ many }) => ({
  parts: many(mockExamParts),
  attempts: many(mockExamAttempts),
}));

export const mockExamPartsRelations = relations(mockExamParts, ({ one }) => ({
  mockExam: one(mockExams, {
    fields: [mockExamParts.mockExamId],
    references: [mockExams.id],
  }),
  audioTask: one(audioTasks, {
    fields: [mockExamParts.audioTaskId],
    references: [audioTasks.id],
  }),
  readingTask: one(readingTasks, {
    fields: [mockExamParts.readingTaskId],
    references: [readingTasks.id],
  }),
  uoeTaskChain: one(uoeTaskChains, {
    fields: [mockExamParts.uoeTaskChainId],
    references: [uoeTaskChains.id],
  }),
}));

export const mockExamAttemptsRelations = relations(
  mockExamAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [mockExamAttempts.userId],
      references: [users.id],
    }),
    mockExam: one(mockExams, {
      fields: [mockExamAttempts.mockExamId],
      references: [mockExams.id],
    }),
  }),
);

export const userResults = createTable(
  "user_result",
  (d) => ({
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
    attemptKey: d.varchar({ length: 255 }),
    details: d.jsonb("details").$type<unknown>(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  }),
  (t) => [
    uniqueIndex("user_result_attempt_key_idx").on(t.attemptKey),
    index("user_result_latest_activity_idx").on(
      t.userId,
      t.activityType,
      t.activityId,
      t.createdAt,
    ),
  ],
);

export const userResultsRelations = relations(userResults, ({ one }) => ({
  user: one(users, {
    fields: [userResults.userId],
    references: [users.id],
  }),
}));

// --- TEACHER CLASSES ---

export const classrooms = createTable(
  "classroom",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    teacherId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 255 }).notNull(),
    // Opaque token embedded in the invite link; regenerating it invalidates
    // any previously shared link. Unique so a token resolves to one class.
    inviteToken: d.varchar({ length: 64 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  }),
  (t) => [
    uniqueIndex("classroom_invite_token_idx").on(t.inviteToken),
    index("classroom_teacher_id_idx").on(t.teacherId),
  ],
);

export const classroomMembers = createTable(
  "classroom_member",
  (d) => ({
    classroomId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: d
      .timestamp({ withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  }),
  (t) => [
    primaryKey({ columns: [t.classroomId, t.userId] }),
    // A student belongs to exactly one class — enforced at the DB level.
    uniqueIndex("classroom_member_user_idx").on(t.userId),
    index("classroom_member_classroom_idx").on(t.classroomId),
  ],
);

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classrooms.teacherId],
    references: [users.id],
  }),
  members: many(classroomMembers),
}));

export const classroomMembersRelations = relations(
  classroomMembers,
  ({ one }) => ({
    classroom: one(classrooms, {
      fields: [classroomMembers.classroomId],
      references: [classrooms.id],
    }),
    user: one(users, {
      fields: [classroomMembers.userId],
      references: [users.id],
    }),
  }),
);
