import { theoryTopics, type CategorySlug } from "@/app/data/theory-topics";
import { theoryContent } from "@/app/data/theory-content";
import { notFound } from "next/navigation";
import { SectionSubHeader } from "@/app/_components/training/shared/training-sub-header";
import { api } from "@/trpc/server";
import Link from "next/link";

export function generateStaticParams() {
  const params: { category: CategorySlug; topic: string }[] = [];
  for (const category in theoryTopics) {
    (theoryTopics[category]?.topics ?? []).forEach((topic) => {
      if (theoryContent[topic.id]) {
        params.push({ category, topic: topic.id });
      }
    });
  }
  return params;
}

interface TheoryTopicPageProps {
  params: Promise<{
    category: CategorySlug;
    topic: string;
  }>;
}

export default async function TheoryTopicPage({
  params,
}: TheoryTopicPageProps) {
  const { category, topic } = await params;
  const content = theoryContent[topic];

  const categoryData = theoryTopics[category];
  const topicData = categoryData?.topics.find((t) => t.id === topic);

  if (!content || !topicData) {
    notFound();
  }

  let trainingTopic;

  if (topicData.trainingTopicTitle) {
    trainingTopic = await api.training.getTopicByTopicTitle(
      topicData.trainingTopicTitle,
    );
  }

  return (
    <>
      <SectionSubHeader
        section={`теория · ${categoryData?.title ?? ""}`}
        title={topicData.title}
        backHref={`/theory/${category}`}
      />
      <div className="px-5 pt-8 pb-16 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="bg-surface border-line rounded-lg border p-5 sm:p-8">
            <div className="text-ink-2 text-[1.1rem] leading-[1.6] [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_h2]:mt-4 [&_h2]:mb-4 [&_h2]:text-[1.8rem] [&_h2]:font-bold [&_h2]:text-ink [&_h5]:mb-2 [&_h5]:text-[26px] [&_h5]:leading-[32px] [&_h5]:font-bold [&_h5]:text-ink [&_ol]:mb-4 [&_ol]:ml-8 [&_ol]:list-decimal [&_p]:mb-4 [&_table]:my-7 [&_table]:w-full [&_table]:border [&_table]:border-line-2 [&_table]:text-center max-[768px]:[&_table]:block max-[768px]:[&_table]:overflow-x-auto max-[768px]:[&_table]:whitespace-nowrap [&_td]:border [&_td]:border-line-2 [&_td]:p-2 [&_th]:border [&_th]:border-line-2 [&_th]:p-2 [&_ul]:mb-4 [&_ul]:ml-8 [&_ul]:list-disc [&_.affirmative]:text-ok [&_.negative]:text-err [&_.question]:text-ink-4 [&_.tense-table]:border-none [&_.tense-table_td]:border-none [&_.tense-table_th]:border-none">
              {content}
            </div>
          </div>
          {trainingTopic && (
            <Link
              href={`/training/use-of-english?topic=${trainingTopic.id}`}
              className="bg-ink text-on-ink mt-4 flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-[15px] font-semibold no-underline transition-opacity hover:opacity-90"
            >
              Перейти к упражнениям на тему &quot;{trainingTopic.title}&quot;
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
