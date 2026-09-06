import { randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { createTRPCContext } from "@/server/api/trpc";
import { classroomMembers, classrooms } from "@/server/db/schema";

type AppDb = Awaited<ReturnType<typeof createTRPCContext>>["db"];

/**
 * Generate an opaque, URL-safe invite token. 18 random bytes → 24 base64url
 * chars: enough entropy that tokens are unguessable, short enough to paste.
 */
export function generateInviteToken(): string {
  return randomBytes(18).toString("base64url");
}

/**
 * Assert that `teacherId` owns the classroom, returning it. Throws `NOT_FOUND`
 * both when the class is missing and when it belongs to another teacher — we do
 * not leak the existence of other teachers' classes.
 */
export async function assertOwnsClassroom(
  db: AppDb,
  teacherId: string,
  classroomId: string,
) {
  const classroom = await db.query.classrooms.findFirst({
    where: and(
      eq(classrooms.id, classroomId),
      eq(classrooms.teacherId, teacherId),
    ),
  });
  if (!classroom) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Класс не найден" });
  }
  return classroom;
}

/**
 * Assert that `studentId` is a member of `classroomId` AND that `teacherId`
 * owns that classroom. Returns the classroom + membership. Used to gate the
 * teacher's read-only view of a student's progress.
 */
export async function assertMemberOfOwnedClassroom(
  db: AppDb,
  teacherId: string,
  classroomId: string,
  studentId: string,
) {
  const classroom = await assertOwnsClassroom(db, teacherId, classroomId);
  const membership = await db.query.classroomMembers.findFirst({
    where: and(
      eq(classroomMembers.classroomId, classroomId),
      eq(classroomMembers.userId, studentId),
    ),
  });
  if (!membership) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Ученик не состоит в этом классе",
    });
  }
  return { classroom, membership };
}
