"use server";

import bcrypt from "bcrypt";
import { type z } from "zod";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { SignupSchema } from "./schema";

type SignupData = z.infer<typeof SignupSchema>;

export type SignupResult = {
  success: boolean;
  error?: string;
};

export async function signup(data: SignupData): Promise<SignupResult> {
  const validationResult = SignupSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { name, email, password } = validationResult.data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return {
      success: false,
      error: "Пользователь с таким email уже существует",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    hashedPassword,
  });

  console.log("here", name, email, hashedPassword);

  return { success: true };
}
