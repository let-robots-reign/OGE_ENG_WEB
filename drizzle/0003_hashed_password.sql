ALTER TABLE "user" ADD COLUMN "hashedPassword" text;--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "user" USING btree ("email");