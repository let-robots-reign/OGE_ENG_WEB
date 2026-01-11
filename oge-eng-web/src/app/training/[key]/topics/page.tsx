import { BackButton } from "@/app/_components/BackButton";
import { MenuListItem } from "@/app/_components/MenuListItem";
import { api } from "@/trpc/server";
import styles from "./page.module.css";

// This function tells Next.js which `key` values to pre-build
export async function generateStaticParams() {
  return [{ key: "audio" }, { key: "reading" }, { key: "use-of-english" }];
}

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
      <BackButton />
      <div className={styles.menu__list}>
        {topics.map((topic) => (
          <MenuListItem
            key={topic.id}
            topic={topic}
            baseClickLink={`/training/${key}`}
          />
        ))}
      </div>
    </div>
  );
}
