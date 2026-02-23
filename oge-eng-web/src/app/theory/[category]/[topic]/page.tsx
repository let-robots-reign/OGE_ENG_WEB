import { theoryTopics, type CategorySlug } from "@/app/data/theory-topics";
import { theoryContent } from "@/app/data/theory-content";
import { notFound } from "next/navigation";
import styles from "./TheoryTopicPage.module.css";
import { BackButton } from "@/app/_components/BackButton";

export function generateStaticParams() {
  const params: { category: CategorySlug; topic: string }[] = [];
  for (const category in theoryTopics) {
    const categorySlug = category as CategorySlug;
    theoryTopics[categorySlug].topics.forEach((topic) => {
      if (theoryContent[topic.id]) {
        params.push({ category: categorySlug, topic: topic.id });
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
  const { topic } = await params;
  const content = theoryContent[topic];

  if (!content) {
    notFound();
  }

  const topicData = Object.values(theoryTopics)
    .flatMap((category) => category.topics)
    .find((t) => t.id === topic);

  return (
    <main className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>{topicData?.title}</h1>
      <div className={styles.content}>{content}</div>
    </main>
  );
}
