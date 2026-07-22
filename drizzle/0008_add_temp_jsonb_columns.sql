ALTER TABLE "audio_task_first" ADD COLUMN "questions_json" jsonb;--> statement-breakpoint
ALTER TABLE "audio_task_first" ADD COLUMN "answers_json" jsonb;--> statement-breakpoint
ALTER TABLE "audio_task_first" ADD COLUMN "explanations_json" jsonb;--> statement-breakpoint
ALTER TABLE "reading_task_first" ADD COLUMN "texts_json" jsonb;--> statement-breakpoint
ALTER TABLE "reading_task_first" ADD COLUMN "headings_json" jsonb;--> statement-breakpoint
ALTER TABLE "reading_task_first" ADD COLUMN "answers_json" jsonb;--> statement-breakpoint
ALTER TABLE "reading_task_first" ADD COLUMN "explanations_json" jsonb;