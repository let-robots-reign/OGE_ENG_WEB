import { and, eq, inArray, sql } from "drizzle-orm";
import type { createTRPCContext } from "@/server/api/trpc";
import {
  audioTasks,
  readingTasks,
  trainingTopics,
  uoeTasks,
  userResults,
  writingTasks,
} from "@/server/db/schema";
import { isMockExamResultDetails } from "@/server/api/lib/mock-exams";

/**
 * Pure, `userId`-scoped aggregations extracted from `userRouter` so both the
 * student's own profile (`userRouter`) and the teacher's read-only view of a
 * student (`teacherRouter`) share one implementation. Nothing here reads the
 * session — callers pass the target `userId` after their own auth checks.
 */

type AppDb = Awaited<ReturnType<typeof createTRPCContext>>["db"];

/** Topic titles that represent the "Письмо" (Writing) section. */
export const WRITING_TITLES = [
  "Письмо",
  "Письмо Упражнения",
  "Навыки написания письма",
];

export const SUBJECT_ORDER = [
  "audio",
  "reading",
  "use-of-english",
  "writing",
] as const;

export type SubjectKey = (typeof SUBJECT_ORDER)[number];

export const SECTION_LABEL: Record<string, string> = {
  audio: "Аудирование",
  reading: "Чтение",
  "use-of-english": "Языковой материал",
};

function subOneDayYmd(ymd: string): string {
  return addDaysYmd(ymd, -1);
}

function addDaysYmd(ymd: string, delta: number): string {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Monday-indexed weekday: Mon=0 ... Sun=6. */
function weekdayMon0(ymd: string): number {
  const js = new Date(ymd + "T00:00:00Z").getUTCDay(); // 0=Sun ... 6=Sat
  return (js + 6) % 7;
}

/**
 * Some environments/PostgreSQL installations do not recognize legacy or deprecated IANA
 * timezone aliases (like "Asia/Saigon" or "Europe/Kiev"), even though Node.js / V8
 * supports them. This mapping translates them to modern canonical equivalents before
 * executing database queries.
 */
const TIMEZONE_MAPPING: Record<string, string> = {
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Europe/Kiev": "Europe/Kyiv",
};

export function safeTimeZone(tz: string): string {
  const mappedTz = TIMEZONE_MAPPING[tz] ?? tz;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: mappedTz }).format(new Date());
    return mappedTz;
  } catch {
    return "Europe/Moscow";
  }
}

export function todayYmd(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}

/** Parse a `"correct/total"` result string. Returns null for empty/malformed. */
export function parseResult(
  raw: string,
): { correct: number; total: number } | null {
  const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(raw);
  if (!m) return null;
  const correct = Number(m[1]);
  const total = Number(m[2]);
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total === 0) {
    return null;
  }
  return { correct, total };
}

/**
 * Mean training score with one vote per student: first average each student's
 * attempt percentages, then average those student percentages. Invalid result
 * strings are ignored.
 */
export function averageAttemptPercentByStudent(
  rows: ReadonlyArray<{ userId: string; result: string }>,
): { byStudent: Map<string, number>; averagePercent: number | null } {
  const totals = new Map<string, { sum: number; count: number }>();

  for (const row of rows) {
    const parsed = parseResult(row.result);
    if (!parsed) continue;

    const current = totals.get(row.userId) ?? { sum: 0, count: 0 };
    current.sum += (parsed.correct / parsed.total) * 100;
    current.count += 1;
    totals.set(row.userId, current);
  }

  const byStudent = new Map(
    [...totals].map(([userId, value]) => [userId, value.sum / value.count]),
  );
  const percentages = [...byStudent.values()];

  return {
    byStudent,
    averagePercent:
      percentages.length > 0
        ? Math.round(
            percentages.reduce((sum, percentage) => sum + percentage, 0) /
              percentages.length,
          )
        : null,
  };
}

/** Current consecutive-day streak anchored at today (or yesterday). */
export function computeCurrentStreak(
  daysDesc: string[],
  today: string,
): { count: number; isActiveToday: boolean } {
  if (!daysDesc.length) return { count: 0, isActiveToday: false };

  const yesterday = subOneDayYmd(today);
  let isActiveToday: boolean;
  let anchor: string;

  if (daysDesc[0] === today) {
    isActiveToday = true;
    anchor = today;
  } else if (daysDesc[0] === yesterday) {
    isActiveToday = false;
    anchor = yesterday;
  } else {
    return { count: 0, isActiveToday: false };
  }

  let count = 1;
  let prev = anchor;
  for (let i = 1; i < daysDesc.length; i++) {
    const expected = subOneDayYmd(prev);
    if (daysDesc[i] === expected) {
      count++;
      prev = daysDesc[i]!;
    } else {
      break;
    }
  }
  return { count, isActiveToday };
}

/** Longest consecutive-day run across all active days. */
export function computeBestStreak(daysAsc: string[]): number {
  if (!daysAsc.length) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < daysAsc.length; i++) {
    if (daysAsc[i] === addDaysYmd(daysAsc[i - 1]!, 1)) {
      run++;
    } else {
      run = 1;
    }
    if (run > best) best = run;
  }
  return best;
}

/** Distinct active local days (YYYY-MM-DD), tolerant of bad timezones. */
async function activeDays(
  db: AppDb,
  userId: string,
  tz: string,
): Promise<{ days: string[]; tz: string }> {
  const run = (zone: string) =>
    db
      .selectDistinct({
        day: sql<string>`to_char((${userResults.createdAt} AT TIME ZONE ${zone}), 'YYYY-MM-DD')`,
      })
      .from(userResults)
      .where(eq(userResults.userId, userId));

  try {
    const rows = await run(tz);
    return { days: rows.map((r) => r.day), tz };
  } catch (err) {
    console.error(`Postgres error for timezone "${tz}" in getStreak:`, err);
    const fallback = "Europe/Moscow";
    const rows = await run(fallback);
    return { days: rows.map((r) => r.day), tz: fallback };
  }
}

/** Current consecutive-day streak for a user. */
export async function getStreak(
  db: AppDb,
  userId: string,
  timeZone: string,
): Promise<{ count: number; isActiveToday: boolean }> {
  const { days, tz } = await activeDays(db, userId, safeTimeZone(timeZone));
  const daysDesc = [...days].sort().reverse();
  return computeCurrentStreak(daysDesc, todayYmd(tz));
}

export interface ActivityData {
  currentStreak: number;
  bestStreak: number;
  isActiveToday: boolean;
  totalActiveDays: number;
  totalSeconds: number;
  weeks: number;
  todayIndex: number;
  days: { ymd: string; count: number; seconds: number; isFuture: boolean }[];
}

/** Streak + best streak + per-day activity heatmap for the last `weeks` weeks. */
export async function getActivity(
  db: AppDb,
  userId: string,
  timeZone: string,
  weeks: number,
): Promise<ActivityData> {
  let tz = safeTimeZone(timeZone);

  const run = (zone: string) =>
    db
      .select({
        day: sql<string>`to_char((${userResults.createdAt} AT TIME ZONE ${zone}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
        seconds: sql<number>`coalesce(sum(${userResults.timeSpent}), 0)::int`,
      })
      .from(userResults)
      .where(eq(userResults.userId, userId))
      .groupBy(sql`1`);

  let rows;
  try {
    rows = await run(tz);
  } catch (err) {
    console.error(`Postgres error for timezone "${tz}" in getActivity:`, err);
    tz = "Europe/Moscow";
    rows = await run(tz);
  }

  const byDay = new Map(
    rows.map((r) => [r.day, { count: r.count, seconds: r.seconds }]),
  );
  const allDays = rows.map((r) => r.day).sort();

  const today = todayYmd(tz);
  const { count: currentStreak, isActiveToday } = computeCurrentStreak(
    [...allDays].reverse(),
    today,
  );
  const bestStreak = Math.max(computeBestStreak(allDays), currentStreak);

  // Build a Monday-aligned grid: `weeks` columns × 7 rows, laid out
  // column-major, ending on the week that contains today.
  const todayIndex = (weeks - 1) * 7 + weekdayMon0(today);
  const startMonday = addDaysYmd(today, -todayIndex);

  let totalActiveDays = 0;
  let totalSeconds = 0;
  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const ymd = addDaysYmd(startMonday, i);
    const hit = byDay.get(ymd);
    const count = hit?.count ?? 0;
    const seconds = hit?.seconds ?? 0;
    const isFuture = ymd > today;
    if (!isFuture && count > 0) {
      totalActiveDays++;
      totalSeconds += seconds;
    }
    return { ymd, count, seconds, isFuture };
  });

  return {
    currentStreak,
    bestStreak,
    isActiveToday,
    totalActiveDays,
    totalSeconds,
    weeks,
    todayIndex,
    days,
  };
}

export interface SubjectProgressRow {
  key: SubjectKey;
  done: number;
  total: number;
  pct: number;
  avgCorrect: number;
  avgMax: number;
}

/**
 * Count of active (non-deleted) tasks per section — the "available tasks"
 * denominator for a user's subject progress.
 */
export async function countActiveTasksByKey(
  db: AppDb,
): Promise<Record<SubjectKey, number>> {
  const countActive = async (
    table:
      | typeof audioTasks
      | typeof readingTasks
      | typeof uoeTasks
      | typeof writingTasks,
  ) => {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(table)
      .where(eq(table.isDeleted, false));
    return row?.n ?? 0;
  };

  const [audioTotal, readingTotal, uoeTotal, writingTotal] = await Promise.all([
    countActive(audioTasks),
    countActive(readingTasks),
    countActive(uoeTasks),
    countActive(writingTasks),
  ]);

  return {
    audio: audioTotal,
    reading: readingTotal,
    "use-of-english": uoeTotal,
    writing: writingTotal,
  };
}

/** Progress per exam section: tasks done / available + average score. */
export async function getSubjectProgress(
  db: AppDb,
  userId: string,
): Promise<SubjectProgressRow[]> {
  const topics = await db.query.trainingTopics.findMany({
    columns: { id: true, category: true, title: true },
  });

  const idsByKey: Record<SubjectKey, number[]> = {
    audio: topics.filter((t) => t.category === "audio").map((t) => t.id),
    reading: topics.filter((t) => t.category === "reading").map((t) => t.id),
    "use-of-english": topics
      .filter((t) => t.category === "use-of-english")
      .map((t) => t.id),
    writing: topics
      .filter((t) => WRITING_TITLES.includes(t.title))
      .map((t) => t.id),
  };

  const totalByKey = await countActiveTasksByKey(db);

  const results = await db
    .select({
      activityId: userResults.activityId,
      result: userResults.result,
    })
    .from(userResults)
    .where(
      and(
        eq(userResults.userId, userId),
        eq(userResults.activityType, "training"),
      ),
    );

  return SUBJECT_ORDER.map((key) => {
    const ids = new Set(idsByKey[key]);
    const matches = results.filter((r) => ids.has(r.activityId));
    const total = totalByKey[key] ?? 0;

    let sumCorrect = 0;
    let sumMax = 0;
    let parsed = 0;
    for (const m of matches) {
      const p = parseResult(m.result);
      if (p) {
        sumCorrect += p.correct;
        sumMax += p.total;
        parsed++;
      }
    }

    return {
      key,
      done: matches.length,
      total,
      pct: total > 0 ? Math.round((matches.length / total) * 100) : 0,
      avgCorrect: parsed > 0 ? Math.round(sumCorrect / parsed) : 0,
      avgMax: parsed > 0 ? Math.round(sumMax / parsed) : 0,
    };
  });
}

export interface RecentActivityRow {
  id: number;
  createdAt: Date;
  kind: string;
  tone: "ok" | "warn" | "neutral";
  title: string;
  timeSpent: number | null;
  correct: number | null;
  max: number | null;
  grade: number | null;
  href: string | null;
}

/** Most recent activity rows, shaped for the history table. */
export async function getRecentActivity(
  db: AppDb,
  userId: string,
  limit: number,
): Promise<RecentActivityRow[]> {
  const rows = await db.query.userResults.findMany({
    where: eq(userResults.userId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });

  const trainingTopicIds = [
    ...new Set(
      rows
        .filter(
          (r) =>
            r.activityType === "training" ||
            r.activityType === "training_exam_mode",
        )
        .map((r) => r.activityId),
    ),
  ];
  const topics = trainingTopicIds.length
    ? await db.query.trainingTopics.findMany({
        where: inArray(trainingTopics.id, trainingTopicIds),
        columns: { id: true, title: true, category: true },
      })
    : [];
  const topicById = new Map(topics.map((t) => [t.id, t]));

  return rows.map((r) => {
    const topic = topicById.get(r.activityId);
    const parsed = parseResult(r.result);
    const mockDetails = isMockExamResultDetails(r.details) ? r.details : null;

    let kind = "Тренировка";
    let title = "Тренировка";
    if (r.activityType === "mock_exam") {
      kind = "Вариант";
      title = mockDetails?.mockExam.title ?? "Тренировочный вариант";
    } else if (r.activityType === "training_exam_mode") {
      kind = topic
        ? (SECTION_LABEL[topic.category] ?? "Тренировка")
        : "Тренировка";
      title = topic ? `${topic.title} · exam mode` : "Тренировка · exam mode";
    } else if (r.activityType === "diagnostics") {
      kind = "Диагностика";
      title = "Грамматическая диагностика";
    } else if (topic) {
      title = topic.title;
      kind = WRITING_TITLES.includes(topic.title)
        ? "Письмо"
        : (SECTION_LABEL[topic.category] ?? "Тренировка");
    }

    const tone: "ok" | "warn" | "neutral" = parsed
      ? parsed.correct / parsed.total >= 0.6
        ? "ok"
        : "warn"
      : "neutral";

    return {
      id: r.id,
      createdAt: r.createdAt,
      kind,
      tone,
      title,
      timeSpent: r.timeSpent,
      correct: parsed?.correct ?? null,
      max: parsed?.total ?? null,
      grade: mockDetails?.grade ?? null,
      href: mockDetails ? `/mock-exams/${r.activityId}/result/${r.id}` : null,
    };
  });
}
