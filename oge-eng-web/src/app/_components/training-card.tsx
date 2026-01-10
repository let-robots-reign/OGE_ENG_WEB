import Image from "next/image";
import styles from "./TrainingCard.module.css";

interface TrainingCardProps {
  title: string;
  image: string;
  progress?: number;
}

export function TrainingCard({ title, image }: TrainingCardProps) {
  return (
    <div className={`${styles.card} ${styles.trainingCard}`}>
      <div className={styles.trainingCard__left}>
        <Image
          className={styles.trainingCard__image}
          src={`/card-icons/${image}`}
          alt={title}
          width={80}
          height={80}
        />
      </div>
      <div className={styles.trainingCard__center}>{title}</div>
    </div>
  );
}
