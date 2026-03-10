import Image from "next/image";
import styles from "./TrainingCard.module.css";
import clsx from "clsx";

interface TrainingCardProps {
  title: string;
  image: string;
  progress?: number;
  className?: string;
}

export function TrainingCard({ title, image, className }: TrainingCardProps) {
  return (
    <div className={clsx(styles.card, styles.trainingCard, className)}>
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
