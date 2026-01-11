import Link from "next/link";
import styles from "./MenuListItem.module.css";

type MenuListItemProps = {
  title: string;
  baseClickLink: string;
};

export function MenuListItem({ title, baseClickLink }: MenuListItemProps) {
  const itemClickLink = `${baseClickLink}?topic=${encodeURIComponent(title)}`;

  return (
    <Link href={itemClickLink}>
      <div className={`${styles.card} ${styles.menuItem}`}>
        <p className={styles.menuItem__title}>{title}</p>
      </div>
    </Link>
  );
}
