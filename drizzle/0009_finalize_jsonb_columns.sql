ALTER TABLE "audio_task_first" RENAME COLUMN "questions_json" TO "questions";--> statement-breakpoint
ALTER TABLE "audio_task_first" RENAME COLUMN "answers_json" TO "answers";--> statement-breakpoint
ALTER TABLE "audio_task_first" RENAME COLUMN "explanations_json" TO "explanations";--> statement-breakpoint
ALTER TABLE "audio_task_first" ALTER COLUMN "questions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audio_task_first" ALTER COLUMN "answers" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audio_task_first" ALTER COLUMN "explanations" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "audio_task_first" DROP COLUMN "task";--> statement-breakpoint
ALTER TABLE "audio_task_first" DROP COLUMN "answer";--> statement-breakpoint
ALTER TABLE "audio_task_first" DROP COLUMN "explanation";--> statement-breakpoint

ALTER TABLE "reading_task_first" RENAME COLUMN "texts_json" TO "texts";--> statement-breakpoint
ALTER TABLE "reading_task_first" RENAME COLUMN "headings_json" TO "headings";--> statement-breakpoint
ALTER TABLE "reading_task_first" RENAME COLUMN "answers_json" TO "answers";--> statement-breakpoint
ALTER TABLE "reading_task_first" RENAME COLUMN "explanations_json" TO "explanations";--> statement-breakpoint
ALTER TABLE "reading_task_first" ALTER COLUMN "texts" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reading_task_first" ALTER COLUMN "headings" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reading_task_first" ALTER COLUMN "answers" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reading_task_first" ALTER COLUMN "explanations" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reading_task_first" DROP COLUMN "text";--> statement-breakpoint
ALTER TABLE "reading_task_first" DROP COLUMN "task";--> statement-breakpoint
ALTER TABLE "reading_task_first" DROP COLUMN "answer";--> statement-breakpoint
ALTER TABLE "reading_task_first" DROP COLUMN "explanation";
