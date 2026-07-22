import { PageHeader } from "./page-header";
import { FeaturedAllTopics } from "./featured-all-topics";
import { TopicRow } from "./topic-row";
import { InfoCard } from "./info-card";
import { UOE_META, UOE_INFO, type Topic, type UoeMeta } from "./data";

const UOE_META_FALLBACK: UoeMeta = {
  en: "",
  desc: "Грамматическое задание с открытым ответом.",
  items: 15,
  sample: null,
  score: null,
  mistakes: 0,
};

interface UseOfEnglishViewProps {
  topics: Topic[];
  trainingKey: string;
}

export function UseOfEnglishView({
  topics,
  trainingKey,
}: UseOfEnglishViewProps) {
  const featuredTopic = topics.find((t) => t.title === "По всем темам");
  const grammarTopics = topics.filter((t) => t.title !== "По всем темам");

  return (
    <>
      <PageHeader
        title="Языковой материал"
        desc="Грамматика и словообразование: 15 заданий с открытым ответом. Тренируйтесь по отдельным темам или по всем сразу — без подсказок, с разбором ошибок."
        // TODO: implement
        // stats={[
        //   { label: "ПРОГРЕСС", value: "54%", suffix: "· выполнено" },
        //   { label: "ОШИБОК", value: "42", suffix: "· к разбору" },
        // ]}
        stats={[]}
      />

      {featuredTopic && (
        <FeaturedAllTopics
          topicId={featuredTopic.id}
          desc="10 случайных заданий из всех тем раздела. Подходит для финальной отработки перед экзаменом."
        />
      )}

      <div className="flex flex-col gap-3">
        {grammarTopics.map((topic) => {
          const meta = {
            ...(UOE_META[topic.title] ?? UOE_META_FALLBACK),
            score: topic.score !== undefined ? topic.score : null,
          };
          const href = `/training/${trainingKey}?topic=${topic.id}`;
          return (
            <TopicRow key={topic.id} topic={topic} meta={meta} href={href} />
          );
        })}
      </div>

      {/* Decorative — non-interactive. TODO: implement */}
      {/*<ReviewBanner />*/}

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {UOE_INFO.map((c) => (
          <InfoCard key={c.title} tag={c.tag} title={c.title} body={c.body} />
        ))}
      </div>
    </>
  );
}
