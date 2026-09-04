ALTER TABLE "uoe_task_chain" ADD COLUMN "topicId" integer;--> statement-breakpoint
UPDATE "uoe_task_chain"
SET "topicId" = (
	SELECT "id"
	FROM "training_topic"
	WHERE "title" = 'По всем темам' AND "category" = 'use-of-english'
	ORDER BY "id"
	LIMIT 1
);--> statement-breakpoint
ALTER TABLE "uoe_task_chain" ALTER COLUMN "topicId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "uoe_task_chain" ADD CONSTRAINT "uoe_task_chain_topicId_training_topic_id_fk" FOREIGN KEY ("topicId") REFERENCES "public"."training_topic"("id") ON DELETE restrict ON UPDATE no action;
