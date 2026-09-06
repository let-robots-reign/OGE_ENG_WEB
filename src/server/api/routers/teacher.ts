import { z } from "zod";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  teacherProcedure,
} from "@/server/api/trpc";
import type { createTRPCContext } from "@/server/api/trpc";
import {
  classroomMembers,
  classrooms,
  trainingTopics,
  userResults,
  users,
} from "@/server/db/schema";
import {
  assertMemberOfOwnedClassroom,
  assertOwnsClassroom,
  generateInviteToken,
} from "@/server/api/lib/classrooms";
import {
  computeCurrentStreak,
  getActivity,
  getRecentActivity,
  getSubjectProgress,
  parseResult,
  safeTimeZone,
  SECTION_LABEL,
  SUBJECT_ORDER,
  todayYmd,
  WRITING_TITLES,
  type SubjectKey,
} from "@/server/api/lib/progress";

type AppDb = Awaited<ReturnType<typeof createTRPCContext>>["db"];

const DAY_MS = 24 * 60 * 60 * 1000;
const CLASS_TZ = "Europe/Moscow";

const classroomNameSchema = z.string().trim().min(1).max(255);

/** Ids of the students in a classroom. */
async function memberIdsOf(db: AppDb, classroomId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: classroomMembers.userId })
    .from(classroomMembers)
    .where(eq(classroomMembers.classroomId, classroomId));
  return rows.map((r) => r.userId);
}

/** Local day (CLASS_TZ) for a timestamp, as YYYY-MM-DD. */
function localDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CLASS_TZ }).format(date);
}

/**
 * Mock-exam attempts for a set of students, with grade/percentage extracted
 * from the JSONB `details` (mirrors `adminRouter.getMockExamResults`).
 */
async function memberMockRows(db: AppDb, memberIds: string[]) {
  if (memberIds.length === 0) return [];
  const rows = await db.query.userResults.findMany({
    where: and(
      eq(userResults.activityType, "mock_exam"),
      inArray(userResults.userId, memberIds),
    ),
    columns: { id: true, userId: true, activityId: true, createdAt: true },
    extras: {
      mockExamTitle:
        sql<string | null>`${userResults.details} -> 'mockExam' ->> 'title'`.as(
          "mock_exam_title",
        ),
      percentage: sql<number | null>`CASE WHEN jsonb_typeof(${userResults.details} -> 'percentage') = 'number' THEN (${userResults.details} ->> 'percentage')::integer ELSE NULL END`.as(
        "mock_exam_percentage",
      ),
      grade: sql<number | null>`CASE WHEN jsonb_typeof(${userResults.details} -> 'grade') = 'number' THEN (${userResults.details} ->> 'grade')::integer ELSE NULL END`.as(
        "mock_exam_grade",
      ),
      correctCount: sql<number | null>`CASE WHEN jsonb_typeof(${userResults.details} -> 'correctCount') = 'number' THEN (${userResults.details} ->> 'correctCount')::integer ELSE NULL END`.as(
        "mock_exam_correct",
      ),
      total: sql<number | null>`CASE WHEN jsonb_typeof(${userResults.details} -> 'total') = 'number' THEN (${userResults.details} ->> 'total')::integer ELSE NULL END`.as(
        "mock_exam_total",
      ),
    },
    orderBy: (t, { desc: d }) => [d(t.createdAt)],
  });
  return rows.flatMap((row) =>
    row.grade === null || row.percentage === null
      ? []
      : [
          {
            ...row,
            grade: row.grade,
            percentage: row.percentage,
            mockExamTitle: row.mockExamTitle ?? "Тренировочный вариант",
          },
        ],
  );
}

export const teacherRouter = createTRPCRouter({
  // --- Classrooms (owner) ---

  listClassrooms: teacherProcedure.query(async ({ ctx }) => {
    const rooms = await ctx.db.query.classrooms.findMany({
      where: eq(classrooms.teacherId, ctx.session.user.id),
      orderBy: (t, { desc: d }) => [d(t.createdAt)],
      with: {
        members: {
          columns: { userId: true, joinedAt: true },
          with: { user: { columns: { name: true, email: true } } },
        },
      },
    });

    const allMemberIds = rooms.flatMap((r) => r.members.map((m) => m.userId));
    const weekAgo = new Date(Date.now() - 7 * DAY_MS);

    // Most-recent activity per member (across all activity types). We derive
    // "active this week" from this in JS so the definition matches classActivity
    // (last activity within 7 days) and we avoid binding a JS Date into a raw
    // SQL fragment.
    const activity =
      allMemberIds.length > 0
        ? await ctx.db
            .select({
              userId: userResults.userId,
              lastAt: sql<string>`max(${userResults.createdAt})`.as("last_at"),
            })
            .from(userResults)
            .where(inArray(userResults.userId, allMemberIds))
            .groupBy(userResults.userId)
        : [];
    const lastByUser = new Map(
      activity.map((a) => [a.userId, a.lastAt ? new Date(a.lastAt) : null]),
    );

    return rooms.map((room) => {
      const members = room.members.map((m) => ({
        name: m.user?.name ?? null,
        email: m.user?.email ?? "",
      }));
      const activeThisWeek = room.members.filter((m) => {
        const at = lastByUser.get(m.userId) ?? null;
        return at !== null && at >= weekAgo;
      }).length;
      const lastActivityAt = room.members.reduce<Date | null>((acc, m) => {
        const at = lastByUser.get(m.userId) ?? null;
        if (at && (!acc || at > acc)) return at;
        return acc;
      }, null);
      return {
        id: room.id,
        name: room.name,
        createdAt: room.createdAt,
        inviteToken: room.inviteToken,
        memberCount: room.members.length,
        activeThisWeek,
        lastActivityAt,
        members: members.slice(0, 5),
      };
    });
  }),

  createClassroom: teacherProcedure
    .input(z.object({ name: classroomNameSchema }))
    .mutation(async ({ ctx, input }) => {
      const [room] = await ctx.db
        .insert(classrooms)
        .values({
          teacherId: ctx.session.user.id,
          name: input.name,
          inviteToken: generateInviteToken(),
        })
        .returning();
      if (!room) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось создать класс",
        });
      }
      return {
        id: room.id,
        name: room.name,
        inviteToken: room.inviteToken,
      };
    }),

  renameClassroom: teacherProcedure
    .input(z.object({ classroomId: z.string(), name: classroomNameSchema }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsClassroom(ctx.db, ctx.session.user.id, input.classroomId);
      await ctx.db
        .update(classrooms)
        .set({ name: input.name })
        .where(eq(classrooms.id, input.classroomId));
      return { success: true };
    }),

  deleteClassroom: teacherProcedure
    .input(z.object({ classroomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsClassroom(ctx.db, ctx.session.user.id, input.classroomId);
      await ctx.db
        .delete(classrooms)
        .where(eq(classrooms.id, input.classroomId));
      return { success: true };
    }),

  regenerateInviteToken: teacherProcedure
    .input(z.object({ classroomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsClassroom(ctx.db, ctx.session.user.id, input.classroomId);
      const token = generateInviteToken();
      await ctx.db
        .update(classrooms)
        .set({ inviteToken: token })
        .where(eq(classrooms.id, input.classroomId));
      return { inviteToken: token };
    }),

  /** Header info for the classroom cabinet. */
  getClassroom: teacherProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await assertOwnsClassroom(
        ctx.db,
        ctx.session.user.id,
        input.classroomId,
      );
      const [{ count } = { count: 0 }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(classroomMembers)
        .where(eq(classroomMembers.classroomId, room.id));
      return {
        id: room.id,
        name: room.name,
        createdAt: room.createdAt,
        inviteToken: room.inviteToken,
        memberCount: count,
      };
    }),

  // --- Invite / join (student side) ---

  /** Public-ish lookup for the join page. Returns null on an invalid token. */
  getClassroomByToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.query.classrooms.findFirst({
        where: eq(classrooms.inviteToken, input.token),
        with: {
          teacher: { columns: { name: true, email: true } },
          members: { columns: { userId: true } },
        },
      });
      if (!room) return null;

      const currentMembership = await ctx.db.query.classroomMembers.findFirst({
        where: eq(classroomMembers.userId, ctx.session.user.id),
        with: { classroom: { columns: { id: true, name: true } } },
      });

      return {
        id: room.id,
        name: room.name,
        teacherName: room.teacher?.name ?? room.teacher?.email ?? "Учитель",
        memberCount: room.members.length,
        viewerRole: ctx.session.user.role,
        currentClassroom: currentMembership
          ? {
              id: currentMembership.classroom.id,
              name: currentMembership.classroom.name,
            }
          : null,
        isCurrentClass: currentMembership?.classroomId === room.id,
      };
    }),

  /** Join (or transfer into) a classroom. Students only. */
  joinClassroom: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "student") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Вступить в класс может только ученик",
        });
      }
      const room = await ctx.db.query.classrooms.findFirst({
        where: eq(classrooms.inviteToken, input.token),
        columns: { id: true, name: true },
      });
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ссылка недействительна",
        });
      }

      // Transfer: a student belongs to exactly one class, so drop any existing
      // membership before inserting the new one (atomic).
      await ctx.db.transaction(async (tx) => {
        await tx
          .delete(classroomMembers)
          .where(eq(classroomMembers.userId, ctx.session.user.id));
        await tx.insert(classroomMembers).values({
          classroomId: room.id,
          userId: ctx.session.user.id,
        });
      });
      return { classroomId: room.id, name: room.name };
    }),

  /** Leave the class the current student is in. */
  leaveClassroom: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(classroomMembers)
      .where(eq(classroomMembers.userId, ctx.session.user.id));
    return { success: true };
  }),

  /** The class the current student is in (for the profile "Мой класс" block). */
  getMyClassroom: protectedProcedure.query(async ({ ctx }) => {
    const membership = await ctx.db.query.classroomMembers.findFirst({
      where: eq(classroomMembers.userId, ctx.session.user.id),
      with: {
        classroom: {
          with: { teacher: { columns: { name: true, email: true } } },
        },
      },
    });
    if (!membership) return null;
    return {
      id: membership.classroom.id,
      name: membership.classroom.name,
      teacherName:
        membership.classroom.teacher?.name ??
        membership.classroom.teacher?.email ??
        "Учитель",
      joinedAt: membership.joinedAt,
    };
  }),

  // --- Class roster & aggregates ---

  removeMember: teacherProcedure
    .input(z.object({ classroomId: z.string(), studentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwnsClassroom(ctx.db, ctx.session.user.id, input.classroomId);
      await ctx.db
        .delete(classroomMembers)
        .where(
          and(
            eq(classroomMembers.classroomId, input.classroomId),
            eq(classroomMembers.userId, input.studentId),
          ),
        );
      return { success: true };
    }),

  /** Tab 1: roster with per-student activity + class summary. */
  classActivity: teacherProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertOwnsClassroom(ctx.db, ctx.session.user.id, input.classroomId);

      const members = await ctx.db.query.classroomMembers.findMany({
        where: eq(classroomMembers.classroomId, input.classroomId),
        with: {
          user: { columns: { id: true, name: true, email: true } },
        },
        orderBy: (t, { asc }) => [asc(t.joinedAt)],
      });
      const memberIds = members.map((m) => m.userId);

      if (memberIds.length === 0) {
        return {
          summary: {
            studentCount: 0,
            activeThisWeek: 0,
            avgPercent: null as number | null,
            mockCount: 0,
            avgGrade: null as number | null,
          },
          students: [],
        };
      }

      // One pass over EVERY activity type. Activity days / streak / last-active
      // must match the student's own profile heatmap (getActivity counts all
      // user_results), so we do NOT filter by activityType here. The average
      // score, however, is derived only from `training` results, weighted by
      // task count — the same source and formula as `classSections`.
      const results = await ctx.db
        .select({
          userId: userResults.userId,
          createdAt: userResults.createdAt,
          result: userResults.result,
          activityType: userResults.activityType,
        })
        .from(userResults)
        .where(inArray(userResults.userId, memberIds));

      const perStudent = new Map<
        string,
        { days: Set<string>; last: Date | null; correct: number; max: number }
      >();
      for (const id of memberIds) {
        perStudent.set(id, { days: new Set(), last: null, correct: 0, max: 0 });
      }
      const weekAgo = new Date(Date.now() - 7 * DAY_MS);
      for (const r of results) {
        const s = perStudent.get(r.userId);
        if (!s) continue;
        // Every activity type contributes an active day / last-active time.
        s.days.add(localDay(r.createdAt));
        if (!s.last || r.createdAt > s.last) s.last = r.createdAt;
        // Average score: training only, pooled (weighted) like classSections.
        if (r.activityType === "training") {
          const p = parseResult(r.result);
          if (p) {
            s.correct += p.correct;
            s.max += p.total;
          }
        }
      }

      const mockRows = await memberMockRows(ctx.db, memberIds);
      const today = todayYmd(CLASS_TZ);

      const students = members.map((m) => {
        const s = perStudent.get(m.userId)!;
        const daysDesc = [...s.days].sort().reverse();
        const { count: currentStreak } = computeCurrentStreak(daysDesc, today);
        const avgPercent =
          s.max > 0 ? Math.round((s.correct / s.max) * 100) : null;
        return {
          userId: m.userId,
          name: m.user?.name ?? null,
          email: m.user?.email ?? "",
          joinedAt: m.joinedAt,
          lastActivity: s.last,
          currentStreak,
          activeDays: s.days.size,
          avgPercent,
        };
      });

      const activeThisWeek = students.filter(
        (s) => s.lastActivity && s.lastActivity >= weekAgo,
      ).length;
      const allPct = students.filter((s) => s.avgPercent !== null);
      const avgPercent =
        allPct.length > 0
          ? Math.round(
              allPct.reduce((sum, s) => sum + (s.avgPercent ?? 0), 0) /
                allPct.length,
            )
          : null;
      const avgGrade =
        mockRows.length > 0
          ? Math.round(
              (mockRows.reduce((sum, r) => sum + r.grade, 0) /
                mockRows.length) *
                10,
            ) / 10
          : null;

      return {
        summary: {
          studentCount: members.length,
          activeThisWeek,
          avgPercent,
          mockCount: mockRows.length,
          avgGrade,
        },
        students,
      };
    }),

  /** Tab 2: average score per section across students who studied it. */
  classSections: teacherProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertOwnsClassroom(ctx.db, ctx.session.user.id, input.classroomId);
      const memberIds = await memberIdsOf(ctx.db, input.classroomId);

      const topics = await ctx.db.query.trainingTopics.findMany({
        columns: { id: true, category: true, title: true },
      });
      const sectionOfTopic = new Map<number, SubjectKey>();
      for (const t of topics) {
        if (WRITING_TITLES.includes(t.title)) sectionOfTopic.set(t.id, "writing");
        else if (t.category === "audio") sectionOfTopic.set(t.id, "audio");
        else if (t.category === "reading") sectionOfTopic.set(t.id, "reading");
        else if (t.category === "use-of-english")
          sectionOfTopic.set(t.id, "use-of-english");
      }

      const results =
        memberIds.length > 0
          ? await ctx.db
              .select({
                userId: userResults.userId,
                activityId: userResults.activityId,
                result: userResults.result,
              })
              .from(userResults)
              .where(
                and(
                  inArray(userResults.userId, memberIds),
                  eq(userResults.activityType, "training"),
                ),
              )
          : [];

      const agg = new Map<
        SubjectKey,
        { students: Set<string>; correct: number; max: number; n: number }
      >();
      for (const key of SUBJECT_ORDER) {
        agg.set(key, { students: new Set(), correct: 0, max: 0, n: 0 });
      }
      for (const r of results) {
        const key = sectionOfTopic.get(r.activityId);
        if (!key) continue;
        const a = agg.get(key)!;
        a.students.add(r.userId);
        const p = parseResult(r.result);
        if (p) {
          a.correct += p.correct;
          a.max += p.total;
          a.n += 1;
        }
      }

      const sections = SUBJECT_ORDER.map((key) => {
        const a = agg.get(key)!;
        const pct = a.max > 0 ? Math.round((a.correct / a.max) * 100) : 0;
        return {
          key,
          studentsStudied: a.students.size,
          totalStudents: memberIds.length,
          pct: a.n > 0 ? pct : null,
          avgCorrect: a.n > 0 ? Math.round(a.correct / a.n) : 0,
          avgMax: a.n > 0 ? Math.round(a.max / a.n) : 0,
        };
      });

      const withData = sections.filter((s) => s.pct !== null);
      const avgPercent =
        withData.length > 0
          ? Math.round(
              withData.reduce((sum, s) => sum + (s.pct ?? 0), 0) /
                withData.length,
            )
          : null;
      const weakestKey =
        withData.length > 0
          ? withData.reduce((min, s) =>
              (s.pct ?? 100) < (min.pct ?? 100) ? s : min,
            ).key
          : null;

      return { sections, avgPercent, weakestKey };
    }),

  /** Tab 3: grade distribution + recent attempts. */
  classMockExams: teacherProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertOwnsClassroom(ctx.db, ctx.session.user.id, input.classroomId);
      const members = await ctx.db.query.classroomMembers.findMany({
        where: eq(classroomMembers.classroomId, input.classroomId),
        with: { user: { columns: { id: true, name: true, email: true } } },
      });
      const memberIds = members.map((m) => m.userId);
      const nameById = new Map(
        members.map((m) => [
          m.userId,
          { name: m.user?.name ?? null, email: m.user?.email ?? "" },
        ]),
      );

      const rows = await memberMockRows(ctx.db, memberIds);

      const distribution: Record<2 | 3 | 4 | 5, number> = {
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      let gradeSum = 0;
      let pctSum = 0;
      for (const r of rows) {
        const g = (r.grade >= 2 && r.grade <= 5 ? r.grade : 2) as 2 | 3 | 4 | 5;
        distribution[g] += 1;
        gradeSum += r.grade;
        pctSum += r.percentage;
      }

      return {
        total: rows.length,
        distribution,
        avgGrade:
          rows.length > 0 ? Math.round((gradeSum / rows.length) * 10) / 10 : null,
        avgPercent: rows.length > 0 ? Math.round(pctSum / rows.length) : null,
        attempts: rows.slice(0, 20).map((r) => ({
          id: r.id,
          studentId: r.userId,
          studentName: nameById.get(r.userId)?.name ?? null,
          studentEmail: nameById.get(r.userId)?.email ?? "",
          title: r.mockExamTitle,
          createdAt: r.createdAt,
          correct: r.correctCount,
          max: r.total,
          percentage: r.percentage,
          grade: r.grade,
        })),
      };
    }),

  /** Tab 4: topics with the highest error rate over the last 30 days. */
  classWeakTopics: teacherProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertOwnsClassroom(ctx.db, ctx.session.user.id, input.classroomId);
      const memberIds = await memberIdsOf(ctx.db, input.classroomId);
      if (memberIds.length === 0) return { topics: [] };

      const since = new Date(Date.now() - 30 * DAY_MS);
      const results = await ctx.db
        .select({
          activityId: userResults.activityId,
          result: userResults.result,
        })
        .from(userResults)
        .where(
          and(
            inArray(userResults.userId, memberIds),
            inArray(userResults.activityType, ["training", "training_exam_mode"]),
            gte(userResults.createdAt, since),
          ),
        );

      const byTopic = new Map<number, { correct: number; max: number }>();
      for (const r of results) {
        const p = parseResult(r.result);
        if (!p) continue;
        const cur = byTopic.get(r.activityId) ?? { correct: 0, max: 0 };
        cur.correct += p.correct;
        cur.max += p.total;
        byTopic.set(r.activityId, cur);
      }
      if (byTopic.size === 0) return { topics: [] };

      const topics = await ctx.db.query.trainingTopics.findMany({
        where: inArray(trainingTopics.id, [...byTopic.keys()]),
        columns: { id: true, title: true, category: true },
      });
      const topicById = new Map(topics.map((t) => [t.id, t]));

      const rows = [...byTopic.entries()]
        .map(([topicId, v]) => {
          const topic = topicById.get(topicId);
          const errorRate = v.max > 0 ? 1 - v.correct / v.max : 0;
          return {
            topicId,
            title: topic?.title ?? `Тема #${topicId}`,
            section: topic
              ? WRITING_TITLES.includes(topic.title)
                ? "writing"
                : ((topic.category as SubjectKey) ?? "use-of-english")
              : "use-of-english",
            sectionLabel: topic
              ? WRITING_TITLES.includes(topic.title)
                ? "Письмо"
                : (SECTION_LABEL[topic.category] ?? "Языковой материал")
              : "Языковой материал",
            errorPercent: Math.round(errorRate * 100),
            attempts: v.max,
          };
        })
        .sort((a, b) => b.errorPercent - a.errorPercent)
        .slice(0, 8);

      return { topics: rows };
    }),

  // --- Student progress (read-only) ---

  /** Header + subject progress + recent history for a student's progress page. */
  getStudentProgress: teacherProcedure
    .input(z.object({ classroomId: z.string(), studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { membership } = await assertMemberOfOwnedClassroom(
        ctx.db,
        ctx.session.user.id,
        input.classroomId,
        input.studentId,
      );
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.studentId),
        columns: { name: true, email: true, role: true },
      });
      const [subjects, recent] = await Promise.all([
        getSubjectProgress(ctx.db, input.studentId),
        getRecentActivity(ctx.db, input.studentId, 50),
      ]);
      return {
        header: {
          name: user?.name ?? null,
          email: user?.email ?? "",
          joinedAt: membership.joinedAt,
        },
        subjects,
        recent,
      };
    }),

  /** Activity heatmap for a student, using the viewer's browser timezone. */
  getStudentActivity: teacherProcedure
    .input(
      z.object({
        classroomId: z.string(),
        studentId: z.string(),
        timeZone: z.string(),
        weeks: z.number().int().min(1).max(53).default(16),
      }),
    )
    .query(async ({ ctx, input }) => {
      await assertMemberOfOwnedClassroom(
        ctx.db,
        ctx.session.user.id,
        input.classroomId,
        input.studentId,
      );
      return getActivity(
        ctx.db,
        input.studentId,
        safeTimeZone(input.timeZone),
        input.weeks,
      );
    }),
});
