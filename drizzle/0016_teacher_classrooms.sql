CREATE TABLE "classroom_member" (
	"classroomId" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"joinedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "classroom_member_classroomId_userId_pk" PRIMARY KEY("classroomId","userId")
);
--> statement-breakpoint
CREATE TABLE "classroom" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"teacherId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"inviteToken" varchar(64) NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classroom_member" ADD CONSTRAINT "classroom_member_classroomId_classroom_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classroom"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_member" ADD CONSTRAINT "classroom_member_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_teacherId_user_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "classroom_member_user_idx" ON "classroom_member" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "classroom_member_classroom_idx" ON "classroom_member" USING btree ("classroomId");--> statement-breakpoint
CREATE UNIQUE INDEX "classroom_invite_token_idx" ON "classroom" USING btree ("inviteToken");--> statement-breakpoint
CREATE INDEX "classroom_teacher_id_idx" ON "classroom" USING btree ("teacherId");