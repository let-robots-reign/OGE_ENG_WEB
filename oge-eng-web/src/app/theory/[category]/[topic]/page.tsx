import { theoryTopics, type CategorySlug } from "@/app/data/theory-topics";
import { theoryContent } from "@/app/data/theory-content";
import { notFound } from "next/navigation";
import styles from "./TheoryTopicPage.module.css";
import { BackButton } from "@/app/_components/BackButton";
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

  const topicData = theoryTopics[category]?.topics.find((t) => t.id === topic);

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
    <main className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>{topicData.title}</h1>
      <div className={styles.content}>{content}</div>
      {trainingTopic && (
        <Link
          href={`/training/use-of-english?topic=${trainingTopic.id}`}
          className={styles.trainingButton}
        >
          Перейти к упражнениям на тему &quot;{trainingTopic.title}&quot;
        </Link>
      )}
    </main>
  );
}
