import { theoryTopics, type CategorySlug } from "@/app/data/theory-topics";
import { theoryContent } from "@/app/data/theory-content";
import { notFound } from "next/navigation";
import styles from "./TheoryTopicPage.module.css";
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
            <div className={styles.content}>{content}</div>
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
