"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function updateRole(
  role: "student" | "teacher",
): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  try {
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, session.user.id));
    return { success: true };
  } catch {
    return { success: false };
  }
}
