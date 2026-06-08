ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
UPDATE "user" SET "role" = 'student';
CREATE TYPE "public"."role" AS ENUM('student', 'teacher', 'admin');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE role USING "role"::text::role;--> statement-breakpoint
