ALTER TABLE "reading_task_first" RENAME TO "reading_task";--> statement-breakpoint
ALTER TABLE "reading_task" RENAME CONSTRAINT "reading_task_first_pkey" TO "reading_task_pkey";--> statement-breakpoint
ALTER TABLE "reading_task" RENAME CONSTRAINT "reading_task_first_topicId_training_topic_id_fk" TO "reading_task_topicId_training_topic_id_fk";--> statement-breakpoint
ALTER SEQUENCE IF EXISTS "reading_task_first_id_seq" RENAME TO "reading_task_id_seq";--> statement-breakpoint
ALTER TABLE "reading_task" ADD COLUMN "taskType" varchar(255) DEFAULT 'matching' NOT NULL;--> statement-breakpoint
SELECT setval(
  pg_get_serial_sequence('reading_task', 'id'),
  COALESCE((SELECT MAX(id) FROM reading_task), 1),
  (SELECT MAX(id) FROM reading_task) IS NOT NULL
);
