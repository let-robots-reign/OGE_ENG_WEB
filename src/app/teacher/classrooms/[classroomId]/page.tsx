import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { api } from "@/trpc/server";
import { ClassroomInviteCard } from "@/app/_components/teacher/classroom-invite-card";
import { ClassroomSettings } from "@/app/_components/teacher/classroom-settings";
import { ClassroomTabs } from "@/app/_components/teacher/classroom-tabs";
import { formatLongDate } from "@/app/_components/teacher/utils";
import { pluralize } from "@/app/_utils/pluralize";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;

  let room;
  try {
    room = await api.teacher.getClassroom({ classroomId });
  } catch (err) {
    if (err instanceof TRPCError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  return (
    <div className="px-5 pt-7 pb-16 sm:px-8 lg:px-14">
      <Link
        href="/teacher"
        className="text-ink-3 hover:text-ink text-[13.5px] transition-colors"
      >
        ← Мои классы
      </Link>

      <div className="mt-4 flex flex-col items-start justify-between gap-5 lg:flex-row">
        <div>
          <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            Класс
          </div>
          <h1 className="font-display mt-3 text-[32px] leading-none tracking-[-0.03em] sm:text-[44px]">
            {room.name}
          </h1>
          <div className="text-ink-3 mt-3 text-[14.5px]">
            {room.memberCount}{" "}
            {pluralize(room.memberCount, "ученик", "ученика", "учеников")} ·
            создан {formatLongDate(room.createdAt)}
          </div>
          <ClassroomSettings classroomId={room.id} name={room.name} />
        </div>

        <ClassroomInviteCard
          classroomId={room.id}
          initialToken={room.inviteToken}
        />
      </div>

      <ClassroomTabs classroomId={room.id} inviteToken={room.inviteToken} />
    </div>
  );
}
