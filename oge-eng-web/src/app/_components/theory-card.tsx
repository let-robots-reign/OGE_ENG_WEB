import Image from "next/image";
import styles from "./TheoryCard.module.css";

interface TheoryCardProps {
  title: string;
  image: string;
};

export function TheoryCard({ title, image }: TheoryCardProps) {
  return (
    <div className={`${styles.card} ${styles.theoryCard}`}>
      <div className={styles.theoryCard__left}>
        <Image
          className={styles.theoryCard__image}
          src={`/card-icons/${image}`}
          alt={title}
          width={80}
          height={80}
        />
      </div>
      <div className={styles.theoryCard__center}>{title}</div>
    </div>
  );
}
