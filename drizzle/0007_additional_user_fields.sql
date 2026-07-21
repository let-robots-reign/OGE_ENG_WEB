ALTER TABLE "user" ADD COLUMN "telegramUsername" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "school" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "examPointsGoal" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notificationsWeekly" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notificationsMarketing" boolean DEFAULT false NOT NULL;