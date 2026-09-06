import Link from "next/link";
import { avatarTone, getInitials, relativeDay } from "./utils";
import { pluralize } from "@/app/_utils/pluralize";

interface ClassroomCardData {
  id: string;
  name: string;
  createdAt: Date;
  memberCount: number;
  activeThisWeek: number;
  lastActivityAt: Date | null;
  members: { name: string | null; email: string }[];
}

const createdFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
});

export function ClassroomCard({ room }: { room: ClassroomCardData }) {
  const pct =
    room.memberCount > 0
      ? Math.round((room.activeThisWeek / room.memberCount) * 100)
      : 0;
  const extra = room.memberCount - room.members.length;

  return (
    <Link
      href={`/teacher/classrooms/${room.id}`}
      className="border-line bg-surface hover:border-ink-4 flex min-h-[252px] flex-col gap-[18px] rounded-lg border p-6 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display truncate text-[24px] leading-[1.1] tracking-[-0.02em]">
            {room.name}
          </div>
          <div className="text-ink-3 mt-1.5 font-mono text-[12px]">
            создан {createdFmt.format(room.createdAt).replace(".", "")}
          </div>
        </div>
        <span className="rounded-pill bg-accent-soft text-accent shrink-0 px-2.5 py-1 text-[12px] font-medium">
          {room.memberCount}{" "}
          {pluralize(room.memberCount, "ученик", "ученика", "учеников")}
        </span>
      </div>

      {room.members.length > 0 && (
        <div className="flex items-center">
          {room.members.map((m, i) => (
            <span
              key={i}
              className={`grid h-[34px] w-[34px] place-items-center rounded-full text-[12px] font-semibold ${avatarTone(m.email || String(i))}`}
              style={{ marginRight: -8, border: "2px solid var(--color-surface)" }}
            >
              {getInitials(m.name, m.email)}
            </span>
          ))}
          {extra > 0 && (
            <span
              className="bg-surface-2 text-ink-3 grid h-[34px] w-[34px] place-items-center rounded-full text-[12px] font-semibold"
              style={{ border: "2px solid var(--color-surface)" }}
            >
              +{extra}
            </span>
          )}
        </div>
      )}

      <div className="flex-1" />

      <div>
        <div className="text-ink-3 mb-2 flex justify-between text-[12.5px]">
          <span>Активны за неделю</span>
          <span className="font-mono">
            <span className="text-ink font-medium">{room.activeThisWeek}</span> /{" "}
            {room.memberCount}
          </span>
        </div>
        <div className="bg-surface-2 rounded-pill h-1.5 overflow-hidden">
          <div
            className="bg-accent rounded-pill h-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="border-line flex items-center justify-between border-t pt-4">
        <span className="text-ink-4 text-[12.5px]">
          {room.lastActivityAt
            ? `активность ${relativeDay(room.lastActivityAt)}`
            : "нет активности"}
        </span>
        <span className="text-accent text-[14px] font-medium">Открыть →</span>
      </div>
    </Link>
  );
}
