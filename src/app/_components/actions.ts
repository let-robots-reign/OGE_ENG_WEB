"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

/** One-time role choice for users created without one (see RoleGate). */
export async function updateRole(
  role: "student" | "teacher",
): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  try {
    // Only fills an empty role, so this can't be used to switch roles later.
    await db
      .update(users)
      .set({ role })
      .where(and(eq(users.id, session.user.id), isNull(users.role)));
    return { success: true };
  } catch {
    return { success: false };
  }
}
