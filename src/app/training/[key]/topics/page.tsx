import { api } from "@/trpc/server";
import { SectionSubHeader } from "@/app/_components/training/shared/training-sub-header";
import { AudioTasksView } from "@/app/_components/training/audio-tasks-view";
import { ReadingTasksView } from "@/app/_components/training/reading-tasks-view";
import { UseOfEnglishView } from "@/app/_components/training/use-of-english-view";

const SECTION_META: Record<string, { section: string; title: string }> = {
  audio: { section: "раздел 1 · listening", title: "Аудирование" },
  reading: { section: "раздел 2 · reading", title: "Чтение" },
  "use-of-english": {
    section: "раздел 3 · use of english",
    title: "Языковой материал",
  },
};

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  const topics = await api.training.getTopicsByCategory({ category: key });

  let content: React.ReactNode = null;
  if (key === "audio") {
    content = <AudioTasksView topics={topics} trainingKey={key} />;
  } else if (key === "reading") {
    content = <ReadingTasksView topics={topics} trainingKey={key} />;
  } else if (key === "use-of-english") {
    content = <UseOfEnglishView topics={topics} trainingKey={key} />;
  }

  const meta = SECTION_META[key];

  return (
    <>
      {meta && <SectionSubHeader section={meta.section} title={meta.title} />}
      <div className="px-5 pt-8 pb-16 sm:px-8 lg:px-14">{content}</div>
    </>
  );
}
