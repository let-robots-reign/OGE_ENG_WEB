import { PageHeader } from "./page-header";
import { TaskCard } from "./task-card";
import { InfoCard } from "./info-card";
import {
  AUDIO_META,
  AUDIO_EXAM,
  AUDIO_INFO,
  NOT_COMPLETED_TOPICS,
  type Topic,
} from "./data";

interface AudioTasksViewProps {
  topics: Topic[];
  trainingKey: string;
}

export function AudioTasksView({ topics, trainingKey }: AudioTasksViewProps) {
  return (
    <>
      <PageHeader
        title="Аудирование"
        desc="11 заданий на понимание прослушанных текстов. Рекомендуемое время на весь раздел — 30 минут. Каждую запись можно слушать дважды."
        // TODO: implement
        // stats={[
        //   { label: "ПРОГРЕСС", value: "62%", suffix: "· выполнено" },
        //   { label: "ОШИБОК", value: "42", suffix: "· к разбору" },
        // ]}
        stats={[]}
      />

      <div className="flex flex-col gap-3.5">
        {topics.map((topic) => {
          const meta = AUDIO_META[topic.title];
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
        <TaskCard {...AUDIO_EXAM} exam />
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AUDIO_INFO.map((c) => (
          <InfoCard key={c.title} tag={c.tag} title={c.title} body={c.body} />
        ))}
      </div>
    </>
  );
}
