import Link from "next/link";
import styles from "./MenuListItem.module.css";
import clsx from "clsx";

type Topic = {
  id: number;
  title: string;
  category: string;
  isActive: boolean;
};

type MenuListItemProps = {
  topic: Topic;
  baseClickLink: string;
  isNotCompleted: boolean;
};

export function MenuListItem({
  topic,
  baseClickLink,
  isNotCompleted,
}: MenuListItemProps) {
  const itemClickLink = `${baseClickLink}?topic=${topic.id}`;

  const menuListItemContent = (
    <div
      className={clsx(
        `${styles.card} ${styles.menuItem}`,
        isNotCompleted && styles.isNotCompleted,
      )}
    >
      <p className={styles.menuItem__title}>{topic.title}</p>
      {isNotCompleted && (
        <span className={styles.isNotCompletedText}>в разработке</span>
      )}
    </div>
  );

  return (
    isNotCompleted ? (
      <div>{menuListItemContent}</div>
    ) : <Link href={itemClickLink}>{menuListItemContent}</Link>
  );
}
