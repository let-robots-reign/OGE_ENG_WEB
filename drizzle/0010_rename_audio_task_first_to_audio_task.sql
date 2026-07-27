ALTER TABLE "audio_task_first" RENAME TO "audio_task";--> statement-breakpoint
ALTER TABLE "audio_task" RENAME CONSTRAINT "audio_task_first_pkey" TO "audio_task_pkey";--> statement-breakpoint
ALTER SEQUENCE IF EXISTS "audio_task_first_id_seq" RENAME TO "audio_task_id_seq";--> statement-breakpoint
ALTER TABLE "audio_task" ADD COLUMN "taskType" varchar(255) DEFAULT 'multiple_choice' NOT NULL;--> statement-breakpoint
SELECT setval(
  pg_get_serial_sequence('audio_task', 'id'),
  COALESCE((SELECT MAX(id) FROM audio_task), 1)
);
