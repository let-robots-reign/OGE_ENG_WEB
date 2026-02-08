import { theoryTopics, type CategorySlug } from "@/app/data/theory-topics";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./TheoryCategoryPage.module.css";
import { BackButton } from "@/app/_components/BackButton";

export function generateStaticParams() {
  return Object.keys(theoryTopics).map((category) => ({
    category,
  }));
}

interface TheoryCategoryPageProps {
  params: Promise<{
    category: CategorySlug;
  }>;
}

export default async function TheoryCategoryPage({
  params,
}: TheoryCategoryPageProps) {
  const { category } = await params;
  const categoryData = theoryTopics[category];

  if (!categoryData) {
    notFound();
  }

  return (
    <main className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>{categoryData.title}</h1>
      <div className={styles.grid}>
        {categoryData.topics.map((topic) => (
          <Link
            href={`/theory/${category}/${topic.id}`}
            key={topic.id}
            className={styles.card}
          >
            <h2 className={styles.cardTitle}>{topic.title}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
