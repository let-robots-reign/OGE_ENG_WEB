import { api } from "@/trpc/server";
import { ClassroomCard } from "@/app/_components/teacher/classroom-card";
import { CreateClassroomModal } from "@/app/_components/teacher/create-classroom-modal";
import { pluralize } from "@/app/_utils/pluralize";

export default async function TeacherPage() {
  const rooms = await api.teacher.listClassrooms();

  const totalStudents = rooms.reduce((sum, r) => sum + r.memberCount, 0);
  const totalActive = rooms.reduce((sum, r) => sum + r.activeThisWeek, 0);

  return (
    <div className="px-5 pt-8 pb-16 sm:px-8 lg:px-14">
      <div className="mb-[30px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-ink-3 inline-flex items-center gap-2 text-[12.5px] font-medium tracking-[0.12em] uppercase">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
            Кабинет учителя
          </div>
          <h1 className="font-display mt-3.5 text-[36px] leading-none tracking-[-0.03em] sm:text-[48px]">
            Мои классы
          </h1>
          {rooms.length > 0 && (
            <div className="text-ink-3 mt-3 text-[14.5px]">
              {rooms.length}{" "}
              {pluralize(rooms.length, "класс", "класса", "классов")} ·{" "}
              {totalStudents}{" "}
              {pluralize(totalStudents, "ученик", "ученика", "учеников")} ·{" "}
              {totalActive} активны за неделю
            </div>
          )}
        </div>
        {rooms.length > 0 && <CreateClassroomModal variant="button" />}
      </div>

      {rooms.length === 0 ? (
        <div className="border-line bg-surface flex flex-col items-center rounded-lg border px-6 py-20 text-center">
          <span className="bg-accent-soft text-accent grid h-[76px] w-[76px] place-items-center rounded-full">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
            </svg>
          </span>
          <h2 className="font-display mt-5 text-[28px] tracking-[-0.02em]">
            У вас пока нет классов
          </h2>
          <p className="text-ink-3 mt-3 max-w-[420px] text-[15px] leading-[1.55]">
            Создайте класс, чтобы получить ссылку-приглашение и видеть прогресс
            своих учеников — активность, средние баллы и результаты пробников.
          </p>
          <div className="mt-6">
            <CreateClassroomModal variant="button" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <ClassroomCard key={room.id} room={room} />
          ))}
          <CreateClassroomModal variant="card" />
        </div>
      )}
    </div>
  );
}
