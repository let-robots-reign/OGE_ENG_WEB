CREATE TABLE "diagnostics_run" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"inputHash" varchar(64) NOT NULL,
	"status" varchar(16) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"batches" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"feedback" text
);
--> statement-breakpoint
ALTER TABLE "diagnostics_run" ADD CONSTRAINT "diagnostics_run_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diagnostics_run_user_hash_idx" ON "diagnostics_run" USING btree ("userId","inputHash");--> statement-breakpoint
CREATE INDEX "diagnostics_run_created_idx" ON "diagnostics_run" USING btree ("createdAt");