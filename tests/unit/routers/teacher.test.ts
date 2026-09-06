/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { vi } from "vitest";

vi.mock("@/server/db", () => ({
  db: {
    query: {
      classrooms: { findFirst: vi.fn(), findMany: vi.fn() },
      classroomMembers: { findFirst: vi.fn(), findMany: vi.fn() },
      users: { findFirst: vi.fn() },
      userResults: { findMany: vi.fn() },
      trainingTopics: { findMany: vi.fn() },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(),
  },
}));

import { describe, it, expect, beforeEach } from "vitest";
import { teacherRouter } from "@/server/api/routers/teacher";
import { createCallerFactory } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

const createCaller = createCallerFactory(teacherRouter);

const caller = (role: string | null, id = "teacher-1") =>
  createCaller({
    db: db as any,
    session: { user: { id, role }, expires: "" } as any,
    headers: new Headers(),
  });

describe("teacherRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("role gate (teacherProcedure)", () => {
    it("rejects a student with FORBIDDEN", async () => {
      await expect(caller("student").listClassrooms()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("rejects an unauthenticated caller with UNAUTHORIZED", async () => {
      const anon = createCaller({
        db: db as any,
        session: null as any,
        headers: new Headers(),
      });
      await expect(anon.listClassrooms()).rejects.toBeInstanceOf(TRPCError);
    });

    it("allows a teacher through", async () => {
      vi.mocked(db.query.classrooms.findMany).mockResolvedValue([] as any);
      await expect(caller("teacher").listClassrooms()).resolves.toEqual([]);
    });

    it("allows an admin through", async () => {
      vi.mocked(db.query.classrooms.findMany).mockResolvedValue([] as any);
      await expect(caller("admin").listClassrooms()).resolves.toEqual([]);
    });
  });

  describe("ownership guards", () => {
    it("getClassroom throws NOT_FOUND when the class is not owned by the caller", async () => {
      vi.mocked(db.query.classrooms.findFirst).mockResolvedValue(
        undefined as any,
      );
      await expect(
        caller("teacher").getClassroom({ classroomId: "c-other" }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("renameClassroom throws NOT_FOUND for a non-owned class (never updates)", async () => {
      vi.mocked(db.query.classrooms.findFirst).mockResolvedValue(
        undefined as any,
      );
      await expect(
        caller("teacher").renameClassroom({
          classroomId: "c-other",
          name: "New",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(db.update).not.toHaveBeenCalled();
    });

    it("removeMember throws NOT_FOUND for a non-owned class (never deletes)", async () => {
      vi.mocked(db.query.classrooms.findFirst).mockResolvedValue(
        undefined as any,
      );
      await expect(
        caller("teacher").removeMember({
          classroomId: "c-other",
          studentId: "s-1",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(db.delete).not.toHaveBeenCalled();
    });

    it("getStudentProgress throws NOT_FOUND when the student is not a member", async () => {
      // Owns the class...
      vi.mocked(db.query.classrooms.findFirst).mockResolvedValue({
        id: "c-1",
        teacherId: "teacher-1",
        name: "9A",
      } as any);
      // ...but the student is not in it.
      vi.mocked(db.query.classroomMembers.findFirst).mockResolvedValue(
        undefined as any,
      );
      await expect(
        caller("teacher").getStudentProgress({
          classroomId: "c-1",
          studentId: "s-x",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("joinClassroom (student-only)", () => {
    it("forbids a teacher from joining a class", async () => {
      await expect(
        caller("teacher").joinClassroom({ token: "tok" }),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("returns NOT_FOUND for an invalid token", async () => {
      vi.mocked(db.query.classrooms.findFirst).mockResolvedValue(
        undefined as any,
      );
      await expect(
        caller("student").joinClassroom({ token: "bad" }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("does not replace an existing membership in the same class", async () => {
      vi.mocked(db.query.classrooms.findFirst).mockResolvedValue({
        id: "c-1",
        name: "9A",
      } as any);
      vi.mocked(db.query.classroomMembers.findFirst).mockResolvedValue({
        classroomId: "c-1",
      } as any);

      await expect(
        caller("student", "student-1").joinClassroom({ token: "tok" }),
      ).resolves.toEqual({ classroomId: "c-1", name: "9A" });
      expect(db.transaction).not.toHaveBeenCalled();
    });
  });

  describe("getClassroomByToken", () => {
    it("returns null for an invalid token", async () => {
      vi.mocked(db.query.classrooms.findFirst).mockResolvedValue(
        undefined as any,
      );
      await expect(
        caller("student").getClassroomByToken({ token: "nope" }),
      ).resolves.toBeNull();
    });
  });

  describe("classWeakTopics", () => {
    it("omits topics where every answer was correct", async () => {
      vi.mocked(db.query.classrooms.findFirst).mockResolvedValue({
        id: "c-1",
        teacherId: "teacher-1",
        name: "9A",
      } as any);

      const membersWhere = vi.fn().mockResolvedValue([{ userId: "student-1" }]);
      const resultsWhere = vi.fn().mockResolvedValue([
        { activityId: 10, result: "6/6" },
        { activityId: 11, result: "5/6" },
      ]);
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn(() => ({ where: membersWhere })),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn(() => ({ where: resultsWhere })),
        } as any);
      vi.mocked(db.query.trainingTopics.findMany).mockResolvedValue([
        { id: 10, title: "Perfect", category: "use-of-english" },
        { id: 11, title: "Needs work", category: "use-of-english" },
      ] as any);

      const result = await caller("teacher").classWeakTopics({
        classroomId: "c-1",
      });

      expect(result.topics).toHaveLength(1);
      expect(result.topics[0]).toMatchObject({
        topicId: 11,
        errorPercent: 17,
      });
    });
  });

  describe("createClassroom", () => {
    it("inserts a class with a generated invite token", async () => {
      const returning = vi
        .fn()
        .mockResolvedValue([
          { id: "c-new", name: "9B", inviteToken: "abc123" },
        ]);
      const values = vi.fn((_v: { inviteToken: string }) => ({ returning }));
      vi.mocked(db.insert).mockReturnValue({ values } as any);

      const res = await caller("teacher").createClassroom({ name: "9B" });
      expect(res).toEqual({ id: "c-new", name: "9B", inviteToken: "abc123" });
      // A non-empty invite token was generated and passed to the insert.
      const inserted = values.mock.calls[0]?.[0];
      expect(inserted?.inviteToken).toEqual(expect.any(String));
      expect((inserted?.inviteToken ?? "").length).toBeGreaterThan(10);
    });
  });
});
