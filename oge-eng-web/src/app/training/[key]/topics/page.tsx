import { BackButton } from "@/app/_components/BackButton";
import { MenuListItem } from "@/app/_components/MenuListItem";
import { api } from "@/trpc/server";
import styles from "./page.module.css";

// this function tells Next.js which `key` values to pre-build
export async function generateStaticParams() {
  return [{ key: "audio" }, { key: "reading" }, { key: "use-of-english" }];
}

const NOT_COMPLETED_TOPICS = ["Задание 5", "Задания 6-11", "Задания 13-19"];

export default async function TopicsPage({
  params,
}: {
  params: Promise<{
    key: string;
  }>;
}) {
  const { key } = await params;

  const topics = await api.training.getTopicsByCategory({
    category: key,
  });

  return (
    <div className={styles.menu}>
      <div className={styles.menu__list}>
        <BackButton />
        {topics.map((topic) => (
          <MenuListItem
            key={topic.id}
            topic={topic}
            baseClickLink={`/training/${key}`}
            isNotCompleted={NOT_COMPLETED_TOPICS.includes(topic.title)}
          />
        ))}
      </div>
    </div>
  );
}
