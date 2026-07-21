import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  audioTasksFirst,
  readingTasksFirst,
  trainingTopics,
  uoeTasks,
  userResults,
  users,
  writingTasks,
} from "@/server/db/schema";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/** Topic titles that represent the "Письмо" (Writing) section. */
const WRITING_TITLES = ["Письмо", "Письмо Упражнения"];

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

function safeTimeZone(tz: string): string {
  const mappedTz = TIMEZONE_MAPPING[tz] ?? tz;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: mappedTz }).format(new Date());
    return mappedTz;
  } catch {
    return "Europe/Moscow";
  }
}

function todayYmd(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}

/** Parse a `"correct/total"` result string. Returns null for empty/malformed. */
function parseResult(raw: string): { correct: number; total: number } | null {
  const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(raw);
  if (!m) return null;
  const correct = Number(m[1]);
  const total = Number(m[2]);
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total === 0) {
    return null;
  }
  return { correct, total };
}

/** Current consecutive-day streak anchored at today (or yesterday). */
function computeCurrentStreak(
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
function computeBestStreak(daysAsc: string[]): number {
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

export const userRouter = createTRPCRouter({
  /** DB-authoritative identity for the profile header (avoids JWT staleness). */
  getProfileHeader: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
        telegramUsername: true,
        school: true,
        examPointsGoal: true,
        notificationsWeekly: true,
        notificationsMarketing: true,
      },
    });
    return (
      user ?? {
        name: ctx.session.user.name ?? null,
        email: ctx.session.user.email ?? "",
        image: ctx.session.user.image ?? null,
        emailVerified: null,
        role: ctx.session.user.role ?? null,
        telegramUsername: null,
        school: null,
        examPointsGoal: null,
        notificationsWeekly: true,
        notificationsMarketing: false,
      }
    );
  }),

  getStreak: protectedProcedure
    .input(z.object({ timeZone: z.string() }))
    .query(async ({ ctx, input }) => {
      let tz = safeTimeZone(input.timeZone);

      let rows;
      try {
        rows = await ctx.db
          .selectDistinct({
            day: sql<string>`to_char((${userResults.createdAt} AT TIME ZONE ${tz}), 'YYYY-MM-DD')`,
          })
          .from(userResults)
          .where(eq(userResults.userId, ctx.session.user.id));
      } catch (err) {
        console.error(`Postgres error for timezone "${tz}" in getStreak:`, err);
        tz = "Europe/Moscow";
        rows = await ctx.db
          .selectDistinct({
            day: sql<string>`to_char((${userResults.createdAt} AT TIME ZONE ${tz}), 'YYYY-MM-DD')`,
          })
          .from(userResults)
          .where(eq(userResults.userId, ctx.session.user.id));
      }

      const daysDesc = rows
        .map((r) => r.day)
        .sort()
        .reverse();

      return computeCurrentStreak(daysDesc, todayYmd(tz));
    }),

  /** Streak + best streak + per-day activity heatmap for the last `weeks` weeks. */
  getActivity: protectedProcedure
    .input(
      z.object({
        timeZone: z.string(),
        weeks: z.number().int().min(1).max(53).default(16),
      }),
    )
    .query(async ({ ctx, input }) => {
      let tz = safeTimeZone(input.timeZone);
      const { weeks } = input;

      let rows;
      try {
        rows = await ctx.db
          .select({
            day: sql<string>`to_char((${userResults.createdAt} AT TIME ZONE ${tz}), 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
            seconds: sql<number>`coalesce(sum(${userResults.timeSpent}), 0)::int`,
          })
          .from(userResults)
          .where(eq(userResults.userId, ctx.session.user.id))
          .groupBy(sql`1`);
      } catch (err) {
        console.error(
          `Postgres error for timezone "${tz}" in getActivity:`,
          err,
        );
        tz = "Europe/Moscow";
        rows = await ctx.db
          .select({
            day: sql<string>`to_char((${userResults.createdAt} AT TIME ZONE ${tz}), 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
            seconds: sql<number>`coalesce(sum(${userResults.timeSpent}), 0)::int`,
          })
          .from(userResults)
          .where(eq(userResults.userId, ctx.session.user.id))
          .groupBy(sql`1`);
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
    }),

  /** Progress per exam section: tasks done / available + average score. */
  getSubjectProgress: protectedProcedure.query(async ({ ctx }) => {
    const topics = await ctx.db.query.trainingTopics.findMany({
      columns: { id: true, category: true, title: true },
    });

    const idsByKey: Record<string, number[]> = {
      audio: topics.filter((t) => t.category === "audio").map((t) => t.id),
      reading: topics.filter((t) => t.category === "reading").map((t) => t.id),
      "use-of-english": topics
        .filter((t) => t.category === "use-of-english")
        .map((t) => t.id),
      writing: topics
        .filter((t) => WRITING_TITLES.includes(t.title))
        .map((t) => t.id),
    };

    const countActive = async (
      table:
        | typeof audioTasksFirst
        | typeof readingTasksFirst
        | typeof uoeTasks
        | typeof writingTasks,
    ) => {
      const [row] = await ctx.db
        .select({ n: sql<number>`count(*)::int` })
        .from(table)
        .where(eq(table.isDeleted, false));
      return row?.n ?? 0;
    };

    const [audioTotal, readingTotal, uoeTotal, writingTotal] =
      await Promise.all([
        countActive(audioTasksFirst),
        countActive(readingTasksFirst),
        countActive(uoeTasks),
        countActive(writingTasks),
      ]);

    const totalByKey: Record<string, number> = {
      audio: audioTotal,
      reading: readingTotal,
      "use-of-english": uoeTotal,
      writing: writingTotal,
    };

    const results = await ctx.db
      .select({
        activityId: userResults.activityId,
        result: userResults.result,
      })
      .from(userResults)
      .where(
        and(
          eq(userResults.userId, ctx.session.user.id),
          eq(userResults.activityType, "training"),
        ),
      );

    const order = ["audio", "reading", "use-of-english", "writing"] as const;
    return order.map((key) => {
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
  }),

  /** Most recent activity rows, shaped for the history table. */
  getRecentActivity: protectedProcedure
    .input(
      z.object({ limit: z.number().int().min(1).max(50).default(8) }).default({
        limit: 8,
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.userResults.findMany({
        where: eq(userResults.userId, ctx.session.user.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        limit: input.limit,
      });

      const trainingTopicIds = [
        ...new Set(
          rows
            .filter((r) => r.activityType === "training")
            .map((r) => r.activityId),
        ),
      ];
      const topics = trainingTopicIds.length
        ? await ctx.db.query.trainingTopics.findMany({
            where: inArray(trainingTopics.id, trainingTopicIds),
            columns: { id: true, title: true, category: true },
          })
        : [];
      const topicById = new Map(topics.map((t) => [t.id, t]));

      const sectionLabel: Record<string, string> = {
        audio: "Аудирование",
        reading: "Чтение",
        "use-of-english": "Языковой материал",
      };

      return rows.map((r) => {
        const topic = topicById.get(r.activityId);
        const parsed = parseResult(r.result);

        let kind = "Тренировка";
        let title = "Тренировка";
        if (r.activityType === "mock_exam") {
          kind = "Вариант";
          title = "Тренировочный вариант";
        } else if (r.activityType === "diagnostics") {
          kind = "Диагностика";
          title = "Грамматическая диагностика";
        } else if (topic) {
          title = topic.title;
          kind = WRITING_TITLES.includes(topic.title)
            ? "Письмо"
            : (sectionLabel[topic.category] ?? "Тренировка");
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
        };
      });
    }),

  /** Update editable identity fields. */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(255),
        email: z.string().trim().email().max(255),
        telegramUsername: z.string().trim().max(255).nullable(),
        school: z.string().trim().max(255).nullable(),
        examPointsGoal: z.number().int().min(0).max(35).nullable(),
        notificationsWeekly: z.boolean(),
        notificationsMarketing: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.query.users.findFirst({
        where: and(eq(users.email, input.email), ne(users.id, userId)),
        columns: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Этот e-mail уже используется.",
        });
      }

      await ctx.db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          telegramUsername: input.telegramUsername,
          school: input.school,
          examPointsGoal: input.examPointsGoal,
          notificationsWeekly: input.notificationsWeekly,
          notificationsMarketing: input.notificationsMarketing,
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),
});
