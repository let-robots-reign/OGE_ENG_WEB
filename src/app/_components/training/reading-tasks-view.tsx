import { PageHeader } from "./page-header";
import { TaskCard } from "./task-card";
import { InfoCard } from "./info-card";
import { GenreStrip } from "./genre-strip";
import {
  READING_META,
  READING_EXAM,
  READING_INFO,
  NOT_COMPLETED_TOPICS,
  type Topic,
} from "./data";

interface ReadingTasksViewProps {
  topics: Topic[];
  trainingKey: string;
}

export function ReadingTasksView({
  topics,
  trainingKey,
}: ReadingTasksViewProps) {
  return (
    <>
      <PageHeader
        title="Чтение"
        desc="8 заданий на понимание прочитанных текстов. Рекомендуемое время на весь раздел — 30 минут. Тренируйтесь по типам или пройдите весь раздел в режиме экзамена."
        // TODO: implement
        // stats={[
        //   { label: "ЗАДАНИЙ ВЫПОЛНЕНО", value: "54%" },
        //   { label: "ОШИБОК", value: "42", suffix: "· к разбору" },
        // ]}
        stats={[]}
      />

      <div className="flex flex-col gap-3.5">
        {topics.map((topic) => {
          const meta = READING_META[topic.title];
          const disabled = (NOT_COMPLETED_TOPICS as readonly string[]).includes(
            topic.title,
          );
          const href = `/training/${trainingKey}?topic=${topic.id}`;
          return (
            <TaskCard
              key={topic.id}
              kicker={meta?.kicker ?? ""}
              range={meta?.range ?? topic.title}
              title={meta?.title ?? topic.title}
              desc={meta?.desc ?? ""}
              type={meta?.type ?? ""}
              items={meta?.items ?? 0}
              time={meta?.time ?? ""}
              progress={disabled ? null : (topic.progress ?? null)}
              href={disabled ? undefined : href}
              disabled={disabled}
            />
          );
        })}

        {/* Decorative exam card — non-interactive. TODO: implement */}
        <TaskCard {...READING_EXAM} exam />
      </div>

      <GenreStrip />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {READING_INFO.map((c) => (
          <InfoCard key={c.title} tag={c.tag} title={c.title} body={c.body} />
        ))}
      </div>
    </>
  );
}
