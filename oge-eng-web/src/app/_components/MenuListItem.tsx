import Link from "next/link";
import styles from "./MenuListItem.module.css";

type Topic = {
  id: number;
  title: string;
  category: string;
  isActive: boolean;
};

type MenuListItemProps = {
  topic: Topic;
  baseClickLink: string;
};

export function MenuListItem({ topic, baseClickLink }: MenuListItemProps) {
  const itemClickLink = `${baseClickLink}?topic=${topic.id}`;

  return (
    <Link href={itemClickLink}>
      <div className={`${styles.card} ${styles.menuItem}`}>
        <p className={styles.menuItem__title}>{topic.title}</p>
      </div>
    </Link>
  );
}
